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
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // console.log(res);

        stock = [];
        for (var i = 0; i < res.length; i++) {
            var item = {
                item_id: res[i].item_id,
                product_name: res[i].product_name,
                // department_name: res[i].department_name,
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
                afterConnection();
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
        answers.product = parseInt(answers.product);
        for (var i = 0; i < stock.length; i++) {
            if (answers.product == stock[i]) {
                product = stock[i];
                break;
            }
        }

        if (answers.product.toLowerCase() == "back") {
            main();
        } else if (product < 0) {
            console.log("Invalid Input. Please input product ID.");
            purchaseProduct();
        } else {
            productQuantity(product);
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
        if (!Number.isNaN(num)) {
            cart.push({
                item_id: product.item_id,
                product_name: product.product_name,
                quantity: num,
                price: product.price
            });
            main();
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
            //Reduce Stock
            console.log("You have successfully checked out.");
            connection.end();
        } else {
            main();
        }
    });
}