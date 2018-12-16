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

                break;
            case "Add New Product":

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