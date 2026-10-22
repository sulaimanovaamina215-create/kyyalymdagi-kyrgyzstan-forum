import { spawn } from "node:child_process";
import fs from "node:fs";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9223;
const outDir = "D:\\Kyrgyzsytan\\tmp-preview";

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    "--user-data-dir=D:\\Kyrgyzsytan\\tmp-preview\\chrome-profile",
    "about:blank",
  ],
  { stdio: "ignore" },
);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDebugger() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      await delay(150);
    }
  }
  throw new Error("Chrome debugger did not start");
}

class Cdp {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
  }

  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  close() {
    this.ws.close();
  }
}

async function shot(cdp, width, name, clickMenu) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp.send("Page.navigate", { url: "http://localhost:3460/" });
  await delay(1200);
  if (clickMenu) {
    await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector('[aria-label="Открыть меню"]').click()`,
    });
    await delay(300);
  }
  const metrics = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const header = document.querySelector('header');
      const buttons = [...header.querySelectorAll('button, a')].map((node) => {
        const rect = node.getBoundingClientRect();
        return { label: node.getAttribute('aria-label') || node.textContent.trim().slice(0, 40), x: Math.round(rect.x), w: Math.round(rect.width), right: Math.round(rect.right) };
      });
      return JSON.stringify({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        headerRight: Math.round(header.getBoundingClientRect().right),
        buttons,
      });
    })()`,
    returnByValue: true,
  });
  console.log(name, metrics.result.value);
  const image = await cdp.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}\\${name}.png`, Buffer.from(image.data, "base64"));
}

await waitForDebugger();
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === "page");
const cdp = new Cdp(page.webSocketDebuggerUrl);
await cdp.open();
await cdp.send("Page.enable");
await shot(cdp, 390, "real-390", false);
await shot(cdp, 320, "real-320", false);
await shot(cdp, 390, "real-menu", true);
cdp.close();
chrome.kill();
