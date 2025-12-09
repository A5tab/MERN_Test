const { By, until } = require("selenium-webdriver");
const getDriver = require("./driver.js");

describe("Signup Page Tests", function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await getDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("Loads signup page", async () => {
        await driver.get("http://localhost:3000/signup");

        let title = await driver.findElement(By.css("h2")).getText();
        if (!title.includes("Create account")) throw new Error("Signup title missing");
    });

    it("Validates empty fields", async () => {
        await driver.findElement(By.css("button[type='submit']")).click();

        const usernameError = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Username is required')]")),
            3000
        );

        if (!usernameError) throw new Error("Validation did not trigger");
    });

    it("Accepts valid user signup data", async () => {
        await driver.get("http://localhost:3000/signup");

        await driver.findElement(By.id("username")).sendKeys("testuser123");
        await driver.findElement(By.id("email")).sendKeys("testuser123@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("password123");

        const avatar = await driver.findElement(By.id("avatarUploader"));
        await avatar.sendKeys(__dirname + "/dummy-avatar.png");

        await driver.findElement(By.css("button[type='submit']")).click();

        await driver.sleep(1500);

        // After success, user should redirect
        let url = await driver.getCurrentUrl();
        if (url === "http://localhost:3000/signup") {
            throw new Error("Signup probably failed (still on same page)");
        }
    });
});
