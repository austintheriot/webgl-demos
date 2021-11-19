import ObjFileParser from 'obj-file-parser';

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

  for (let i = 0; i < ARRAY_LENGTH; i += BPP) {
    pixels[i + 3] = 255;
  }

  type Color = [r: number, g: number, b: number, a: number];

  const setPixel = (x: number, y: number, color: Color) => {
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
    const slope = (y1 - y0) / (x1 - x0);
    for (let x = Math.trunc(x0); x <= x1; x += 1) {
      const y = Math.trunc(slope * (x - x0) + y0);

      // if line is steep, switch x and y back to their normal positions when drawing:
      if (steep) setPixel(y, x, color);
      else setPixel(x, y, color);
    }
  }

  const model = await (await fetch('./model.obj')).text()
  const [parsedModel] = new ObjFileParser(model).parse().models;
  console.log({ model, parsedModel });

  parsedModel.faces.forEach((face) => {
    const vertices = face.vertices
      // .obj files start index at 1
      .map((vertex) => vertex.vertexIndex - 1)
      // convert vertexIndex to vertex coords
      .map((vertexIndex) => parsedModel.vertices[vertexIndex]);
   
    // draw lines between each vertex
    for (let i = 0; i < 3; i++) {
      const v0 = vertices[i];
      const v1 = vertices[(i + 1) % 3];

      // map (-1, 1) -> (0, 1)
      const x0 = ((v0.x + 1) / 2) * WIDTH;
      const y0 = ((v0.y + 1) / 2) * HEIGHT;
      const x1 = ((v1.x + 1) / 2) * WIDTH;
      const y1 = ((v1.y + 1) / 2) * HEIGHT;

      drawLine(x0, y0, x1, y1, [255, 255, 255, 100]);
    }
  });


  // convert plain array into array of unsigned 32-bit integers
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}

main();