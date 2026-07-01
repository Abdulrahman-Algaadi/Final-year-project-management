/**
 * Generate FYPMS walkthrough PDF from HTML.
 * Usage: node docs/generate-walkthrough-pdf.js
 */
const path = require("path");
const fs = require("fs");

async function main() {
  const htmlPath = path.join(__dirname, "FYPMS-System-Walkthrough.html");
  const pdfPath = path.join(__dirname, "FYPMS-System-Walkthrough.pdf");

  if (!fs.existsSync(htmlPath)) {
    console.error("HTML source not found:", htmlPath);
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.log("Installing puppeteer (one-time)...");
    const { execSync } = require("child_process");
    execSync("npm install puppeteer --no-save", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
    puppeteer = require("puppeteer");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, {
      waitUntil: "networkidle0",
    });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    console.log("PDF generated:", pdfPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
