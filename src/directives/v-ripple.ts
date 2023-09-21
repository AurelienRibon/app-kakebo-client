import { Directive } from 'vue';
import { px } from '../lib/utils';

export function getVRippleDirective(): Directive {
  return {
    mounted(el: HTMLElement) {
      if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }

      el.style.overflow = 'hidden';
      el.addEventListener('touchstart', (event) => applyRippleEffect(event, el), { passive: true });
    },
  };
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function applyRippleEffect(event: TouchEvent, elem: HTMLElement): void {
  const { top, left, width, height } = elem.getBoundingClientRect();

  let ripple = elem.querySelector<HTMLElement>('.ripple');
  if (!ripple) {
    ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = px(Math.max(width, height));
    ripple.style.height = ripple.style.width;
    elem.appendChild(ripple);
  }

  ripple.classList.remove('ripple-active');

  const touchX = event.touches[0].pageX;
  const touchY = event.touches[0].pageY;

  const x = touchX - left - ripple.offsetWidth / 2 - document.body.scrollLeft;
  const y = touchY - top - ripple.offsetHeight / 2 - document.body.scrollTop;

  ripple.style.left = px(x);
  ripple.style.top = px(y);
  ripple.classList.add('ripple-active');

  const animationEndListener = () => {
    ripple?.removeEventListener('animationend', animationEndListener);
    ripple?.classList.remove('ripple-active');
  };

  ripple.addEventListener('animationend', animationEndListener);
}
