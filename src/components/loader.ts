export function createLoader(): HTMLElement {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = `
    <div class="loader__spinner">
      <div class="loader__ring"></div>
      <div class="loader__ring"></div>
      <div class="loader__ring"></div>
    </div>
    <p class="loader__text">Loading...</p>
  `;
  return loader;
}

export function showPageLoader(container: HTMLElement) {
  container.innerHTML = '';
  container.appendChild(createLoader());
}
