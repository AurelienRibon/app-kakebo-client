import { Directive } from 'vue';

export function getVTapDirective(): Directive {
  return {
    mounted(el: HTMLElement) {
      const touchstartListener = (event1: TouchEvent) => {
        const t1 = Date.now();
        const x1 = event1.changedTouches[0].screenX;
        const y1 = event1.changedTouches[0].screenY;

        const touchendListener = (event2: TouchEvent) => {
          el.removeEventListener('touchend', touchendListener);

          const t2 = Date.now();
          const x2 = event2.changedTouches[0].screenX;
          const y2 = event2.changedTouches[0].screenY;
          const xDiff = Math.abs(x1 - x2);
          const yDiff = Math.abs(y1 - y2);

          if (t2 - t1 < 200 && xDiff < 5 && yDiff < 5) {
            el.dispatchEvent(new Event('tap'));
          }
        };

        el.addEventListener('touchend', touchendListener, { passive: true });
      };

      el.addEventListener('touchstart', touchstartListener, { passive: true });
    },
  };
}
