import { getCurrentUser, signInWithGoogle, signOut, onAuthChange } from '../auth';
import { navigate } from '../router';
import type { User } from '@supabase/supabase-js';

// Module-level references persist across re-renders.
let _docClickHandler: ((e: MouseEvent) => void) | null = null;
let _mobileOverlay: HTMLElement | null = null;

function getMobileOverlay(): HTMLElement {
  if (!_mobileOverlay) {
    _mobileOverlay = document.createElement('div');
    _mobileOverlay.className = 'mobile-profile-overlay';
    document.body.appendChild(_mobileOverlay);
  }
  return _mobileOverlay;
}

function hideOverlay() {
  if (_mobileOverlay) {
    _mobileOverlay.classList.remove('mobile-profile-overlay--visible');
    _mobileOverlay.onclick = null;
  }
}

export async function createHeader(): Promise<HTMLElement> {
  const header = document.createElement('header');
  header.className = 'header';
  header.id = 'main-header';

  const user = await getCurrentUser();
  renderHeader(header, user);

  // Listen for auth changes
  onAuthChange((u) => renderHeader(header, u));

  return header;
}

function renderHeader(header: HTMLElement, user: User | null) {
  header.innerHTML = `
    <div class="header__inner">
      <a href="#/" class="header__logo" id="logo-link">
        <span class="header__logo-icon">🏆</span>
        <span class="header__logo-text">
          <span class="logo-text-top">JUNUB</span>
          <span class="logo-text-bottom">TALENT AWARDS</span>
        </span>
      </a>
      <nav class="header__nav">
        <a href="#/" class="header__nav-link" id="nav-home">Home</a>
        <a href="#/results" class="header__nav-link" id="nav-results">Results</a>
      </nav>
      <div class="header__auth">
        ${user
          ? `
            <div class="header__user" id="user-profile-menu">
              <img
                class="header__avatar"
                src="${user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=7c3aed&color=fff`}"
                alt="${user.user_metadata?.full_name || user.email}"
              />
              <span class="header__user-name">${user.user_metadata?.full_name || user.email}</span>

              <div class="profile-dropdown" id="profile-dropdown">
                <div class="profile-dropdown__header">
                  <strong>${user.user_metadata?.full_name || 'Voter'}</strong>
                  <span>${user.email}</span>
                </div>
                <div class="profile-dropdown__actions">
                  <button class="profile-dropdown__btn" id="btn-profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Your profile &amp; votes
                  </button>
                  <button class="profile-dropdown__btn" id="btn-invite-friends">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    Invite a friend to vote
                  </button>
                  <button class="profile-dropdown__btn profile-dropdown__btn--danger" id="btn-signout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          `
          : `
            <button class="header__btn header__btn--login" id="btn-signin">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          `
        }
      </div>
    </div>
  `;

  // Event listeners
  const signInBtn = header.querySelector('#btn-signin');
  if (signInBtn) {
    signInBtn.addEventListener('click', async () => {
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error('Sign-in failed:', err);
      }
    });
  }

  const signOutBtn = header.querySelector('#btn-signout');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      hideOverlay();
      try {
        await signOut();
        navigate('/');
      } catch (err) {
        console.error('Sign-out failed:', err);
      }
    });
  }

  // Profile dropdown toggle
  const userMenu = header.querySelector('#user-profile-menu');
  const dropdown = header.querySelector('#profile-dropdown');

  if (userMenu && dropdown) {
    userMenu.addEventListener('click', (e) => {
      // Don't toggle if clicking inside the dropdown contents
      if ((e.target as HTMLElement).closest('.profile-dropdown')) return;

      const isOpen = dropdown.classList.toggle('profile-dropdown--open');
      const overlay = getMobileOverlay();

      if (isOpen) {
        overlay.classList.add('mobile-profile-overlay--visible');
        overlay.onclick = () => {
          dropdown.classList.remove('profile-dropdown--open');
          hideOverlay();
        };
      } else {
        hideOverlay();
      }
    });

    // Desktop: close on click outside (overlay handles mobile)
    if (_docClickHandler) {
      document.removeEventListener('click', _docClickHandler);
    }
    _docClickHandler = (e: MouseEvent) => {
      if (!userMenu.contains(e.target as Node)) {
        dropdown.classList.remove('profile-dropdown--open');
        hideOverlay();
      }
    };
    document.addEventListener('click', _docClickHandler);
  }

  // Profile button
  const profileBtn = header.querySelector('#btn-profile');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      dropdown?.classList.remove('profile-dropdown--open');
      hideOverlay();
      navigate('/profile');
    });
  }

  // Invite friends logic
  const inviteBtn = header.querySelector('#btn-invite-friends');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'Junub Talent Awards',
        text: 'Join me in voting at the Junub Talent Awards!',
        url: window.location.origin
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
        }
      } catch (err) {
        console.error('Share failed:', err);
      }
      dropdown?.classList.remove('profile-dropdown--open');
      hideOverlay();
    });
  }
}
