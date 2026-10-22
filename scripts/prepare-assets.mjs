import fs from "fs";
import path from "path";
import zlib from "zlib";

const root = process.cwd();

function distToSegment(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(x - x1, y - y1);
  let t = ((x - x1) * dx + (y - y1) * dy) / len;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function simplify(points, eps) {
  if (points.length < 3) return points;
  let max = 0;
  let idx = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = distToSegment(points[i], points[0], points[end]);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max > eps) {
    const left = simplify(points.slice(0, idx + 1), eps);
    const right = simplify(points.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[end]];
}

const META = {
  "Batken Region": { id: "batken", name: "Баткенская область" },
  "Osh Region": { id: "osh", name: "Ошская область" },
  "Talas Region": { id: "talas", name: "Таласская область" },
  "Jalal-Abad Region": { id: "jalal-abad", name: "Джалал-Абадская область" },
  "Issyk-Kul Region": { id: "issyk-kul", name: "Иссык-Кульская область" },
  "Chuy Region": { id: "chuy", name: "Чуйская область" },
  "Naryn Region": { id: "naryn", name: "Нарынская область" },
};

const geo = JSON.parse(fs.readFileSync(path.join(root, "data", "kg-adm1.geojson"), "utf8"));

let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;

for (const feature of geo.features) {
  const polys = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  for (const poly of polys) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    }
  }
}

const width = 1000;
const height = 620;
const pad = 28;

function project(lon, lat) {
  const x = pad + ((lon - minLon) / (maxLon - minLon)) * (width - pad * 2);
  const y = pad + ((maxLat - lat) / (maxLat - minLat)) * (height - pad * 2);
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

const regions = geo.features.map((feature) => {
  const meta = META[feature.properties.shapeName];
  if (!meta) throw new Error("Unknown region " + feature.properties.shapeName);
  const polys = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  const parts = [];
  for (const poly of polys) {
    for (const ring of poly) {
      const simplified = simplify(ring, 0.02);
      if (simplified.length < 4) continue;
      const cmds = simplified.map(([lon, lat], index) => {
        const [x, y] = project(lon, lat);
        return `${index === 0 ? "M" : "L"}${x} ${y}`;
      });
      parts.push(cmds.join(" ") + " Z");
    }
  }
  return { ...meta, path: parts.join(" ") };
});

const cities = [
  { id: "bishkek", name: "Бишкек", lon: 74.5698, lat: 42.8746 },
  { id: "osh-city", name: "Ош", lon: 72.7985, lat: 40.5283 },
].map((city) => {
  const [x, y] = project(city.lon, city.lat);
  return { id: city.id, name: city.name, x, y };
});

fs.mkdirSync(path.join(root, "public", "map"), { recursive: true });
const mapJson = {
  viewBox: `0 0 ${width} ${height}`,
  attribution: "Administrative boundaries © geoBoundaries, CC BY 4.0",
  regions,
  cities,
};
fs.writeFileSync(path.join(root, "public", "map", "regions.json"), JSON.stringify(mapJson));
console.log(
  "regions",
  regions.length,
  "path chars",
  regions.reduce((sum, region) => sum + region.path.length, 0),
);

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function decodePng(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idats = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    offset += 4;
    const type = buf.toString("ascii", offset, offset + 4);
    offset += 4;
    const data = buf.subarray(offset, offset + len);
    offset += len + 4;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") idats.push(data);
    else if (type === "IEND") break;
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : null;
  if (!bpp) throw new Error("Unsupported PNG color type " + colorType);
  const inflated = zlib.inflateSync(Buffer.concat(idats));
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  let i = 0;
  for (let y = 0; y < height; y++) {
    const filter = inflated[i++];
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const raw = inflated[i++];
      const left = x >= bpp ? pixels[row + x - bpp] : 0;
      const up = y > 0 ? pixels[row - stride + x] : 0;
      const ul = y > 0 && x >= bpp ? pixels[row - stride + x - bpp] : 0;
      let value = raw;
      if (filter === 1) value = (raw + left) & 255;
      else if (filter === 2) value = (raw + up) & 255;
      else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const paeth = left + up - ul;
        const pa = Math.abs(paeth - left);
        const pb = Math.abs(paeth - up);
        const pc = Math.abs(paeth - ul);
        const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
        value = (raw + pred) & 255;
      }
      pixels[row + x] = value;
    }
  }
  return { width, height, bpp, pixels };
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

const sourceLogo = path.join(
  "C:/Users/Q26/.cursor/projects/d-Kyrgyzsytan/assets",
  "c__Users_Q26_AppData_Roaming_Cursor_User_workspaceStorage_f81d89baec190e7b70d133786db291e0_images_image-45dd1cc9-7fd9-496b-a757-9d31ab38ddcd.png",
);
const decoded = decodePng(fs.readFileSync(sourceLogo));
const { width: sw, height: sh, bpp, pixels } = decoded;
let minX = sw;
let minY = sh;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    const i = (y * sw + x) * bpp;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r > 18 || g > 18 || b > 18) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}
const margin = 24;
minX = Math.max(0, minX - margin);
minY = Math.max(0, minY - margin);
maxX = Math.min(sw - 1, maxX + margin);
maxY = Math.min(sh - 1, maxY + margin);
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;
const side = Math.max(cw, ch);
const offsetX = Math.floor((side - cw) / 2);
const offsetY = Math.floor((side - ch) / 2);
const rgba = Buffer.alloc(side * side * 4);
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const src = ((y + minY) * sw + (x + minX)) * bpp;
    const dst = ((y + offsetY) * side + (x + offsetX)) * 4;
    const r = pixels[src];
    const g = pixels[src + 1];
    const b = pixels[src + 2];
    const transparent = r < 16 && g < 16 && b < 16;
    rgba[dst] = r;
    rgba[dst + 1] = g;
    rgba[dst + 2] = b;
    rgba[dst + 3] = transparent ? 0 : 255;
  }
}
fs.writeFileSync(path.join(root, "public", "logo.png"), encodePng(side, side, rgba));
console.log("logo crop", side, "from", minX, minY, maxX, maxY);
