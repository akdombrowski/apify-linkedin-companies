// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require("apify");
const { log } = Apify.utils;
const Puppeteer = require("puppeteer");

Apify.main(async () => {
  // Get input of the actor (here only for demonstration purposes).
  // If you'd like to have your input checked and have Apify display
  // a user interface for it, add INPUT_SCHEMA.json file to your actor.
  // For more information, see https://docs.apify.com/actors/development/input-schema
  // linkedin company directory page
  // const url = "https://www.linkedin.com";
  const url =
    "https://www.linkedin.com/directory/companies?trk=homepage-basic_directory_companyDirectoryUrl";
  // see if the user wants to filter by company
  const input = {
    username: "",
    password: "",
    company: "Amazon",
  };

  const date = new Date();
  const dateLocale = date.toISOString();

  const companyFilter = input ? input.company : null;

  try {
    let launchOptions = { headless: false, slowMo: 000 };
    let launchContext = {
      launchOptions: launchOptions,
    };
    const handlePageFunction = async ({ request, $ }) => {};
    // Assuming previous existence of the '$' and 'requestQueue' variables.

    log.info("Launching Puppeteer...");
    // console.log("Launching Puppeteer...");
    const browser = await Apify.launchPuppeteer(launchContext);
    // const browser = await Puppeteer.launch(launchContext);
    try {
      const page = await browser.newPage();

      // Turn on ability to abort requests.
      await page.setRequestInterception(true);

      // log to browser console to terminal
      page.on("console", async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
          console.log(await msgArgs[i].jsonValue());
        }
      });

      // catch the request to authwall and abort
      // page.once("request", async (request) => {
      //   try {
      //     // BLOCK
      //     const isAuthWall = request
      //       .url()
      //       .startsWith("https://www.linkedin.com/authwall");
      //     if (isAuthWall) {
      //       log.info("blocking request to navigate to login/register page");
      //       log.info("request:");
      //       log.info(request.method());
      //       log.info(request.url());
      //       log.info(request.headers());
      //       log.info(request.postData());
      //       log.info(request.resourceType());
      //       await request.abort();
      //     } else {
      //       await request.continue();
      //     }
      //   } catch (e) {
      //     log.error(e);
      //   }
      // });

      // page.off("request");

      log.info(`Opening page ${url}...`);
      await page.goto(url);

      // Take screenshot of home page
      await page.screenshot({
        path: "./screenshots/linkedin-" + dateLocale + ".png",
        fullPage: true,
      });

      // Get title of the page.
      const title = await page.title();
      log.info(`Title of the page "${url}" is "${title}".`);

      // Save title to table
      log.info("Saving output...");
      await Apify.setValue("title", {
        title,
      });

      log.info("Logging in...");
      let term;
      let interestRate;
      let discountPoints;
      let apr;
      let obj = {};
      let selector = ".authwall-join-form__form-toggle--bottom";
      let clickOptions = {};
      let waitOptions = { timeout: 120000 };

      const waitForSignInBtn = await page.waitForSelector(
        selector,
        waitOptions
      );

      // const signInBtn = await page.$(selector);
      // const link = await signInBtn.getProperty("href");
      // const jsonLink = await link.jsonValue();

      // const requestQueue = await Apify.openRequestQueue();

      // // Block all requests to URLs that include `?authwall` and also all defaults.
      // await Apify.utils.puppeteer.blockRequests(page, {
      //   extraUrlPatterns: ["authwall"],
      // });

      // await Apify.utils.puppeteer.enqueueLinksByClickingElements({
      //   page,
      //   requestQueue,
      //   selector: selector,
      //   pseudoUrls: [
      //     "https://www.linkedin.com/directory/companies?trk=homepage-basic_directory_companyDirectoryUrl",
      //   ],
      // });

      log.info(`Navigating to Sign In Page by clicking Sign In Button...`);
      const [response] = await Promise.all([
        page.waitForNavigation(),
        // page.goto(jsonLink),
        page.click(selector),
      ]);

      await page.screenshot({
        path: "./screenshots/linkedincompaniesdirectory-" + dateLocale + ".png",
        fullPage: true,
      });

      // should return array of links to the companies individual pages
      selector = "input[autocomplete=username]";
      const usernameInput = await page.$(selector);
      page.type(selector, username);

      // if (companiesList.length > 0) {
      //   // First we create the request queue instance.
      //   const requests = [];
      //   for (company of companiesList) {
      //     const href = await company.evaluate((node) => node.href);
      //     requests.push(href);

      //     // await requestQueue.addRequest({ url: href });

      //     // log.info(href);
      //   }
      //   // Create a RequestList
      //   const requestList = await Apify.openRequestList(
      //     "company-urls",
      //     requests
      //   );

      //   // await Apify.utils.puppeteer.enqueueLinksByClickingElements({
      //   //   page,
      //   //   requestQueue,
      //   //   selector: "a.product-detail",
      //   //   pseudoUrls: [
      //   //     "https://www.linkedin.com/handbags/[.*]",
      //   //     "https://www.example.com/purses/[.*]",
      //   //   ],
      //   // });

      //   // Function called for each URL
      //   const handlePageFunction = async ({ request, page }) => {
      //     await page.waitForNavigation();
      //     const title = await page.title();
      //     console.log(`URL: ${request.url}\nTITLE: ${title}`);
      //   };
      //   // Create a PuppeteerCrawler
      //   const crawler = new Apify.PuppeteerCrawler({
      //     requestQueue,
      //     handlePageFunction,
      //   });
      //   // Run the crawler
      //   await crawler.run();
      // } else {
      //   throw Error("companies link list is empty");
      // }
    } catch (error) {
      log.error("browser or other error:");
      log.error(error);
    } finally {
      log.info("Closing Puppeteer...");
      await browser.close();

      log.info("Done.");
    }
  } catch (e) {
    log.error("Launch Puppeteer error:");
    log.error(e);
  }
});
