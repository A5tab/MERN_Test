const { By, until } = require("selenium-webdriver");
const getDriver = require("./drivers.js");

describe("Cart Details Tests", function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await getDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("Loads Cart Panel", async () => {
        await driver.get("http://localhost:3000/cart");

        let title = await driver.findElement(By.xpath("//h2[contains(text(),'Your Cart')]")).getText();
        if (!title.includes("Your Cart")) throw new Error("Cart title missing");
    });

    it("Displays products inside cart", async () => {
        await driver.executeScript(`
            localStorage.setItem("persist:root", JSON.stringify({
                cart: JSON.stringify({
                    cartProducts: [
                        { id:"1", title:"Laptop", price:1200, quantity:1 }
                    ],
                    cartTabClicked: true
                })
            }));
        `);

        await driver.get("http://localhost:3000/cart");

        const product = await driver.findElement(By.xpath("//h3[contains(text(),'Laptop')]")).getText();
        if (!product.includes("Laptop")) throw new Error("Cart product missing");
    });

    it("Increase quantity button works", async () => {
        const increaseBtn = await driver.findElement(By.xpath("//button[contains(text(),'+')]"));
        await increaseBtn.click();
        await driver.sleep(800);

        let qtyText = await driver.findElement(By.xpath("//p[contains(text(),'Quantity')]")).getText();
        if (!qtyText.includes("2")) throw new Error("Quantity not increased");
    });

    it("Decrease quantity button works", async () => {
        const decreaseBtn = await driver.findElement(By.xpath("//button[contains(text(),'-')]"));
        await decreaseBtn.click();
        await driver.sleep(800);

        let qtyText = await driver.findElement(By.xpath("//p[contains(text(),'Quantity')]")).getText();
        if (!qtyText.includes("1")) throw new Error("Quantity not decreased");
    });

    it("Total price updates correctly", async () => {
        const total = await driver.findElement(By.xpath("//span[contains(text(),'$')]")).getText();

        if (!total.includes("1200")) throw new Error("Total price incorrect");
    });

    it("Proceeds to checkout page", async () => {
        const btn = await driver.findElement(By.xpath("//button[contains(text(),'Proceed to Checkout')]"));
        await btn.click();
        await driver.sleep(800);

        const url = await driver.getCurrentUrl();
        if (!url.includes("/checkout")) throw new Error("Did not navigate to checkout");
    });
});
