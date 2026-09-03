import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height) {
  // Simple PNG encoder
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: filter byte (0) + width * 4 bytes per row
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.46;
  const rInner = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > rOuter) {
        // Transparent or white background
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
        rawData[pxOffset + 3] = 0;
      } else if (dist > rInner) {
        // Border: ASD Grumo Royal Blue #0B4FBA (11, 79, 186)
        rawData[pxOffset] = 11;
        rawData[pxOffset + 1] = 79;
        rawData[pxOffset + 2] = 186;
        rawData[pxOffset + 3] = 255;
      } else {
        // Inside
        if (dx < 0) {
          // Left side: Royal Blue goat #0B4FBA
          // Add some white horn highlights
          if (dy < -cx * 0.3 && dx > -cx * 0.5) {
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 255;
            rawData[pxOffset + 2] = 255;
            rawData[pxOffset + 3] = 255;
          } else {
            rawData[pxOffset] = 11;
            rawData[pxOffset + 1] = 79;
            rawData[pxOffset + 2] = 186;
            rawData[pxOffset + 3] = 255;
          }
        } else {
          // Right side: Volleyball in ASD Grumo Carmine Red #C8102E (200, 16, 46)
          // Curved white seams
          const isSeam = Math.abs(dx * dy) < (width * 3) || Math.abs(dx - dy * 0.6) < 4;
          if (isSeam) {
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 255;
            rawData[pxOffset + 2] = 255;
            rawData[pxOffset + 3] = 255;
          } else {
            rawData[pxOffset] = 200;
            rawData[pxOffset + 1] = 16;
            rawData[pxOffset + 2] = 46;
            rawData[pxOffset + 3] = 255;
          }
        }
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crc = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180));
console.log('PWA PNG icons generated successfully!');
