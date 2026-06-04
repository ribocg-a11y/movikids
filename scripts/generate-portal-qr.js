import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORTAL_URL = "https://ribocg-a11y.github.io/movikids/acompanhar.html";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "assets");
const outPng = path.join(outDir, "qr-portal-acompanhar.png");
const outSvg = path.join(outDir, "qr-portal-acompanhar.svg");

fs.mkdirSync(outDir, { recursive: true });

const { default: QRCode } = await import("qrcode");

await QRCode.toFile(outPng, PORTAL_URL, {
  width: 512,
  margin: 2,
  errorCorrectionLevel: "M",
});
await QRCode.toString(PORTAL_URL, { type: "svg", margin: 2 }, (err, svg) => {
  if (err) throw err;
  fs.writeFileSync(outSvg, svg, "utf8");
});

console.log("QR gerado:");
console.log(outPng);
console.log(outSvg);
console.log("URL:", PORTAL_URL);
