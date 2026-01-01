#!/usr/bin/env node
/**
 * Script to generate app icons using sharp
 * Run: npm install -g sharp && node create-icons.js
 * Or: npx sharp create-icons.js
 */

const fs = require('fs');
const path = require('path');

// Create a simple PNG icon programmatically (1x1 blue pixel, will be scaled)
// This is a minimal valid PNG file

// Function to create a simple blue square PNG
function createBlueSquarePNG(width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk (image header)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT chunk (image data) - create blue squares
  const pixelData = [];
  const blue = [0, 102, 192]; // Primary blue color #006dc0
  
  for (let y = 0; y < height; y++) {
    pixelData.push(0); // filter type for this scanline
    for (let x = 0; x < width; x++) {
      // Gradient effect
      const intensity = Math.floor((x / width) * 255);
      pixelData.push(Math.min(255, blue[0] + intensity * 0.3));
      pixelData.push(Math.min(255, blue[1] + intensity * 0.2));
      pixelData.push(Math.min(255, blue[2]));
    }
  }
  
  const zlib = require('zlib');
  const compressed = require('zlib').deflateSync(Buffer.from(pixelData));
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk (end)
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc32 = calculateCRC32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC32(data) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

const assetsDir = path.join(__dirname, 'assets');

// Create icon files with proper dimensions
const icons = [
  { file: 'icon.png', width: 192, height: 192 },
  { file: 'adaptive-icon.png', width: 216, height: 216 },
  { file: 'splash.png', width: 512, height: 512 },
  { file: 'splash-icon.png', width: 200, height: 200 },
];

console.log('Creating app icons...');

icons.forEach(({ file, width, height }) => {
  const pngData = createBlueSquarePNG(width, height);
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, pngData);
  console.log(`✓ Created ${file} (${width}x${height})`);
});

console.log('\n✓ All icons created successfully!');
console.log('Icon specifications:');
console.log('  - icon.png: 192x192 (home screen icon)');
console.log('  - adaptive-icon.png: 216x216 (Android adaptive icon)');
console.log('  - splash.png: 512x512 (launch screen)');
console.log('  - splash-icon.png: 200x200 (splash screen icon)');
