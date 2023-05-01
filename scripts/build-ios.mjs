import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import yaml from 'js-yaml';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  fs.mkdirSync(distDir, { recursive: true });
}

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'ios.yaml'), 'utf-8');
const object = {};

for (const line of content.split('\n')) {
  const [key, value] = line.trim().split('//')[0].split(/:\s*/);
  if (!key || !value || key === 'shortname') {
    continue;
  }
  let target = object;
  for (const slug of key.split('_').slice(0, -1)) {
    if (!target[slug]) {
      target[slug] = {};
    }
    target = target[slug];
  }
  if (!value.startsWith('#')) {
    target[key.split('_').pop()] = value;
  } else {
    target[key.split('_').pop()] = value.slice(1).replace(/^([0-9A-F]{6})([0-9A-F]{2})?/i, '$2$1').toLowerCase();
  }
}

object.chat.defaultWallpaper = object.wallpaper;
delete object.wallpaper;

fs.writeFileSync(path.join(distDir, 'ios.tgios-theme'), yaml.dump(object).replace(/'/g, ''), 'utf-8');
