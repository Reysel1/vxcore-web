/**
 * Genera los iconos de la app (favicon + apple touch) a partir de la imagen
 * del icono (squircle blanco con la "A" sobre fondo negro).
 *
 * Uso:
 *   node scripts/make-icon.mjs [imagen] [carpeta-de-salida]
 *
 * Ejemplo:
 *   node scripts/make-icon.mjs "C:/Users/nene/Pictures/Vertex/01aa908b-48c9-435d-9471-bf50af6fdee6.png" src/app
 */
import sharp from "sharp";
import path from "node:path";

const SRC =
  process.argv[2] ??
  "C:/Users/nene/Pictures/Vertex/01aa908b-48c9-435d-9471-bf50af6fdee6.png";
// El icono es del panel admin (la web conserva su favicon por defecto).
const OUT_DIR = process.argv[3] ?? "C:/Users/nene/Desktop/vxcore-admin/src/app";
const MARGIN = 10; // margen en px alrededor del squircle (escala original)

async function main() {
  const { data, info } = await sharp(SRC)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  if (ch < 3) throw new Error("La imagen necesita al menos 3 canales (RGB)");

  const lum = (x, y) => {
    const i = (y * w + x) * ch;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  };
  const isDark = (x, y) => lum(x, y) < 30;

  // Flood fill desde los bordes: marca el fondo (negro conectado al borde).
  // La "A" negra del interior queda protegida por el squircle blanco.
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (bg[i]) return;
    if (!isDark(x, y)) return;
    bg[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Bounding box del contenido (todo lo que no es fondo).
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!bg[y * w + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("No se encontró contenido en la imagen");

  minX = Math.max(0, minX - MARGIN);
  minY = Math.max(0, minY - MARGIN);
  maxX = Math.min(w - 1, maxX + MARGIN);
  maxY = Math.min(h - 1, maxY + MARGIN);

  const cw = maxX - minX + 1;
  const chh = maxY - minY + 1;
  const side = Math.max(cw, chh);
  const padX = Math.floor((side - cw) / 2);
  const padY = Math.floor((side - chh) / 2);

  // RGBA: fondo -> transparente, contenido -> opaco con su color original.
  const rgba = Buffer.alloc(side * side * 4);
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const sx = minX + x - padX;
      const sy = minY + y - padY;
      const o = (y * side + x) * 4;
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      const i = sy * w + sx;
      if (bg[i]) continue;
      const si = i * ch;
      rgba[o] = data[si];
      rgba[o + 1] = data[si + 1];
      rgba[o + 2] = data[si + 2];
      rgba[o + 3] = 255;
    }
  }

  const make = (size, file) =>
    sharp(rgba, { raw: { width: side, height: side, channels: 4 } })
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(path.join(OUT_DIR, file));

  await make(512, "icon.png");
  await make(180, "apple-icon.png");
  console.log(`OK -> ${path.join(OUT_DIR, "icon.png")} / apple-icon.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
