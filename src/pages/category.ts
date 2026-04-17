import {
  fetchCategories,
  fetchCandidates,
  fetchUserVoteForCategory,
  castVote,
} from '../api';
import type { Category, Candidate } from '../api';
import { getCurrentUser, signInWithGoogle } from '../auth';
import { createCandidateCard } from '../components/candidate-card';
import { createCountdown } from '../components/countdown';
import { showPageLoader } from '../components/loader';
import { showToast } from '../components/toast';
import { navigate } from '../router';
import confetti from 'canvas-confetti';

export async function renderCategoryPage(container: HTMLElement, slug: string) {
  showPageLoader(container);

  try {
    const categories = await fetchCategories();
    const category = categories.find((c: Category) => c.slug === slug);

    if (!category) {
      container.innerHTML = `
        <div class="error-state">
          <span class="error-state__icon">🔍</span>
          <h2>Category not found</h2>
          <p>The category "${slug}" doesn't exist.</p>
          <button class="btn btn--primary" id="back-home-btn">Back to Home</button>
        </div>
      `;
      container.querySelector('#back-home-btn')?.addEventListener('click', () => navigate('/'));
      return;
    }

    const user = await getCurrentUser();
    const [candidates, userVote] = await Promise.all([
      fetchCandidates(category.id),
      fetchUserVoteForCategory(category.id),
    ]);

    // Determine if within 24h cooldown
    let hasVoted = false;
    let nextVoteAt: Date | null = null;
    if (userVote) {
      const votedAt = new Date(userVote.voted_at);
      const cooldownEnd = new Date(votedAt.getTime() + 24 * 60 * 60 * 1000);
      if (cooldownEnd > new Date()) {
        hasVoted = true;
        nextVoteAt = cooldownEnd;
      }
    }

    container.innerHTML = '';

    // Page header
    const pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML = `
      <button class="page-header__back" id="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>
      <div class="page-header__title-group">
        <span class="page-header__icon">${category.icon}</span>
        <h1 class="page-header__title">${category.name}</h1>
      </div>
      <p class="page-header__subtitle">${category.description}</p>
    `;
    container.appendChild(pageHeader);
    pageHeader.querySelector('#back-btn')?.addEventListener('click', () => navigate('/'));

    // Auth warning
    if (!user) {
      const authWarning = document.createElement('div');
      authWarning.className = 'auth-warning';
      authWarning.innerHTML = `
        <span class="auth-warning__icon">🔒</span>
        <p>Sign in with Google to cast your vote</p>
      `;
      container.appendChild(authWarning);
    }

    // Countdown timer
    if (hasVoted && nextVoteAt) {
      const countdownEl = createCountdown(nextVoteAt, () => {
        // Refresh when countdown expires
        renderCategoryPage(container, slug);
      });
      container.appendChild(countdownEl);
    }

    // Candidates grid
    if (candidates.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <span class="empty-state__icon">📭</span>
        <h2>No Candidates Yet</h2>
        <p>There are currently no nominees for this category. Check back soon!</p>
      `;
      container.appendChild(emptyState);
    } else {
      const grid = document.createElement('div');
      grid.className = 'candidates-grid';

      candidates.forEach((candidate: Candidate, index: number) => {
        const card = createCandidateCard({
          candidate,
          rank: index + 1,
          hasVoted,
          votedCandidateId: hasVoted ? userVote?.candidate_id : undefined,
          onVote: async (candidateId: string) => {
            if (!user) {
              // Trigger sign-in for unauthenticated users as requested
              try {
                await signInWithGoogle();
              } catch (err) {
                showToast('Sign-in failed. Please try again.', 'error');
                console.error(err);
              }
              return;
            }

            const btn = card.querySelector(`#vote-btn-${candidateId}`) as HTMLButtonElement;
            if (btn) {
              btn.disabled = true;
              btn.innerHTML = '<span class="btn-spinner"></span> Voting...';
            }

            try {
              const result = await castVote(candidateId, category.id);
              if (result.success) {
                // Celebrate!
                launchConfetti();
                
                // Transition to success state
                renderSuccessState(container, candidate.name);
              } else {
                showToast(result.error || 'Vote failed', 'error');
                if (btn) {
                  btn.disabled = false;
                  btn.innerHTML = '<span>🗳️</span> Cast Vote';
                }
              }
            } catch (err) {
              showToast('Failed to cast vote. Please try again.', 'error');
              if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span>🗳️</span> Cast Vote';
              }
              console.error(err);
            }
          },
        });
        grid.appendChild(card);
      });

      container.appendChild(grid);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <span class="error-state__icon">⚠️</span>
        <h2>Something went wrong</h2>
        <p>Could not load candidates. Please try again.</p>
        <button class="btn btn--primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    console.error(err);
  }
}

function renderSuccessState(container: HTMLElement, candidateName: string) {
  container.innerHTML = `
    <div class="success-card">
      <span class="success-card__icon">🎉</span>
      <h1 class="success-card__title">Vote Recorded!</h1>
      <p class="success-card__message">You successfully cast your vote for <strong>${candidateName}</strong>. Your vote has been recorded for the Junub Talent Awards.</p>
      
      <div class="success-card__reminder" style="margin-bottom: var(--space-md);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Ready to vote again in 24 hours
      </div>

      <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--color-text); margin-bottom: var(--space-sm);">Invite friends to help support ${candidateName}:</h3>
      <div class="success-card__share-group">
        <button id="success-share-native-btn" class="btn btn--primary" style="flex: 1; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          Share
        </button>
        <a href="https://wa.me/?text=${encodeURIComponent(`I just voted for ${candidateName} at the Junub Talent Awards. Cast your vote here: ${window.location.origin}`)}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="btn btn--whatsapp">
          WhatsApp
        </a>
      </div>

      <button class="btn success-card__btn" style="background: rgba(255,255,255,0.1); color: var(--color-text);" id="success-done-btn">Back to Categories</button>
    </div>
  `;

  // Native share integration
  container.querySelector('#success-share-native-btn')?.addEventListener('click', async () => {
    const shareData = {
      title: 'Junub Talent Awards',
      text: `I just voted for ${candidateName} at the Junub Talent Awards!`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to Facebook if native share isn't supported (since we removed the separate fb button)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  });

  container.querySelector('#success-done-btn')?.addEventListener('click', () => {
    navigate('/');
  });
}

function launchConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}
