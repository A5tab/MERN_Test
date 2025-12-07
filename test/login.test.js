const { expect } = require("chai");
const driver = require("../helpers/driver");

describe("Login Test", function () {
  this.timeout(30000);
  let browser;

  before(async () => browser = await driver());
  after(async () => await browser.quit());

  it("should login successfully", async () => {
    await browser.get("http://your-ec2-ip:3000/login");

    const email = await browser.findElement({ css: "#email" });
    const pass = await browser.findElement({ css: "#password" });
    const btn = await browser.findElement({ css: "#loginBtn" });

    await email.sendKeys("test@test.com");
    await pass.sendKeys("123456");
    await btn.click();

    const url = await browser.getCurrentUrl();
    expect(url).to.include("/dashboard");
  });
});
