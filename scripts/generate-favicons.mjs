import fs from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const sourcePath = "public/favicon.svg";
const pngSizes = [16, 32, 48, 180];

await Promise.all(
  pngSizes.map((size) =>
    sharp(sourcePath)
      .resize({
        width: size,
        height: size,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(`public/favicon-${size}x${size}.png`)
  )
);

const icoBuffer = await pngToIco(
  [16, 32, 48].map((size) => `public/favicon-${size}x${size}.png`)
);
await fs.writeFile("public/favicon.ico", icoBuffer);
