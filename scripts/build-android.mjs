import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  fs.mkdirSync(distDir, { recursive: true });
}

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'android.yaml'), 'utf-8');
const platformFormat = content.split('\n').map(line => {
  const [key, value] = line.trim().split('//')[0].split(/:\s*/);
  if (!key || !value || ['name', 'shortname'].includes(key)) {
    return;
  }
  if (!value.startsWith('#')) {
    return `${key}=${value}`;
  }
  const colorCode = value.slice(1);
  const rgbHex = colorCode.substring(0, 6);
  const alphaHex = colorCode.substring(6) || 'FF';
  const javaColorInteger = parseInt(`${alphaHex}${rgbHex}`, 16) & 0xFFFFFFFF;
  return `${key}=${javaColorInteger}`;
}).filter(k => k).join('\n') + '\n';

fs.writeFileSync(path.join(distDir, 'android.attheme'), platformFormat, 'utf-8');
