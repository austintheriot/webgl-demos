const main = async () => {
  const WIDTH = 1000;
  const HEIGHT = 1000;
  const BPP = 4;
  const ARRAY_LENGTH = WIDTH * HEIGHT * BPP;

  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const pixels = new Uint8ClampedArray(ARRAY_LENGTH);

  type Color = [r: number, g: number, b: number, a: number];
  type Point = {
    x: number,
    y: number,
    z?: number,
  }

  const RED: Color = [200, 0, 0, 255];
  const GREEN: Color = [0, 200, 0, 255];
  const BLUE: Color = [0, 0, 200, 255];
  const BLACK: Color = [0, 0, 0, 255];

  const drawPixel = (x: number, y: number, color: Color) => {
    const index = (Math.trunc(y) * WIDTH * BPP) + (Math.trunc(x) * BPP);
    color.forEach((byte, i) => pixels[index + i] = byte);
  }

  const drawLine = (x0: number, y0: number, x1: number, y1: number, color: Color) => {
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

      const temp2 = y1;
      y1 = y0;
      y0 = temp2;
    }

    // ---------------- USING SLOPE:
    // const slope = (y1 - y0) / (x1 - x0);
    // for (let x = Math.trunc(x0); x <= x1; x += 1) {
    //   const y = Math.trunc(slope * (x - x0) + y0);

    //   // if line is steep, switch x and y back to their normal positions when drawing:
    //   if (steep) cb(y, x, color);
    //   else cb(x, y, color);
    // }


    //  ---------------- USING PERCENT COMPLETE:
    for (let x = Math.trunc(x0); x <= x1; x += 1) {
      const xPctComplete = (x - x0) / (x1 - x0);
      const y = (xPctComplete * (y1 - y0)) + y0;

      // if line is steep, switch x and y back to their normal positions when drawing:
      if (steep) drawPixel(y, x, color);
      else drawPixel(x, y, color);
    }

     // ---------------- USING PERCENT LEFT TO COMPLETE:
    //  for (let x = Math.trunc(x0); x <= x1; x += 1) {
    //    const xPctComplete = (x - x0) / (x1 - x0);
    //    const yPctLeft = 1 - xPctComplete;
    //    const y = y1 - (yPctLeft * (y1 - y0));

    //   // if line is steep, switch x and y back to their normal positions when drawing:
    //   if (steep) cb(y, x, color);
    //   else cb(x, y, color);
    // }
  }

  drawLine(50, 100, 800, 700, BLACK);

  // draw outline of a triangle
  const drawTriangle = (p0: Point, p1: Point, p2: Point, color: Color) => {
    drawLine(p0.x, p0.y, p1.x, p1.y, color);
    drawLine(p1.x, p1.y, p2.x, p2.y, color);
    drawLine(p2.x, p2.y, p0.x, p0.y, color);
  }

  // triangle in two halves by only filling in lines horizontally
  const drawFilledTriangle = (t0: Point, t1: Point, t2: Point, color: Color) => {
    drawTriangle(t0, t1, t2, color);

    // iterate from bottom to 
    const vertexes = [t0, t1, t2];
    // sort by y-coordinates: least -> greatest
    vertexes.sort((a, b) => a.y - b.y);
    [t0, t1, t2] = vertexes;

    // bottom half of the triangle
    const totalHeight = t2.y - t0.y;
    for (let y = t0.y; y <= t1.y; y++) {
      const bottomHalfHeight = t1.y - t0.y;
      const pctYCompleteTo1 = (y - t0.y) / bottomHalfHeight;
      const pctYCompleteTo2 = (y - t0.y) / totalHeight;

      // when you are n% away from y, you are also guaranteed to be n% away from x
      let x1 = t0.x + ((t1.x - t0.x) * pctYCompleteTo1);
      let x2 = t0.x + ((t2.x - t0.x) * pctYCompleteTo2);

      [x1, x2] = x1 < x2 ? [x1, x2] : [x2, x1];
      for (let x = x1; x <= x2; x++){
        drawPixel(x, y, color);
      }
    }

     // top half of the triangle
    for (let y = t1.y; y <= t2.y; y++) {
      const topHalfHeight = (t2.y - t1.y);
      const pctYCompleteFromT1 = (y - t1.y) / topHalfHeight;
      const pctYCompleteFromT0 = (y - t0.y) / totalHeight;

      // when you are n% away from y, you are also guaranteed to be n% away from x
      let x1 = t0.x + ((t2.x - t0.x) * pctYCompleteFromT0);
      let x2 = t1.x + ((t2.x - t1.x) * pctYCompleteFromT1);

      [x1, x2] = x1 < x2 ? [x1, x2] : [x2, x1];
      for (let x = x1; x <= x2; x++){
        drawPixel(x, y, color);
      }
    }
  }

  drawFilledTriangle({ x: 20, y: 20 }, { x: 50, y: 800 }, { x: 700, y: 500}, GREEN);
  drawFilledTriangle({ x: 930, y: 20 }, { x: 500, y: 200 }, { x: 700, y: 500}, BLUE);
  drawFilledTriangle({ x: 930, y: 20 }, { x: 850, y: 950}, { x: 700, y: 500}, RED);

  // convert plain array into array of unsigned 32-bit integers
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}

main();