const puppeteer = require('puppeteer');

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

    // Klik tombol login Twitter
    await page.waitForSelector('button[class*="chakra-button"]');
    await page.click('button[class*="chakra-button"]');

    // Tunggu redirect ke halaman login Twitter
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Isi username
    await page.waitForSelector('input[name="text"]');
    await page.type('input[name="text"]', username, { delay: 50 });
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);

    // Jika minta input password
    const passwordSelector = 'input[name="password"]';
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    await page.type(passwordSelector, password, { delay: 50 });
    await page.keyboard.press('Enter');

    // Tunggu redirect ke faucet lagi
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Ambil oauth_token dan oauth_verifier dari URL
    const url = page.url();
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const oauthToken = urlParams.get('oauth_token');
    const oauthVerifier = urlParams.get('oauth_verifier');

    if (!oauthToken || !oauthVerifier) {
      throw new Error('Gagal mendapatkan OAuth token. Mungkin akun terkena checkpoint.');
    }

    await browser.close();
    return { oauthToken, oauthVerifier };

  } catch (error) {
    await browser.close();
    throw error;
  }
};

module.exports = { loginTwitter };
  
