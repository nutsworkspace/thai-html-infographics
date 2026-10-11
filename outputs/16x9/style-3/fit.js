const fitPosters = () => document.querySelectorAll('.stage').forEach(stage => {
  const poster = stage.querySelector('.poster');
  const scale = Math.min(stage.clientWidth / poster.offsetWidth, 1);
  stage.style.height = `${poster.offsetHeight * scale}px`;
  poster.style.transform = `scale(${scale})`;
});
new ResizeObserver(fitPosters).observe(document.body);
fitPosters();
