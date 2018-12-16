//Bamazon Customer node program

const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

//Global Variables
var stock = [];
var cart = [];

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    productList();
});

function productList() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // console.log(res);

        stock = [];
        for (var i = 0; i < res.length; i++) {
            var item = {
                item_id: res[i].item_id,
                product_name: res[i].product_name,
                price: res[i].price
            }
            stock.push(item);
        }

        console.log();
        console.table(stock);
        console.log();

        main();
    });
}

function main() {
    inquirer.prompt([
        {
            name: "main",
            type: "list",
            choices: ["Product List", "Product Purchase", "Cart List", "Checkout", "Exit"],
            message: "What would you like to do?"
        }
    ]).then(function (response) {
        switch (response.main) {
            case "Product List":
                productList();
                break;
            case "Product Purchase":
                purchaseProduct();
                break;
            case "Cart List":
                cartList(false);
                break;
            case "Checkout":
                checkout();
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}

function purchaseProduct() {
    inquirer.prompt([
        {
            name: "product",
            message: `\nWhat is the id of the product you want to purchase?\nInput "back" to go to main menu.`,
            type: "input"
        }
    ]).then(function (answers) {
        var product = -4;
        // console.log(answers.product);

        if (answers.product.toLowerCase() == "back") {
            main();
        } else {
            var int = parseInt(answers.product);
            for (var i = 0; i < stock.length; i++) {
                // console.log(`id: ${stock[i].item_id}`);
                if (int == stock[i].item_id) {
                    product = stock[i];
                    console.log(`Product Selected: ${stock[i].product_name}\nProduct Price: ${stock[i].price}`);
                    break;
                }
            }

            if (product < 0) {
                console.log("Invalid Input. Please input product ID.");
                purchaseProduct();
            } else {
                productQuantity(product);
            }
        }
    });
}

function cartList(checkout) {
    if (cart.length < 1) {
        console.log("Cart Empty!");
    } else {
        console.log();
        console.table(cart);
        console.log();
        var totalPrice = 0;
        for (var i = 0; i < cart.length; i++) {
            totalPrice += cart[i].quantity * cart[i].price;
        }
        console.log(`Total: ${totalPrice}`);
    }
    if (!checkout) {
        main();
    }
}

function productQuantity(product) {
    inquirer.prompt([
        {
            name: "quantity",
            type: "input",
            message: "How many would you like to buy?"
        }
    ]).then(function (answers) {
        var num = parseInt(answers.quantity);
        if (!Number.isNaN(num) && num > 0) {
            var notInCart = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].item_id == product.item_id) {
                    cart[i].quantity += num;
                    notInCart = false;

                    break;
                }
            }

            if (notInCart) {
                cart.push({
                    item_id: product.item_id,
                    product_name: product.product_name,
                    quantity: num,
                    price: product.price
                });
            }
            console.log(`${answers.quantity} ${product.product_name} added to cart.`);
            main();
        } else if (num === 0) {
            console.log(`0 ${product.product_name} added to cart.`);
        } else {
            console.log("Invalid Input: Please input a number");
            productQuantity(product);
        }
    });
}

function checkout() {
    cartList(true);

    //Reduce Stock
    inquirer.prompt([
        {
            name: "confirm",
            type: "confirm",
            message: "Are you sure you want to checkout?"
        }
    ]).then(function (answers) {
        if (answers.confirm) {
            //Check and reduce Stock
            checkStock(0);
        } else {
            main();
        }
    });
}

function checkStock(count) {
    if (count < cart.length) {
        // console.log(`cart[${count}]: ${cart[count].item_id}`);
        connection.query(
            "SELECT stock_quantity FROM products WHERE ?",
            {
                item_id: cart[count].item_id
            },
            function (error, res) {
                if (error) throw error;
                // console.log("returned " + count)
                // console.log(res[0].stock_quantity);

                if (res[0].stock_quantity <= 0) {
                    console.log(`\n${cart[count].product_name} is Out of Stock. Item removed from cart list`);
                    cart[count].quantity = 0;
                } else if (res[0].stock_quantity < cart[count].quantity) {
                    console.log(`\n${cart[count].product_name} is low on stock. Quantity purchased reduced to ${res[0].stock_quantity}`);
                    cart[count].quantity = res[0].stock_quantity;
                }

                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: res[0].stock_quantity - cart[count].quantity
                        },
                        {
                            item_id: cart[count].item_id
                        }
                    ],
                    function (error, res) {
                        if (error) throw error;
                        // console.log("Updated product");
                        // console.log(res);

                        count++;
                        checkStock(count);
                    }
                );
            }
        )
    } else {
        console.log("You have successfully checked out.\n");
        main();
    }
}