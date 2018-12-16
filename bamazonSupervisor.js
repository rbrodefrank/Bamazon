//Bamazon Customer node program

const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

//Global Variables
var stock = [];
var departments = [];

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
            choices: ["Product List", "Product Sales by Department", "Create New Department", "Exit"],
            message: "What would you like to do?"
        }
    ]).then(function (response) {
        switch (response.main) {
            case "Product List":
                productList();
                break;
            case "Product Sales by Department":
                departmentSales();
                break;
            case "Create New Department":
                createDepartment();
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}

function departmentSales() {
    departments = [];
    connection.query(
        "SELECT * FROM departments",
        function (error, res) {
            if (error) throw error;
            for (var i = 0; i < res.length; i++) {
                var newDepart = {
                    department_id: res[i].department_id,
                    department_name: res[i].department_name,
                    overhead_costs: res[i].overhead_costs
                }
                departments.push(newDepart);
            }

            var count = 0;
            getSum(count);
        }
    );
}

function getSum(count) {
    if (count < departments.length) {
        connection.query(
            "SELECT SUM(product_sales) AS product_sales FROM products WHERE ?",
            { department_name: departments[count].department_name },
            function (error, res) {
                if (error) throw error;
                // console.log(res);
                departments[count].product_sales = res[0].product_sales;
                departments[count].total_profit = departments[count].product_sales - departments[count].overhead_costs;
                count++;
                getSum(count);
            }
        )
    } else {
        console.log();
        console.table(departments);
        console.log();
        main();
    }
}

function createDepartment() {
    var newDepartment = {
        department_name: "",
        overhead_costs: -4
    }
    departmentName(newDepartment);
    function departmentName(newDepartment) {
        inquirer.prompt([
            {
                name: "department",
                type: "input",
                message: "What is the new departments name?"
            }
        ]).then(function (answers) {
            newDepartment.department_name = answers.department;
            inquirer.prompt([
                {
                    name: "confirm",
                    type: "confirm",
                    message: `Is '${newDepartment.department_name}' correct?`
                }
            ]).then(function (answers) {
                if (answers.confirm) {
                    connection.query(
                        "SELECT department_name FROM departments",
                        function (error, res) {
                            if (error) throw error;

                            var alreadyExists = false;
                            for (var i = 0; i < res.length; i++) {
                                if (res[i].department_name.toLowerCase() == newDepartment.department_name.toLowerCase()) {
                                    alreadyExists = res[i].department_name;
                                    break;
                                }
                            }

                            if (alreadyExists) {
                                console.log(`\nDepartment "${alreadyExists}" already exists!\n`);
                                main();
                            } else {
                                departmentOverhead(newDepartment);
                            }
                        }
                    )
                } else {
                    newDepartment.department_name = "";
                    departmentName(newDepartment);
                }
            });
        });
    }

    function departmentOverhead(newDepartment) {
        inquirer.prompt([
            {
                name: "quantity",
                type: "input",
                message: "What is the department's overhead?"
            }
        ]).then(function (answers) {
            var num = parseInt(answers.quantity);
            if (!Number.isNaN(num)) {
                if (num >= 0) {
                    newDepartment.overhead_costs = num;
                    inquirer.prompt([
                        {
                            name: "confirm",
                            type: "confirm",
                            message: `Is '${newDepartment.overhead_costs}' correct?`
                        }
                    ]).then(function (answers) {
                        if (answers.confirm) {
                            postDepartment(newDepartment);
                        } else {
                            newDepartment.overhead_costs = -4;
                            departmentOverhead(newDepartment);
                        }
                    });
                } else {
                    console.log("Initial overhead must be greater than or equal to zero.")
                    departmentOverhead(newDepartment);
                }
            } else {
                console.log("Invalid Input: Please enter a number.");
                departmentOverhead(newDepartment);
            }
        });
    }

    function postDepartment(newDepartment) {
        console.log(newDepartment);
        inquirer.prompt([
            {
                name: "confirm",
                type: "confirm",
                message: `Are all values above correct?`
            }
        ]).then(function (answers) {
            if (answers.confirm) {
                connection.query(
                    "INSERT INTO departments SET ?",
                    newDepartment,
                    function (error, res) {
                        if (error) throw error;
                        // console.log(res);
                        console.log("\nNew department added.\n")
                        main();
                    }
                )
            } else {
                console.log("\nAdd department cancelled.\n");
                main();
            }
        });
    }

}