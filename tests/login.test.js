const { By, until } = require("selenium-webdriver");
const getDriver = require("../driver.js");

describe("Login Page Tests", function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await getDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("Loads login page", async () => {
        await driver.get("http://localhost:3000/login");
        let title = await driver.findElement(By.css("h2")).getText();
        if (!title.includes("Login")) throw new Error("Login title missing");
    });

    it("Shows validation errors", async () => {
        await driver.findElement(By.css("button[type='submit']")).click();

        const emailError = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Email is required')]")),
            3000
        );
        if (!emailError) throw new Error("Validation did not show for empty fields");
    });

    it("Logs in with correct credentials", async () => {
        await driver.findElement(By.id("email")).sendKeys("testuser123@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("password123");
        await driver.findElement(By.css("button[type='submit']")).click();

        await driver.sleep(1500);

        let url = await driver.getCurrentUrl();

        if (url.includes("login")) throw new Error("Login failed, still on login page");
    });
});
