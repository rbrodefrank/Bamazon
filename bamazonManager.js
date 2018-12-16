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
                function (error, res) {
                    if (error) throw error;
                    var currentStock = res[0].stock_quantity;
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            { stock_quantity: currentStock + num },
                            { item_id: product.item_id }
                        ],
                        function (error, res) {
                            if (error) throw error;
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
    var newProduct = {
        product_name: "",
        department_name: "",
        department_id: -4,
        stock_quantity: -4,
        price: -4
    }
    itemName(newProduct);
    function itemName(newProduct) {
        inquirer.prompt([
            {
                name: "name",
                type: "input",
                message: "What is the name of the new item?"
            }
        ]).then(function (answers) {
            newProduct.product_name = answers.name;
            inquirer.prompt([
                {
                    name: "confirm",
                    type: "confirm",
                    message: `Is '${newProduct.product_name}' correct?`
                }
            ]).then(function (answers) {
                if (answers.confirm) {
                    itemDepartment(newProduct);
                } else {
                    newProduct.product_name = "";
                    itemName(newProduct);
                }
            });
        });
    }

    function itemDepartment(newProduct) {
        inquirer.prompt([
            {
                name: "department",
                type: "input",
                message: "What department is the new item a part of?"
            }
        ]).then(function (answers) {
            newProduct.department_name = answers.department;
            inquirer.prompt([
                {
                    name: "confirm",
                    type: "confirm",
                    message: `Is '${newProduct.department_name}' correct?`
                }
            ]).then(function (answers) {
                if (answers.confirm) {
                    connection.query(
                        "SELECT department_name, department_id FROM departments",
                        function(error, res) {
                            if(error) throw error;
                            for(var i = 0; i < res.length; i++) {
                                if(res[i].department_name.toLowerCase() == newProduct.department_name.toLowerCase()) {
                                    newProduct.department_name = res[i].department_name;
                                    newProduct.department_id = res[i].department_id;
                                    break;
                                }
                            }

                            if(newProduct.department_id > 0) {
                                console.log(`\nDepartment Found.\nDepartment Name: ${newProduct.department_name}\nDepartment ID: ${newProduct.department_id}\n`);
                                itemQuantity(newProduct);
                            } else {
                                newProduct.department_name = "";
                                console.table(res);
                                console.log("Department not found input department name from above list\n");
                                itemDepartment(newProduct);
                            }
                        }
                    )
                } else {
                    newProduct.product_name = "";
                    itemDepartment(newProduct);
                }
            });
        });
    }

    function itemQuantity(newProduct) {
        inquirer.prompt([
            {
                name: "quantity",
                type: "input",
                message: "What is the initial inventory ammount?"
            }
        ]).then(function (answers) {
            var num = parseInt(answers.quantity);
            if (!Number.isNaN(num)) {
                if (num >= 0) {
                    newProduct.stock_quantity = num;
                    inquirer.prompt([
                        {
                            name: "confirm",
                            type: "confirm",
                            message: `Is '${newProduct.stock_quantity}' correct?`
                        }
                    ]).then(function (answers) {
                        if (answers.confirm) {
                            itemPrice(newProduct);
                        } else {
                            newProduct.stock_quantity = -4;
                            itemQuantity(newProduct);
                        }
                    });
                } else {
                    console.log("Initial stock quantity must be greater than or equal to zero.")
                    itemQuantity(newProduct);
                }
            } else {
                console.log("Invalid Input: Please enter a number");
                itemQuantity(newProduct);
            }
        });
    }

    function itemPrice(newProduct) {
        inquirer.prompt([
            {
                name: "price",
                type: "input",
                message: "What is the item's sale price?"
            }
        ]).then(function (answers) {
            var num = parseFloat(answers.price);
            if (!Number.isNaN(num)) {
                num = Math.floor(num * 100) / 100; //floor to 1/100th decimal place
                if (num >= 0) {
                    newProduct.price = num;
                    inquirer.prompt([
                        {
                            name: "confirm",
                            type: "confirm",
                            message: `Is '${newProduct.price}' correct?`
                        }
                    ]).then(function (answers) {
                        if (answers.confirm) {
                            postItem(newProduct);
                        } else {
                            newProduct.price = -4;
                            itemPrice(newProduct);
                        }
                    });
                } else {
                    itemPrice(newProduct);
                }
            } else {
                console.log("Invalid Input: Please enter a number");
                itemPrice();
            }
        });
    }

    function postItem(newProduct) {
        console.log(newProduct);
        inquirer.prompt([
            {
                name: "confirm",
                type: "confirm",
                message: `Are all values above correct?`
            }
        ]).then(function(answers){
            if(answers.confirm) {
                connection.query(
                    "INSERT INTO products SET ?",
                    newProduct,
                    function (error, res) {
                        if (error) throw error;
                        // console.log(res);
                        console.log("\nNew product added.\n")
                        main();
                    }
                )
            } else {
                console.log("\nAdd item cancelled.\n")
                main();
            }
        });
    }
}