import ObjFileParser from 'obj-file-parser';
import TgaLoader from 'tga-js';


type Color = [r: number, g: number, b: number, a: number];
interface Point {
  x: number,
  y: number,
  z: number,
}
interface TextureCoord {
  u: number,
  v: number,
  w?: number
}

const main = async () => {
  const WIDTH = 1_000;
  const HEIGHT = 1_000;
  const DEPTH = 1_000;
  const BPP = 4;
  
  // 0 == very close, 8 === some distortion, 100 === flat
  const VIEW_DISTANCE = 6;
  const ARRAY_LENGTH = WIDTH * HEIGHT * BPP;
  const LIGHTING_MODE: 'default' | 'smooth' = 'smooth';

  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const pixels = new Uint8ClampedArray(ARRAY_LENGTH);

  const drawPixel = (x: number, y: number, color: Color) => {
    const index = (Math.floor(y) * WIDTH * BPP) + (Math.floor(x) * BPP);
    color.forEach((byte, i) => pixels[index + i] = byte);
  }

  const applyBarycentricWeights = ([n0, n1, n2]: [number, number, number],
    [barycentricA, barycentricB, barycentricC]: [number, number, number]) => (
    n0 * barycentricA + n1 * barycentricB + n2 * barycentricC
  );

  const drawTexturedTriangle = (
    [point0, point1, point2]: [Point, Point, Point],
    [texture0, texture1, texture2]: [TextureCoord, TextureCoord, TextureCoord],
    [normal0, normal1, normal2]: [Point, Point, Point],
    faceNormal: Point,
    tgaHeader: any,
    tgaImageData: number[],
    zBuffer: number[],
    lightVector: Point
  ) => {

    // create a bounding box around the triangle
    const minX = Math.round(Math.min(point0.x, Math.min(point1.x, point2.x)));
    const maxX = Math.round(Math.max(point0.x, Math.max(point1.x, point2.x)));
    const minY = Math.round(Math.min(point0.y, Math.min(point1.y, point2.y)));
    const maxY = Math.round(Math.max(point0.y, Math.max(point1.y, point2.y)));

    // iterate through every point in the bounding box.
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        // test if the point lies within the triangle using barycentric coordinate system
        const denominator = (point1.y - point2.y) * (point0.x - point2.x) + (point2.x - point1.x) * (point0.y - point2.y);
        const weightA = ((point1.y - point2.y) * (x - point2.x) + (point2.x - point1.x) * (y - point2.y)) / denominator;
        const weightB = ((point2.y - point0.y) * (x - point2.x) + (point0.x - point2.x) * (y - point2.y)) / denominator;
        const weightC = 1 - weightA - weightB;
        const barycentricWeights: [number, number, number] = [weightA, weightB, weightC];
        const pixelIsInTriangle = 0 <= weightA && weightA <= 1 && 0 <= weightB && weightB <= 1 && 0 <= weightC && weightC <= 1;

        if (pixelIsInTriangle) {
          // use barycentric weights to get z coordinate for the current pixel
          const z = applyBarycentricWeights([point0.z, point1.z, point2.z], barycentricWeights);
          const i = x + y * WIDTH;

          // only draw if zIndex is higher than what has already been drawn
          if (z > zBuffer[i]) {
            // GET INTERPOLATED COLOR FROM TEXTURE:
            // interpolate texture sample between vertices
            let u = applyBarycentricWeights([texture0.u, texture1.u, texture2.u], barycentricWeights);
            let v = applyBarycentricWeights([texture0.v, texture1.v, texture2.v], barycentricWeights);
            // map (0, 1) to texture image coordinates
            u = Math.floor(tgaHeader.width * u);
            v = Math.floor(tgaHeader.height * v);
            // convert coordinates to image buffer index
            const colorIndex = (tgaHeader.width * (v * 4)) + (u * 4);
            const r = tgaImageData[colorIndex];
            const g = tgaImageData[colorIndex + 1];
            const b = tgaImageData[colorIndex + 2];

            // GET INTERPOLATED LIGHTiNG FROM NORMAL:
            // interpolate normals at vertices to get this pixel's normal
            let nx = applyBarycentricWeights([normal0.x, normal1.x, normal2.x], barycentricWeights);
            let ny = applyBarycentricWeights([normal0.y, normal1.y, normal2.y], barycentricWeights);
            let nz = applyBarycentricWeights([normal0.z, normal1.z, normal2.z], barycentricWeights);
            const normalVectorLength = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
            // normalize the normal vector between 0 and 1
            nx /= normalVectorLength;
            ny /= normalVectorLength;
            nz /= normalVectorLength;

            // dot product mixes the light strength with the normal to produce a scalar value
            // light that is more perpendicular to the surface appears brighter
            const lightStrength = LIGHTING_MODE === 'smooth'
              ? (lightVector.x * nx + lightVector.y * ny + lightVector.z * nz)
              : (faceNormal.x * nx + faceNormal.y * ny + faceNormal.z * nz);

            zBuffer[i] = z;
            drawPixel(x, y, [r * lightStrength, g * lightStrength, b * lightStrength, 255]);
          }
        }
      }
    }
  }


  // parse .obj file into face and vertices
  const model = await (await fetch('./man.obj')).text()
  const [parsedModel] = new ObjFileParser(model).parse().models;
  const tga = new TgaLoader();
  tga.open('./man_texture.tga', () => {
    console.log({ tga });

    // add in alpha to tga file & and rearrange rgb to be in correct order
    const tgaImageData = new Array();
    for (let x = 0; x < tga.imageData.length; x += 3) {
      const [r, g, b] = tga.imageData.slice(x, x + 3);
      tgaImageData.push(b, g, r, 255);
    }

    // point of light source
    const LIGHT_X = WIDTH / 2;
    const LIGHT_Y = HEIGHT;
    const LIGHT_Z = DEPTH;

    // get light vector
    const lightVectorLength = Math.sqrt(LIGHT_X ** 2 + LIGHT_Y ** 2 + LIGHT_Z ** 2);
    // normalize the light vector between 0 and 1
    const lx = LIGHT_X / lightVectorLength;
    const ly = LIGHT_Y / lightVectorLength;
    const lz = LIGHT_Z / lightVectorLength;

    // render model
    const modelZBuffer = new Array(WIDTH * HEIGHT).fill(-Infinity);
    parsedModel.faces.forEach((face) => {
      // GET POINT, TEXTURE, AND NORMALS FOR EACH VERTEX
      const [point0, point1, point2] = face.vertices
        // .obj files start index at 1
        .map((vertex) => vertex.vertexIndex - 1)
        // convert vertexIndex to vertex coords
        .map((vertexIndex) => parsedModel.vertices[vertexIndex])
        // add perspective distortion
        .map(({ x, y, z }) => ({
          x: x / (1 - z / VIEW_DISTANCE),
          y: y / (1 - z / VIEW_DISTANCE),
          z: z / (1 - z / VIEW_DISTANCE),
        }))
        // map from (-1, 1) to (0, canvas size)
        .map(({ x, y, z }) => ({
          x: ((x + 1) / 2) * WIDTH,
          y: ((y + 1) / 2) * HEIGHT,
          z: ((z + 1) / 2) * DEPTH,
        }))

      const [texture0, texture1, texture2] = face.vertices
        // .obj files start index at 1
        .map((vertex) => vertex.textureCoordsIndex - 1)
        // convert vertexIndex to vertex coords
        .map((textCoordsIndex) => parsedModel.textureCoords[textCoordsIndex])

      const [normal0, normal1, normal2] = face.vertices
        // .obj files start index at 1
        .map((vertex) => vertex.vertexNormalIndex - 1)
        // convert vertexIndex to vertex coords
        .map((vertexNormalIndex) => parsedModel.vertexNormals[vertexNormalIndex])
        .map(({ x, y, z }) => ({
          x: ((x + 1) / 2) * WIDTH,
          y: ((y + 1) / 2) * HEIGHT,
          z: ((z + 1) / 2) * DEPTH,
        }));
      

      // GET NORMAL FOR FACE ITSELF: 
      // can be used for default (i.e. non-smooth) lighting
      // convert 3 triangle points to 2 vectors (2 sides of the triangle)
      const U = {
        x: point1.x - point0.x,
        y: point1.y - point0.y,
        z: point1.z - point0.z,
      };
      const V = {
        x: point2.x - point0.x,
        y: point2.y - point0.y,
        z: point2.z - point0.z,
      }
      // get the surface normal from the triangle's two sides
      let faceNx = U.y * V.z - U.z * V.y;
      let faceNy = U.z * V.x - U.x * V.z;
      let faceNz = U.x * V.y - U.y * V.x;
      const normalVectorLength = Math.sqrt(faceNx ** 2 + faceNy ** 2 + faceNz ** 2);
      // normalize the normal vector between 0 and 1
      faceNx /= normalVectorLength;
      faceNy /= normalVectorLength;
      faceNz /= normalVectorLength;
      const faceNormal = {
        x: faceNx,
        y: faceNy,
        z: faceNz,
      }

      drawTexturedTriangle(
        [{ x: point0.x, y: point0.y, z: point0.z },
        { x: point1.x, y: point1.y, z: point1.z },
        { x: point2.x, y: point2.y, z: point2.z }],

        [{ u: texture0.u, v: texture0.v },
        { u: texture1.u, v: texture1.v },
        { u: texture2.u, v: texture2.v }],

        [{ x: normal0.x, y: normal0.y, z: normal0.z },
        { x: normal1.x, y: normal1.y, z: normal1.z },
        { x: normal2.x, y: normal2.y, z: normal2.z }],

        faceNormal,

        tga.header,
        tgaImageData,

        modelZBuffer,

        { x: lx, y: ly, z: lz },
      )
    });


    // convert plain array into array of unsigned 32-bit integers
    const imageData = ctx.createImageData(WIDTH, HEIGHT);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  })
}

main();