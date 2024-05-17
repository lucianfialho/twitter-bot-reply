const { setupBrowser, delay } = require("../lib/utils");
require("dotenv").config();

async function loginOnLinkedin(page) {
  await page.goto("https://www.linkedin.com/login/pt");
  await page.waitForSelector("#username");
  await page.focus("#username");
  await delay(1000);
  await page.keyboard.type(process.env.LINKEDIN_USER_NAME);
  await delay(2000);

  await page.waitForSelector("#password");
  await page.focus("#password");
  await page.keyboard.type(process.env.LINKEDIN_PASSWORD);
  await delay(2000);
  await page.keyboard.press("Enter");
  await delay(4000);
}

async function getProfileInfo(page, profileUrl) {
  await page.goto(profileUrl);
  await page.waitForSelector("#profile-content", {
    timeout: 10000,
  });

  const name = await page.$eval("#profile-content h1", (el) =>
    el.textContent.trim()
  );
  const position = await page.$eval(
    "#profile-content [data-generated-suggestion-target^='urn:li:fsu_profileActionDelegate']",
    (el) => el.textContent.trim()
  );

  return { name, position };
}

async function run(profileUrls) {
  const [browser, page] = await setupBrowser();
  await loginOnLinkedin(page);

  for (const profileUrl of profileUrls) {
    try {
      const profileInfo = await getProfileInfo(page, profileUrl);
      console.log(`Nome: ${profileInfo.name}, Cargo: ${profileInfo.position}`);
    } catch (error) {
      console.error(`Erro ao acessar o perfil ${profileUrl}:`, error);
    }
  }

  await browser.close();
}

run(["https://www.linkedin.com/in/lucianfialho/"]);
