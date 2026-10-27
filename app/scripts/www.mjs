// The app's web content = the test site's current page and the files beside it (not the old vNN pages).
import {cpSync, rmSync, mkdirSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const app = dirname(dirname(fileURLToPath(import.meta.url))), site = dirname(app), www = join(app, 'www');
rmSync(www, {recursive: true, force: true}); mkdirSync(www);
for (const f of ['index.html', 'opencv.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'models', 'ort'])
  if (existsSync(join(site, f))) cpSync(join(site, f), join(www, f), {recursive: true});
console.log('www ←', site);
