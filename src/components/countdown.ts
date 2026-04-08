/**
 * Countdown timer component.
 * Displays time remaining until user can vote again in a category.
 */
export function createCountdown(nextVoteAt: Date, onExpired?: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'countdown';

  let intervalId: number;

  function update() {
    const now = new Date().getTime();
    const target = nextVoteAt.getTime();
    const diff = target - now;

    if (diff <= 0) {
      container.innerHTML = `
        <div class="countdown__ready">
          <span class="countdown__icon">🗳️</span>
          <span class="countdown__label">You can vote again!</span>
        </div>
      `;
      container.classList.add('countdown--ready');
      clearInterval(intervalId);
      if (onExpired) onExpired();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    container.innerHTML = `
      <div class="countdown__timer">
        <span class="countdown__icon">⏳</span>
        <span class="countdown__label">Vote again in</span>
        <div class="countdown__digits">
          <div class="countdown__unit">
            <span class="countdown__value">${String(hours).padStart(2, '0')}</span>
            <span class="countdown__unit-label">hrs</span>
          </div>
          <span class="countdown__separator">:</span>
          <div class="countdown__unit">
            <span class="countdown__value">${String(minutes).padStart(2, '0')}</span>
            <span class="countdown__unit-label">min</span>
          </div>
          <span class="countdown__separator">:</span>
          <div class="countdown__unit">
            <span class="countdown__value">${String(seconds).padStart(2, '0')}</span>
            <span class="countdown__unit-label">sec</span>
          </div>
        </div>
      </div>
    `;
  }

  update();
  intervalId = window.setInterval(update, 1000);

  return container;
}
