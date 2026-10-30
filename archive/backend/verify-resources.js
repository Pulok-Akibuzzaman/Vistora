import fs from 'fs';
import path from 'path';

const dbDir = path.resolve('Database');
console.log('Database path:', dbDir);

if (!fs.existsSync(dbDir)) {
  console.log('Database dir does not exist!');
  process.exit(1);
}

const entries = fs.readdirSync(dbDir);

// 1. Check PDF files
const pdfs = entries.filter(f => f.endsWith('.pdf'));
console.log('\n--- PDF CHECKS ---');
for (const pdf of pdfs) {
  const fullPath = path.join(dbDir, pdf);
  const stat = fs.statSync(fullPath);
  const buf = Buffer.alloc(16);
  const fd = fs.openSync(fullPath, 'r');
  fs.readSync(fd, buf, 0, 16, 0);
  fs.closeSync(fd);
  const isPdf = buf.toString('utf8', 0, 5) === '%PDF-';
  console.log(`${pdf}: ${(stat.size / (1024 * 1024)).toFixed(2)} MB | Valid PDF Header (%PDF-): ${isPdf}`);
}

// 2. Check Audio folders & files
const audioDirs = entries.filter(f => fs.statSync(path.join(dbDir, f)).isDirectory());
console.log('\n--- AUDIO CHECKS ---');
let totalMp3 = 0;
let validMp3 = 0;
let totalAudioBytes = 0;

for (const dir of audioDirs) {
  const fullDir = path.join(dbDir, dir);
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.mp3'));
  totalMp3 += files.length;
  console.log(`Directory [${dir}]: ${files.length} MP3 files`);

  for (const f of files) {
    const fPath = path.join(fullDir, f);
    const stat = fs.statSync(fPath);
    totalAudioBytes += stat.size;
    const buf = Buffer.alloc(4);
    const fd = fs.openSync(fPath, 'r');
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);

    const isId3 = buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33; // ID3
    const isSync = buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0;           // MPEG frame sync
    if (isId3 || isSync) {
      validMp3++;
    } else {
      console.log(`Warning: non-standard header in ${dir}/${f}:`, buf);
    }
  }
}

console.log(`\nTotal MP3s: ${totalMp3}, Valid Audio Headers: ${validMp3}`);
console.log(`Total Audio Size: ${(totalAudioBytes / (1024 * 1024)).toFixed(2)} MB`);
