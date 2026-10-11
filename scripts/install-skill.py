"""Install the bundled skill without overwriting an existing installation."""
import argparse
import os
from pathlib import Path
import shutil

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--skills-dir', type=Path,
                    default=Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'skills')
args = parser.parse_args()
source = Path(__file__).resolve().parents[1] / 'skills' / 'thai-html-infographics'
target = args.skills_dir.expanduser().resolve() / source.name
if target.exists():
    parser.error(f'Skill already exists; inspect or back it up before replacing it: {target}')
shutil.copytree(source, target, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
print(f'Installed {source.name} at {target}. Open a new Codex chat to use it.')
