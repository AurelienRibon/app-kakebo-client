import { Ref } from 'vue';

export function animateNumber(reference: Ref<number>, to: number, duration: number): void {
  const from = reference.value;
  const delta = to - reference.value;
  const startTime = Date.now();

  const loop = () => {
    const time = Date.now() - startTime;

    if (time >= duration) {
      reference.value = to;
    } else {
      reference.value = easeInOutQuad(time, from, delta, duration);
      requestAnimationFrame(loop);
    }
  };

  requestAnimationFrame(loop);
}

// -----------------------------------------------------------------------------
// EASINGS
// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function easeLinear(t: number, b: number, c: number, d: number): number {
  return (c * t) / d + b;
}

function easeInOutQuad(t: number, b: number, c: number, d: number): number {
  if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
  return (-c / 2) * (--t * (t - 2) - 1) + b;
}
