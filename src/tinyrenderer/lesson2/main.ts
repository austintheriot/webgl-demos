import ObjFileParser from 'obj-file-parser';

const main = async () => {
  const WIDTH = 5_000;
  const HEIGHT = 5_000;
  const DEPTH = 5_000;
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

  // const RED: Color = [200, 0, 0, 255];
  // const GREEN: Color = [0, 200, 0, 255];
  // const BLUE: Color = [0, 0, 200, 255];
  // const BLACK: Color = [0, 0, 0, 255];

  const drawPixel = (x: number, y: number, color: Color) => {
    const index = (Math.floor(y) * WIDTH * BPP) + (Math.floor(x) * BPP);
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

  // drawLine(50, 100, 800, 700, BLACK);

  // draw outline of a triangle
  const drawTriangle = (p0: Point, p1: Point, p2: Point, color: Color) => {
    drawLine(p0.x, p0.y, p1.x, p1.y, color);
    drawLine(p1.x, p1.y, p2.x, p2.y, color);
    drawLine(p2.x, p2.y, p0.x, p0.y, color);
  }

  // draw filled triangle "old-school" way
  // triangle in two halves by only filling in lines horizontally
  // const drawFilledTriangle0 = (t0: Point, t1: Point, t2: Point, color: Color) => {
  //   drawTriangle(t0, t1, t2, color);

  //   // iterate from bottom to 
  //   const vertexes = [t0, t1, t2];
  //   // sort by y-coordinates: least -> greatest
  //   vertexes.sort((a, b) => a.y - b.y);
  //   [t0, t1, t2] = vertexes;

  //   // bottom half of the triangle
  //   const totalHeight = t2.y - t0.y;
  //   for (let y = t0.y; y <= t1.y; y++) {
  //     const bottomHalfHeight = t1.y - t0.y;
  //     const pctYCompleteTo1 = (y - t0.y) / bottomHalfHeight;
  //     const pctYCompleteTo2 = (y - t0.y) / totalHeight;

  //     // when you are n% away from y, you are also guaranteed to be n% away from x
  //     let x1 = t0.x + ((t1.x - t0.x) * pctYCompleteTo1);
  //     let x2 = t0.x + ((t2.x - t0.x) * pctYCompleteTo2);

  //     [x1, x2] = x1 < x2 ? [x1, x2] : [x2, x1];
  //     for (let x = x1; x <= x2; x++) {
  //       drawPixel(x, y, color);
  //     }
  //   }

  //   // top half of the triangle
  //   for (let y = t1.y; y <= t2.y; y++) {
  //     const topHalfHeight = (t2.y - t1.y);
  //     const pctYCompleteFromT1 = (y - t1.y) / topHalfHeight;
  //     const pctYCompleteFromT0 = (y - t0.y) / totalHeight;

  //     // when you are n% away from y, you are also guaranteed to be n% away from x
  //     let x1 = t0.x + ((t2.x - t0.x) * pctYCompleteFromT0);
  //     let x2 = t1.x + ((t2.x - t1.x) * pctYCompleteFromT1);

  //     [x1, x2] = x1 < x2 ? [x1, x2] : [x2, x1];
  //     for (let x = x1; x <= x2; x++) {
  //       drawPixel(x, y, color);
  //     }
  //   }
  // }

  // drawFilledTriangle0({ x: 20, y: 20 }, { x: 50, y: 800 }, { x: 700, y: 500}, GREEN);
  // drawFilledTriangle0({ x: 930, y: 20 }, { x: 500, y: 200 }, { x: 700, y: 500}, BLUE);
  // drawFilledTriangle0({ x: 930, y: 20 }, { x: 850, y: 950 }, { x: 700, y: 500 }, RED);


  // uses barycentric coordinate system
  // can be parallelized for every pixel in the bounding box, so more efficient
  const drawFilledTriangle = (t0: Point, t1: Point, t2: Point, color: Color) => {
    // create a bounding box around the triangle
    const minX = Math.round(Math.min(t0.x, Math.min(t1.x, t2.x)));
    const maxX = Math.round(Math.max(t0.x, Math.max(t1.x, t2.x)));
    const minY = Math.round(Math.min(t0.y, Math.min(t1.y, t2.y)));
    const maxY = Math.round(Math.max(t0.y, Math.max(t1.y, t2.y)));

    // reduce edge errors by drawing each edge explicitly
    drawTriangle(t0, t1, t2, color);

    // iterate through every point in the bounding box.
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        // test if the point lies within the triangle using barycentric coordinate system
        const denominator = (t1.y - t2.y) * (t0.x - t2.x) + (t2.x - t1.x) * (t0.y - t2.y);
        const a = ((t1.y - t2.y) * (x - t2.x) + (t2.x - t1.x) * (y - t2.y)) / denominator;
        const b = ((t2.y - t0.y) * (x - t2.x) + (t0.x - t2.x) * (y - t2.y)) / denominator;
        const c = 1 - a - b;
        const inTriangle = 0 <= a && a <= 1 && 0 <= b && b <= 1 && 0 <= c && c <= 1;
        if (inTriangle) drawPixel(x, y, color);
      }
    }
  }

  // *************** Tutorial's method:
  // const cross = (a: [number, number, number], b: [number, number, number]): [number, number, number] => ([
  //   a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0],
  // ])

  // const barycentric = (pts: [Point, Point, Point], p: Point) => {
  //   const a: [number, number, number] = [pts[2].x - pts[0].x, pts[1].x - pts[0].x, pts[0].x - p.x];
  //   const b: [number, number, number] = [pts[2].y - pts[0].y, pts[1].y - pts[0].y, pts[0].y - p.y];
  //   const u = cross(a, b);
  //   if (Math.abs(u[2]) < 1) return [-1, 1, 1];
  //   return [1 - (u[0] + u[1]) / u[2], u[1] / u[2], u[0] / u[2]];
  // }

  // const drawFilledTriangle = (pts: [Point, Point, Point], color: Color) => {
  //   const bboxmin = [WIDTH - 1, HEIGHT - 1];
  //   const bboxmax = [0, 0];
  //   const clamp = [WIDTH - 1, HEIGHT - 1];
  //   for (let i: 0 | 1 | 2 = 0; i < 3; i++) {
  //     for (let j: 0 | 1 | 2 = 0; j < 2; j++) {
  //       const letter = j === 0
  //         ? 'x'
  //         : j === 1
  //           ? 'y'
  //           : 'z';
  //       bboxmin[j] = Math.max(0, Math.min(bboxmin[j], pts[i][letter] || 0));
  //       bboxmax[j] = Math.min(clamp[j], Math.max(bboxmax[j], pts[i][letter] || 0));
  //     }
  //   }

  //   const P: Point = { x: 0, y: 0 };
  //   for (P.x = bboxmin[0]; P.x <= bboxmax[0]; P.x++) {
  //     for (P.y = bboxmin[1]; P.y <= bboxmax[1]; P.y++) {
  //       const bc_screen = barycentric(pts, P);
  //       if (bc_screen[0] < 0 || bc_screen[1] < 0 || bc_screen[2] < 0) continue;
  //       drawPixel(P.x, P.y, color);
  //     }
  //   }
  // }


  // parse .obj file into face and vertices
  const model = await (await fetch('./model.obj')).text()
  const [parsedModel] = new ObjFileParser(model).parse().models;

  // point of light source
  const LIGHT_X = 0;
  const LIGHT_Y = Math.floor(HEIGHT / 2);
  const LIGHT_Z = DEPTH;
  // get light vector
  const lightVectorLength = Math.sqrt(LIGHT_X ** 2 + LIGHT_Y ** 2 + LIGHT_Z ** 2);
  // normalize the light vector between 0 and 1
  const lx = LIGHT_X / lightVectorLength;
  const ly = LIGHT_Y / lightVectorLength;
  const lz = LIGHT_Z / lightVectorLength;

  // render model
  parsedModel.faces.forEach((face) => {
    const [v0, v1, v2] = face.vertices
      // .obj files start index at 1
      .map((vertex) => vertex.vertexIndex - 1)
      // convert vertexIndex to vertex coords
      .map((vertexIndex) => parsedModel.vertices[vertexIndex])
      .map(({ x, y, z }) => ({
        x: ((x + 1) / 2) * WIDTH,
        y: ((y + 1) / 2) * HEIGHT,
        z: ((z + 1) / 2) * DEPTH,
      }));

    // convert 3 triangle points to 2 vectors (2 sides of the triangle)
    const U = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z,
    };
    const V = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z,
    }

    // get the surface normal from the triangle's two sides
    let nx = U.y * V.z - U.z * V.y;
    let ny = U.z * V.x - U.x * V.z;
    let nz = U.x * V.y - U.y * V.x;
    const normalVectorLength = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
    // normalize the normal vector between 0 and 1
    nx /= normalVectorLength;
    ny /= normalVectorLength;
    nz /= normalVectorLength;

    // dot product mixes the light strength with the normal to produce a scalar value
    // light that is more perpendicular to the surface appears brighter
    const lightStrength = (lx * nx + ly * ny + lz * nz);

    if (lightStrength > 0) {
      drawFilledTriangle(
        { x: v0.x, y: v0.y }, { x: v1.x, y: v1.y }, { x: v2.x, y: v2.y },
        [Math.floor(256 * lightStrength), Math.floor(256 * lightStrength), Math.floor(256 * lightStrength), 255],
      )
    }
  });

  // convert plain array into array of unsigned 32-bit integers
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
}

main();