import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  fs.mkdirSync(distDir, { recursive: true });
}

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'macos.yaml'), 'utf-8');
const platformFormat = content.split('\n').map(line => {
  const [key, value] = line.trim().split('//')[0].split(/:\s*/);
  if (!key || !value || key === 'shortname') {
    return;
  }
  if (!value.startsWith('#')) {
    return `${key} = ${value}`;
  }
  const colorCode = value.slice(1);
  const rgbHex = colorCode.substring(0, 6);
  const alphaHex = colorCode.substring(6);
  if (alphaHex) {
    const alpha = (parseInt(alphaHex, 16) / 255).toFixed(2);
    return `${key} = #${rgbHex}:${alpha}`;
  }
  return `${key} = #${rgbHex}`;
}).filter(k => k).join('\n') + '\n';

fs.writeFileSync(path.join(distDir, 'macos.palette'), platformFormat, 'utf-8');
