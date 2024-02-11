const puppeteer = require("puppeteer");
const { OpenAI } = require("openai");

require("dotenv").config();

const configuration = {
  apiKey: process.env.OPENAI_SECRET,
};

const openai = new OpenAI(configuration);

const setupBrowser = async () => {
  const viewPortHeight = 1024;
  const viewPortWidth = 1080;

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setViewport({ width: viewPortWidth, height: viewPortHeight });

  return [browser, page];
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loginOnTwitter(page) {
  await page.goto("https://twitter.com/i/flow/login");

  await page.waitForSelector('[autocomplete="username"]');
  await page.focus('[autocomplete="username"]');
  await delay(1000);
  await page.keyboard.type(process.env.TWITTER_USERNAME);

  await page.keyboard.press("Enter");
  await delay(2000);

  await page.waitForSelector('[autocomplete="current-password"]');
  await page.focus('[autocomplete="current-password"]');
  await page.keyboard.type(process.env.TWITTER_PASSWORD);
  await delay(2000);
  await page.keyboard.press("Enter");
  await delay(4000);
}

async function interact(tweet) {
  const targetCharCount = 240;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Você pode mudar para o modelo que você quiser
    max_tokens: 70,
    temperature: 0.5,
    top_p: 1,
    messages: [
      {
        role: "user",
        content: `${process.env.PROMPT}
            ${tweet}`,
      },
    ],
  });

  if (response.status === 503 || response.status === 500) {
    console.log("API da OpenAI indisponível. Tratamento do erro aqui.");
    return null;
  }

  const responseContent = response.choices[0].message.content;

  if (responseContent.length > targetCharCount) {
    let lastPunctuationIndex = -1;
    const punctuationMarks = [".", "!", "?"];
    punctuationMarks.forEach((punctuation) => {
      const lastIndex = responseContent.lastIndexOf(
        punctuation,
        targetCharCount
      );
      if (lastIndex > lastPunctuationIndex) {
        lastPunctuationIndex = lastIndex;
      }
    });

    if (lastPunctuationIndex === -1) {
      lastPunctuationIndex = responseContent.lastIndexOf(" ", targetCharCount);
    }

    const truncatedResponse = responseContent.substring(
      0,
      lastPunctuationIndex + 1
    );
    return truncatedResponse;
  }

  return responseContent;
}

function getRandomComment() {
  const genericComments = process.env.RANDOM_STATIC_TWEETS.split(",");

  const randomIndex = Math.floor(Math.random() * genericComments.length);
  return genericComments[randomIndex];
}

async function twitterSearchAndComment(page, newTweetContent) {
  try {
    await page.goto(process.env.TWITTER_URL_TO_FETCH);
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });

    await page.click(
      '[data-testid="cellInnerDiv"]:nth-child(2) [data-testid="tweetText"]'
    );

    await page.waitForSelector('[data-testid="reply"]', { timeout: 10000 });
    await page.click('[data-testid="reply"]');

    await page.waitForSelector('[data-testid="tweetTextarea_0"]', {
      timeout: 10000,
    });

    const comment = await getRandomComment(); // você pode mudar para a funcao interact para usar a IA não esqueca de passar o argumento newTweetContent
    await page.type('[data-testid="tweetTextarea_0"]', comment);

    await page.waitForSelector('[data-testid="tweetButton"]', {
      timeout: 10000,
    });
    await page.click('[data-testid="tweetButton"]');
  } catch (error) {
    console.error("Erro ao tentar comentar no tweet:", error);
  }
}

async function run() {
  const [browser, page] = await setupBrowser();
  await loginOnTwitter(page);

  let lastTweetContent = "";

  while (true) {
    try {
      await page.goto(process.env.TWITTER_URL_TO_FETCH);
      await page.waitForSelector('[data-testid="tweetText"]', {
        timeout: 10000,
      });

      const newTweetContent = await page.$eval(
        '[data-testid="cellInnerDiv"]:nth-child(2) [data-testid="tweetText"]',
        (el) => el.textContent
      );

      if (newTweetContent !== lastTweetContent) {
        console.log("Novo tweet detectado. Preparando para comentar...");
        lastTweetContent = newTweetContent;
        await twitterSearchAndComment(page, newTweetContent);
      } else {
        console.log(
          "Nenhum tweet novo encontrado. Aguardando para a próxima verificação..."
        );
      }
    } catch (error) {
      console.error("Erro durante a verificação de novos tweets:", error);
    }

    await delay(1 * 60 * 1000);
  }
}
run();
