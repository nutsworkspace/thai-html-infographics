const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const renderer = path.join(root, 'skills', 'thai-html-infographics', 'scripts', 'render_artboards.cjs');
for (const style of [1, 2, 3]) {
  const result = spawnSync(process.execPath, [
    renderer, '--project', path.join(root, 'outputs', '16x9', `style-${style}`),
    '--pdf', ...process.argv.slice(2),
  ], { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}
