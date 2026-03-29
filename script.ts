import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf-8');
    let newContent = content
      .replace(/shadow-sm/g, 'shadow-ambient')
      .replace(/shadow-md/g, 'shadow-ambient')
      .replace(/shadow-lg/g, 'shadow-ambient')
      .replace(/shadow-xl/g, 'shadow-ambient')
      .replace(/shadow-2xl/g, 'shadow-ambient');
    
    if (content !== newContent) {
      fs.writeFileSync(filepath, newContent);
      console.log('Updated shadows', filepath);
    }
  }
});




