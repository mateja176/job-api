const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/concepts/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  '*/1 * * * *': async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(
      'https://www.linkedin.com/jobs/search/?distance=50&f_TP=1&geoId=105353691&keywords=react&location=Belgrade%2C%20Centralna%20Srbija%2C%20Serbia',
    );
    let content = await page.content();

    // 1 - Load the HTML
    const $ = cheerio.load(content);

    // 2 - Select the HTML element you need
    // For the tutorial case, we need to select the list of jobs and for each element, we will
    // create a new job object to store it in the database with Strapi.
    $('li.result-card.job-result-card').each((i, el) => {
      if (Array.isArray(el.children)) {
        const job = {
          title: el.children[0].children[0].children[0].data,
          linkedinUrl: el.children[0].attribs.href,
          companyName:
            el.children[2].children[1].children[0].data ||
            el.children[2].children[1].children[0].children[0].data,
          descriptionSnippet:
            el.children[2].children[2].children[1].children[0].data,
          timeFromNow: el.children[2].children[2].children[2].children[0].data,
        };

        // 4 - Store the job with the Strapi global.
        strapi.services.job.create(job);
      }
    });

    // 5 - Close the browser
    browser.close();
  },
};
