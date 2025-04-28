const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Aktifkan plugin stealth
puppeteer.use(StealthPlugin());

const loginTwitter = async (account, proxy) => {
  const { username, password } = account;
  const faucetUrl = 'https://faucet.0g.ai';

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
  };

  if (proxy) {
    launchOptions.args.push(`--proxy-server=${proxy}`);
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  try {
    await page.goto(faucetUrl, { waitUntil: 'networkidle2' });

    // Klik tombol Login Twitter
    await page.waitForSelector('button[class*="chakra-button"]');
    await page.click('button[class*="chakra-button"]');

    // Tunggu halaman login Twitter muncul
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Isi username
    await page.waitForSelector('input[name="text"]', { timeout: 15000 });
    await page.type('input[name="text"]', username, { delay: 50 });
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);

    // Isi password
    const passwordSelector = 'input[name="password"]';
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    await page.type(passwordSelector, password, { delay: 50 });
    await page.keyboard.press('Enter');

    // Tunggu balik ke faucet
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const url = page.url();
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const oauthToken = urlParams.get('oauth_token');
    const oauthVerifier = urlParams.get('oauth_verifier');

    if (!oauthToken || !oauthVerifier) {
      throw new Error('Gagal mendapatkan OAuth token, mungkin akun terkena checkpoint.');
    }

    await browser.close();
    return { oauthToken, oauthVerifier };

  } catch (error) {
    await browser.close();
    throw error;
  }
};

module.exports = { loginTwitter };
