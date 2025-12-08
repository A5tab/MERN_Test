const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function getDriver() {
    let options = new chrome.Options();
    options.addArguments(
        "--headless",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--window-size=1920,1080"
    );

    return await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
}

module.exports = getDriver;
