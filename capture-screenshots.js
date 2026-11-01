/**
 * InventoryHub — Automated Screenshot Generator
 * Launches Express server, interacts with Postman Studio UI via Puppeteer,
 * and saves high-resolution screenshot figures for the academic report.
 */

import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server.js';
import { db } from './models/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('Resetting database seed for pristine screenshot capture...');
  db.resetSeed();

  const PORT = 4099;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920, deviceScaleFactor: 1.5 });

  try {
    // 1. Figure 1: Postman GET All Products (200 OK)
    console.log('Capturing Figure 1: GET All Products (200 OK)...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.select('#presetSelector', 'get_all');
    await new Promise(r => setTimeout(r, 200));
    await page.click('#btnSendRequest');
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(__dirname, 'fig1_postman_get_all.png') });

    // 2. Figure 2: Postman POST Create New Record (201 Created)
    console.log('Capturing Figure 2: POST Create Product (201 Created)...');
    await page.select('#presetSelector', 'post_create');
    await new Promise(r => setTimeout(r, 200));
    await page.click('#btnSendRequest');
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(__dirname, 'fig2_postman_post_create.png') });

    // 3. Figure 3: Postman PUT Full Update (200 OK)
    console.log('Capturing Figure 3: PUT Update Product (200 OK)...');
    await page.select('#presetSelector', 'put_update');
    await new Promise(r => setTimeout(r, 200));
    await page.click('#btnSendRequest');
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(__dirname, 'fig3_postman_put_update.png') });

    // 4. Figure 4: Postman DELETE Record (200 OK)
    console.log('Capturing Figure 4: DELETE Product (200 OK)...');
    await page.select('#presetSelector', 'delete');
    await new Promise(r => setTimeout(r, 200));
    await page.click('#btnSendRequest');
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: path.join(__dirname, 'fig4_postman_delete.png') });

    // 5. Figure 5: Complete Database Table & REST API Documentation
    console.log('Capturing Figure 5: Warehouse Database Records & REST API Docs...');
    await page.select('#presetSelector', 'get_stats');
    await new Promise(r => setTimeout(r, 200));
    await page.click('#btnSendRequest');
    await new Promise(r => setTimeout(r, 500));
    // Scroll down slightly to showcase database table and docs
    await page.evaluate(() => window.scrollBy(0, 380));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(__dirname, 'fig5_dashboard_crud.png') });

    console.log('All 5 high-resolution figures captured successfully!');
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
}

capture().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
