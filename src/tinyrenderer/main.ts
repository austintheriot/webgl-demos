const main = () => {
  const WIDTH = 100;
  const HEIGHT = 100;
  const BPP = 4;
  const ARRAY_LENGTH = WIDTH * HEIGHT * BPP;

  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const pixels = new Uint8ClampedArray(ARRAY_LENGTH);

  for (let i = 0; i < ARRAY_LENGTH; i += BPP) {
    pixels[i + 3] = 255;
  }

  type Color = [r: number, g: number, b: number, a: number];

  const setPixel = (x: number, y: number, color: Color) => {
    const index = (Math.trunc(y) * WIDTH * BPP) + (Math.trunc(x) * BPP);
    color.forEach((byte, i) => pixels[index + i] = byte);
  }

  // naive, just iterates tests many points between the two points
  const drawLine1 = (x0: number, y0: number, x1: number, y1: number, color: Color) => {
    for (let i = 0; i < 1; i += 0.01) {
      const x = x0 + Math.trunc((x1 - x0) * i);
      const y = y0 + Math.trunc((y1 - y0) * i);
      setPixel(x, y, color);
    }
  }

  // only draw 1 y point for every x point between the two point
  // doesn't work drawing backwards
  const drawLine2 = (x0: number, y0: number, x1: number, y1: number, color: Color) => {
    const slope = (y1 - y0) / (x1 - x0);
    for (let x = Math.trunc(x0); x <= x1; x += 1) {
      const y = Math.trunc(slope * (x - x0) + y0);
      setPixel(x, y, color);
    }
  }

  const drawLine3 = (x0: number, y0: number, x1: number, y1: number, color: Color) => {
    let steep = false;
    // if line is sleep, calculate by iterating through y instead of x
    if (Math.abs(y1 - y0) > Math.abs(x1 - x0)) {
      steep = true;
      const temp1 = y0;
      y0 = x0;
      x0 = temp1;

      const temp2 = y1;
      y1 = x1;
      x1 = temp2;
    }
    // draws from left to right always
    if (x0 > x1) {
      const temp = x1;
      x1 = x0;
      x0 = temp;
    }
    const slope = (y1 - y0) / (x1 - x0);
    for (let x = Math.trunc(x0); x <= x1; x += 1) {
      const y = Math.trunc(slope * (x - x0) + y0);

      // if line is steep, switch x and y back to their normal positions when drawing:
      if (steep) setPixel(y, x, color);
      else setPixel(x, y, color);
    }
  }


  setPixel(52, 41, [255, 0, 0, 255]);


  drawLine1(15, 20, 87, 60, [255, 255, 255, 255]);
  drawLine2(20, 42, 97, 95, [255, 0, 0, 255]);
  drawLine2(81, 73, 5, 17, [255, 0, 0, 255]);

  drawLine3(5, 11, 60, 56, [0, 255, 0, 255]);
  drawLine3(81, 73, 5, 17, [0, 255, 0, 255]);
  drawLine3(40, 10, 60, 90, [0, 255, 0, 255]);
  drawLine3(50, 5, 50, 80, [0, 255, 0, 255]);


  // convert plain array into array of unsigned 32-bit integers
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}

main();