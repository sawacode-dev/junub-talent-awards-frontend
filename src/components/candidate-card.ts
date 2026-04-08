import type { Candidate } from '../api';

export interface CandidateCardOptions {
  candidate: Candidate;
  rank: number;
  hasVoted: boolean;
  votedCandidateId?: string;
  onVote: (candidateId: string) => void;
}

export function createCandidateCard(options: CandidateCardOptions): HTMLElement {
  const { candidate, rank, hasVoted, votedCandidateId, onVote } = options;
  const isThisVoted = votedCandidateId === candidate.id;

  const card = document.createElement('div');
  card.className = `candidate-card ${isThisVoted ? 'candidate-card--voted' : ''} ${rank <= 3 ? 'candidate-card--top' : ''}`;
  card.id = `candidate-${candidate.id}`;

  const rankBadge = rank <= 3
    ? `<span class="candidate-card__rank candidate-card__rank--${rank}">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>`
    : `<span class="candidate-card__rank">#${rank}</span>`;

  card.innerHTML = `
    <div class="candidate-card__image-wrapper">
      <img
        class="candidate-card__image"
        src="${candidate.image_url}"
        alt="${candidate.name}"
        loading="lazy"
      />
      ${rankBadge}
    </div>
    <div class="candidate-card__info">
      <h3 class="candidate-card__name">${candidate.name}</h3>
      <p class="candidate-card__bio">${candidate.bio}</p>
      <div class="candidate-card__stats">
        <span class="candidate-card__votes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${candidate.vote_count.toLocaleString()} votes
        </span>
      </div>
      ${isThisVoted
        ? `<button class="candidate-card__btn candidate-card__btn--voted" disabled>
            <span>✓</span> Your Vote
          </button>`
        : hasVoted
          ? `<button class="candidate-card__btn candidate-card__btn--disabled" disabled>
              Vote Locked
            </button>`
          : `<button class="candidate-card__btn candidate-card__btn--vote" id="vote-btn-${candidate.id}">
              <span>🗳️</span> Cast Vote
            </button>`
      }
    </div>
  `;

  const voteBtn = card.querySelector(`#vote-btn-${candidate.id}`);
  if (voteBtn) {
    voteBtn.addEventListener('click', () => onVote(candidate.id));
  }

  return card;
}
