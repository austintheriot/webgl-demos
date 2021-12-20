const main = async () => {
  const WIDTH = 250;
  const HEIGHT = 250;
  const BPP = 4;
  const ARRAY_LENGTH = WIDTH * HEIGHT * BPP;

  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const pixels = new Uint8ClampedArray(ARRAY_LENGTH);

  type Colors = [r: number, g: number, b: number, a: number];

  const drawPixel = (x: number, y: number, ...colors: Colors) => {
    const index = (Math.trunc(y) * WIDTH * BPP) + (Math.trunc(x) * BPP);
    colors.forEach((byte, i) => pixels[index + i] = byte);
  }

  const drawLine = (x0: number, y0: number, x1: number, y1: number, ...colors: Colors) => {
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;  /* error value e_xy */
    while (true) {
      drawPixel(x0, y0, ...colors);
      if (x0 == x1 && y0 == y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) /* e_xy+e_x > 0 */ {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) /* e_xy+e_y < 0 */ {
        err += dx;
        y0 += sy;
      }
    }
  }

  drawLine(15, 20, 125, 213, 255, 0, 0, 255);
  drawLine(150, 175, 23, 73, 0, 255, 0, 255);
  drawLine(15, 180, 200, 180, 0, 0, 255, 255);
  drawLine(180, 15, 180, 200, 0, 255, 255, 255);

  // convert plain array into array of unsigned 32-bit integers
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}

main();