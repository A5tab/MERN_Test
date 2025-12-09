const { By, until } = require("selenium-webdriver");
const getDriver = require("../driver.js");

describe("Checkout Page Tests", function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await getDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("Loads checkout page", async () => {
        await driver.get("http://localhost:3000/checkout");

        const title = await driver.findElement(By.xpath("//h1[contains(text(),'Checkout')]")).getText();
        if (!title.includes("Checkout")) throw new Error("Checkout page title missing");
    });

    it("Shows empty cart state when no products", async () => {
        await driver.get("http://localhost:3000/checkout");

        const emptyMsg = await driver.findElement(By.xpath("//*[contains(text(),'Your cart is empty')]")).getText();
        if (!emptyMsg.includes("cart is empty")) throw new Error("Empty state missing");
    });

    it("Displays product list when cart has items", async () => {
        // Setup mock cart state using localStorage (your app reads ReduxStore hydrated)
        await driver.executeScript(`
            localStorage.setItem("persist:root", JSON.stringify({
                cart: JSON.stringify({
                    cartProducts: [
                        { id:"1", title:"Test Product", price:50, quantity:2 }
                    ]
                })
            }));
        `);

        await driver.get("http://localhost:3000/checkout");

        const productTitle = await driver.findElement(By.xpath("//span[contains(text(),'Test Product')]")).getText();
        if (!productTitle.includes("Test Product")) throw new Error("Product not shown");
    });

    it("Shows correct total price", async () => {
        await driver.get("http://localhost:3000/checkout");

        const total = await driver.findElement(By.xpath("//*[contains(text(),'Total')]")).getText();
        if (!total.includes("100")) throw new Error("Total price incorrect");
    });

    it("Can click Proceed to Payment", async () => {
        await driver.findElement(By.xpath("//button[contains(text(),'Proceed to Payment')]")).click();
        await driver.sleep(500);
    });
});
