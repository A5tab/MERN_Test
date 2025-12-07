const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

module.exports = async function driver() {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
};
