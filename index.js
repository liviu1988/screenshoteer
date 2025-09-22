const express = require("express");
const app = express();
const puppeteer = require("puppeteer-core"); // Modificat
const chromium = require("@sparticuz/chromium"); // Adăugat

const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const getBrowser = () =>
  process.env.NODE_ENV === "development"
    ? puppeteer.launch() // rulează local
    : puppeteer.launch({ // rulează pe Vercel
        args: chromium.args,
        executablePath: chromium.executablePath(),
        headless: chromium.headless,
      });

app.get("/", async (req, res) => {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    const url = req.query.url;
    const width = req.query.width;
    const height = req.query.height;
    const full = req.query.full;

    if (width && height) {
      await page.setViewport({
        width: Number(width),
        height: Number(height),
      });
    }
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const screenshot = await page.screenshot({ fullPage: full === "true" });
    await browser.close();
    res.set("Content-Type", "image/png");
    res.send(screenshot);
  } catch (e) {
    console.log(e);
    res.send("error: " + e);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app; // Adăugat pentru Vercel
