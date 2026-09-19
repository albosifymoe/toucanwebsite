const strip = document.querySelector('.client-strip');
const controls = document.querySelector('.client-strip-controls');

if (strip && controls) {
  const buttons = [...controls.querySelectorAll('button')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => {
    const limit = strip.scrollWidth - strip.clientWidth;
    buttons[0].disabled = strip.scrollLeft <= 2;
    buttons[1].disabled = strip.scrollLeft >= limit - 2;
  };
  controls.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => {
    strip.scrollBy({
      left: Number(button.dataset.clientDirection) * strip.clientWidth,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }));
  strip.addEventListener('scroll', update, {passive: true});
  new ResizeObserver(update).observe(strip);
  update();
}
