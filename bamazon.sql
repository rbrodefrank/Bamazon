create database bamazon_db;

use bamazon_db;

create table products (
	item_id int auto_increment not null,
	product_name varchar(50),
    department_name varchar(50),
    department_id integer(25),
    price decimal(10,2),
    stock_quantity integer(25),
    product_sales decimal(20,2) default 0,
    primary key(item_id)
);

create table departments (
	department_id int auto_increment not null,
    department_name varchar(50),
    overhead_costs integer(25),
    primary key(department_id)
);

insert into departments(department_name, overhead_costs)
values
("Clothing", 2000),
("Electronics", 3500),
("Food", 3000),
("Games", 1500)
;

insert into products(product_name, department_name, department_id, price, stock_quantity)
values
("Socks", "Clothing", 1, 15.00, 10),
("TVs", "Electronics", 2, 499.99, 5),
("Jeans", "Clothing", 1, 59.95, 40),
("Shirts", "Clothing", 1, 25.00, 20),
("Instant Ramen", "Food", 3, 2.99, 30),
("Oreos", "Food", 3, 11.99, 8),
("Laptop", "Electronics", 2, 349.99, 3),
("Board Game", "Games", 4, 39.99, 25),
("Video Game", "Games", 4, 59.99, 22),
("Shoes", "Clothing", 1, 28.99, 15),
("Frozen Vegetables", "Food", 3, 9.99, 20)
;

select * from products;