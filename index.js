// Aflat acum în: /api/index.js
const express = require("express");
const app = express();
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

// Acest cod va rula doar ca o "funcție"
// Vercel se ocupă de partea de "server"
app.get("/api", async (req, res) => { // S-a schimbat din app.get("/")
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    const url = req.query.url;
    if (!url) {
        await browser.close();
        return res.status(400).send('Error: "url" parameter is missing.');
    }
    const width = req.query.width;
    const height = req.query.height;
    const full = req.query.full;

    if (width && height) {
      await page.setViewport({
        width: Number(width),
        height: Number(height),
      });
    }

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 25000 });
    
    const screenshot = await page.screenshot({ 
        fullPage: full === "true",
        type: 'png' // Poți schimba în 'jpeg' pentru fișiere mai mici
    });

    await browser.close();
    res.setHeader("Content-Type", "image/png");
    res.send(screenshot);

  } catch (e) {
    console.error(e); // Este mai bine să logăm eroarea în consolă
    // Trimite un mesaj de eroare mai prietenos
    res.status(500).send("Server Error: Could not generate screenshot. The URL might be invalid or the page is too complex.");
  }
});

// Partea cu app.listen() a fost ștearsă.
// Exportăm direct aplicația pentru Vercel.
module.exports = app;
