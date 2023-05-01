import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as jpeg from 'jpeg-js';
import JSZip from 'jszip';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  fs.mkdirSync(distDir, { recursive: true });
}

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'desktop.yaml'), 'utf-8');
const desktopFormat = content.split('\n').map(k => k.split('//')[0].trim()).filter(k => k && !/^(name|shortname|wallpaper):/.test(k)).join(';\n') + ';\n';
const wallpaperColorHex = content.split('\n').find(k => k.trim().startsWith('windowBg:')).split('//')[0].split(/:\s*#/)[1].padEnd(8, 'FF');
const jpegData = jpeg.encode({ data: Buffer.from(wallpaperColorHex, 'hex'), width: 1, height: 1 }, 50).data;

new JSZip()
  .file('background.jpg', jpegData)
  .file('colors.tdesktop-theme', desktopFormat)
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream(path.join(distDir, 'desktop.tdesktop-theme')));
