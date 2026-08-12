/**
 * Renders resume.html to resume/Aleena_Varghese_Resume.pdf with headless Chromium.
 * Requires puppeteer to be resolvable (npm i puppeteer, or run with NODE_PATH set).
 *   node resume/generate-pdf.mjs
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = "file://" + path.join(root, "resume.html");
const out = path.join(root, "resume", "Aleena_Varghese_Resume.pdf");

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--font-render-hinting=none"] });
const page = await browser.newPage();
await page.goto(src, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluateHandle("document.fonts.ready");
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log("PDF written:", out);
