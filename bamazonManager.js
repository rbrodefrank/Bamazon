//Bamazon Manager node program

const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

//Global Variables
var stock = [];

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
                department_name: res[i].department_name,
                stock_quantity: res[i].stock_quantity,
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
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
            message: "What would you like to do?"
        }
    ]).then(function (response) {
        switch (response.main) {
            case "View Products for Sale":
                productList();
                break;
            case "View Low Inventory":
                lowStockList();
                break;
            case "Add to Inventory":
                increaseStock();
                break;
            case "Add New Product":
                addItem();
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}

function lowStockList() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // console.log(res);

        stock = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 10) {
                var item = {
                    item_id: res[i].item_id,
                    product_name: res[i].product_name,
                    department_name: res[i].department_name,
                    stock_quantity: res[i].stock_quantity,
                    price: res[i].price
                }
                stock.push(item);
            }
        }

        console.log();
        console.table(stock);
        console.log();

        main();
    });
}

function increaseStock() {
    inquirer.prompt([
        {
            name: "product",
            message: `\nWhat is the product id you want to add stock to?\nInput "back" to go to main menu.`,
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
                    console.log(`Product Selected: ${stock[i].product_name}\nProduct Stock: ${stock[i].stock_quantity}`);
                    break;
                }
            }

            if (product < 0) {
                console.log("Invalid Input. Please input product ID.");
                increaseStock();
            } else {
                stockQuantity(product);
            }
        }
    });
}

function stockQuantity(product) {
    inquirer.prompt([
        {
            name: "quantity",
            type: "input",
            message: `How many more '${product.product_name}' would you like to get?`
        }
    ]).then(function (answers) {
        var num = parseInt(answers.quantity);
        if (!Number.isNaN(num) && num > 0) {
            connection.query(
                "SELECT * FROM products WHERE ?",
                {
                    item_id: product.item_id
                },
                function(error, res) {
                    if(error) throw error;
                    var currentStock = res[0].stock_quantity;
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {stock_quantity: currentStock + num},
                            {item_id: product.item_id}
                        ],
                        function(error, res) {
                            if(error) throw error;
                            console.log(`Increased ${product.product_name} by ${num}. Total stock is now ${num + currentStock}`);
                            main();
                        }
                    )
                }
            );
        } else if (num === 0) {
            console.log(`0 ${product.product_name} added to inventory.`);
        } else {
            console.log("Invalid Input: Please input a number");
            stockQuantity(product);
        }
    });
}

function addItem() {
    console.log("Not implemented");
    main();
}