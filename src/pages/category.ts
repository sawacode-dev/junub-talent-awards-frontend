import {
  fetchCategories,
  fetchCandidates,
  fetchUserVoteForCategory,
  castVote,
} from '../api';
import type { Category, Candidate } from '../api';
import { getCurrentUser } from '../auth';
import { createCandidateCard } from '../components/candidate-card';
import { createCountdown } from '../components/countdown';
import { showPageLoader } from '../components/loader';
import { showToast } from '../components/toast';
import { navigate } from '../router';

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
    const grid = document.createElement('div');
    grid.className = 'candidates-grid';

    candidates.forEach((candidate: Candidate, index: number) => {
      const card = createCandidateCard({
        candidate,
        rank: index + 1,
        hasVoted,
        votedCandidateId: userVote?.candidate_id,
        onVote: async (candidateId: string) => {
          if (!user) {
            showToast('Please sign in with Google first', 'error');
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
              showToast(`You voted for ${candidate.name}! 🎉`, 'success');
              // Trigger confetti
              launchConfetti();
              // Re-render page to show updated state
              setTimeout(() => renderCategoryPage(container, slug), 1500);
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

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const particles: Array<{
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; rotation: number; rotationSpeed: number;
  }> = [];

  const colors = ['#ff0080', '#ff8c00', '#00f2ff', '#00ffa3', '#ff3d00', '#7c3aed'];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    frame++;
    if (frame < 120) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}
