const sharp = require("sharp");

async function generateIcon(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#07080a"/>
      <path d="M${size * 0.5} 0v${size * 0.25}A${size * 0.25} ${size * 0.25} 0 0 1 ${size * 0.25} 0H0a${size * 0.5} ${size * 0.5} 0 0 0 ${size * 0.5} ${size * 0.5}A${size * 0.5} ${size * 0.5} 0 0 0 0 ${size}h${size * 0.25}a${size * 0.25} ${size * 0.25} 0 0 1 ${size * 0.25} -${size * 0.25}v${size * 0.25}a${size * 0.5} ${size * 0.5} 0 1 0 0 -${size}Z" fill="#FF6363"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`Generated ${outputPath} (${size}x${size})`);
}

(async () => {
  await generateIcon(192, "public/icon-192.png");
  await generateIcon(512, "public/icon-512.png");
  console.log("All icons generated!");
})();
