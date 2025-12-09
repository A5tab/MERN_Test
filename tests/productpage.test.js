const { By, until } = require("selenium-webdriver");
const getDriver = require("../drivers.js");

describe("Product Page Tests", function () {
    this.timeout(60000);
    let driver;

    before(async () => {
        driver = await getDriver();
    });

    after(async () => {
        await driver.quit();
    });

    const injectMockProducts = async (mockProduct) => {
        await driver.executeScript(`
            localStorage.setItem("products_state", JSON.stringify({
                products: ${JSON.stringify([mockProduct])},
                loading: false
            }));

            localStorage.setItem("persist:root", JSON.stringify({
                cart: JSON.stringify({
                    cartProducts: []
                })
            }));
        `);
    };

    it("Shows loading screen first", async () => {
        await driver.executeScript(`
            localStorage.setItem("products_state", JSON.stringify({
                products: [],
                loading: true
            }));
        `);

        await driver.get("http://localhost:3000/product/123");

        const txt = await driver.findElement(By.xpath("//h2[contains(text(),'Loading')]")).getText();
        if (!txt.includes("Loading")) {
            throw new Error("Loading screen did not appear");
        }
    });

    it("Shows 'Product Not Found' when no product matches", async () => {
        await injectMockProducts({
            _id: "100",
            title: "Another Product"
        });

        await driver.get("http://localhost:3000/product/999");  // ID mismatch

        const txt = await driver.findElement(By.xpath("//h2[contains(text(),'Product Not Found')]")).getText();
        if (!txt.includes("Product Not Found")) {
            throw new Error("Product not found message missing");
        }
    });

    it("Loads correct product details", async () => {
        const mockProduct = {
            _id: "123",
            title: "Gaming Laptop",
            price: 1500,
            stock: 10,
            mainImage: "https://example.com/laptop-main.jpg",
            images: [
                "https://example.com/laptop-1.jpg",
                "https://example.com/laptop-2.jpg"
            ],
            features: ["RGB Keyboard,16GB RAM,RTX 4060"],
            description: "<p>High performance gaming laptop</p>"
        };

        await injectMockProducts(mockProduct);

        await driver.get("http://localhost:3000/product/123");

        const title = await driver.findElement(By.xpath("//h1")).getText();
        if (!title.includes("Gaming Laptop")) throw new Error("Product title incorrect");

        const price = await driver.findElement(By.xpath("//*[contains(text(),'$1500')]")).getText();
        if (!price.includes("1500")) throw new Error("Price incorrect");
    });

    it("Renders product image gallery", async () => {
        const imgs = await driver.findElements(By.css("img.h-24.w-24.object-cover"));
        if (imgs.length < 2) {
            throw new Error("Product gallery not rendered");
        }
    });

    it("Sanitized description renders correctly", async () => {
        const desc = await driver.findElement(By.xpath("//*[contains(text(),'High performance')]")).getText();
        if (!desc.includes("High performance")) {
            throw new Error("Description missing or not sanitized");
        }
    });

    it("Features list is rendered", async () => {
        const feature = await driver.findElement(By.xpath("//span[contains(text(),'16GB RAM')]")).getText();
        if (!feature.includes("16GB RAM")) {
            throw new Error("Features list not rendered");
        }
    });

    it("Add To Cart button works", async () => {
        const addBtn = await driver.findElement(By.xpath("//button[contains(text(),'Add To Cart')]"));
        await addBtn.click();
        await driver.sleep(500);

        // verify Redux cart updated via localStorage
        const cartState = await driver.executeScript(`
            return JSON.parse(JSON.parse(localStorage.getItem("persist:root")).cart);
        `);

        if (!cartState.cartProducts.length) {
            throw new Error("Add to cart did not update state");
        }
    });

    it("Disables Add to Cart when stock = 0", async () => {
        const outOfStockProduct = {
            _id: "500",
            title: "Printer",
            price: 200,
            stock: 0,
            mainImage: "",
            images: [],
            features: ["Fast printing"],
            description: "<p>Out of stock item</p>"
        };

        await injectMockProducts(outOfStockProduct);
        await driver.get("http://localhost:3000/product/500");

        const btn = await driver.findElement(By.xpath("//button[contains(text(),'Currently Unavailable')]"));
        const disabled = await btn.getAttribute("disabled");

        if (!disabled) throw new Error("Add to Cart should be disabled when stock is 0");
    });

    it("Disables Add to Cart when added quantity reaches stock", async () => {
        const limitedStockProduct = {
            _id: "800",
            title: "SSD Drive",
            price: 100,
            stock: 1,
            mainImage: "",
            images: [],
            features: ["500MB/s"],
            description: "<p>Fast SSD</p>"
        };

        // First add to cart
        await injectMockProducts(limitedStockProduct);
        await driver.executeScript(`
            localStorage.setItem("persist:root", JSON.stringify({
                cart: JSON.stringify({
                    cartProducts: [{ id:"800", quantity:1, price:100, title:"SSD Drive" }]
                })
            }));
        `);

        await driver.get("http://localhost:3000/product/800");

        const btn = await driver.findElement(By.xpath("//button[contains(text(),'Cart Limit Reached')]"));
        const disabled = await btn.getAttribute("disabled");

        if (!disabled) throw new Error("Button should be disabled when cart limit is reached");
    });
});
