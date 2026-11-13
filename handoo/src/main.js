import { BRAND_NAME } from './brand.js';
import './data.js';
import './vocabulary.js';
import { ProgressStore } from './progress.js';
import { ReviewStore } from './review-store.js';
import { createReviewController } from './review-ui.js';
import { setupAccount } from './account.js';

document.title = document.title.replaceAll('__BRAND__', BRAND_NAME);
for (const node of document.querySelectorAll('[aria-label]')) node.setAttribute('aria-label', node.getAttribute('aria-label').replaceAll('__BRAND__', BRAND_NAME));
for (const node of document.querySelectorAll('.brand, .mobile-nav-brand, .footer-brand, .startup-copy strong')) { for (const child of node.childNodes) if (child.nodeType === Node.TEXT_NODE) child.textContent = child.textContent.replaceAll('__BRAND__', BRAND_NAME); }

const menuToggle = document.querySelector('.mobile-menu-toggle');
const primaryNav = document.getElementById('primary-nav');
const menuBackdrop = document.querySelector('.mobile-nav-backdrop');
function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  primaryNav.classList.toggle('mobile-open', open);
  menuBackdrop.hidden = !open;
  document.body.classList.toggle('mobile-menu-open', open);
}
menuToggle.addEventListener('click', () => { const open = menuToggle.getAttribute('aria-expanded') !== 'true'; setMenuOpen(open); if (open) primaryNav.querySelector('.mobile-nav-brand').focus(); });
primaryNav.addEventListener('click', event => { if (event.target.closest('[data-nav], .mobile-nav-brand')) setMenuOpen(false); });
menuBackdrop.addEventListener('click', () => { setMenuOpen(false); menuToggle.focus(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenuOpen(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { setMenuOpen(false); menuToggle.focus(); } });
primaryNav.addEventListener('keydown', event => { if (event.key !== 'Tab' || menuToggle.getAttribute('aria-expanded') !== 'true') return; const items = [...primaryNav.querySelectorAll('a, button')]; const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenuOpen(false); });

window.hanulProgress = new ProgressStore([...window.HANUL_DATA.items, ...window.HANUL_VOCABULARY.words].map(item => item.id));
window.hanulReviewStore = new ReviewStore(window.HANUL_VOCABULARY.words.map(item=>item.id));
window.hanulReview = createReviewController(window.HANUL_VOCABULARY,window.hanulReviewStore,window.hanulProgress);
function enrollLearned(state){if(state.userId!==window.hanulReviewStore.userId)return;for(const id of state.learned)window.hanulReviewStore.enroll(id);}
window.hanulProgress.subscribe(enrollLearned);
enrollLearned(window.hanulProgress.snapshot());
await import('./app.js');
setupAccount(window.hanulProgress,window.hanulReviewStore).catch(() => {
  document.getElementById('account-description').textContent = 'Chưa thể kết nối tài khoản. Bạn vẫn có thể học và lưu tiến độ trên thiết bị này.';
});
