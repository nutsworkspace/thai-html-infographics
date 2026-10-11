// Scale each editable 1080 × 1350 artboard to the available screen width.
const fitPosters = () => document.querySelectorAll('.stage').forEach(stage => {
  const scale = Math.min(stage.clientWidth / 1080, 1);
  stage.style.height = `${1350 * scale}px`;
  stage.querySelector('.poster').style.transform = `scale(${scale})`;
});
new ResizeObserver(fitPosters).observe(document.body);
fitPosters();
