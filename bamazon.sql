create database bamazon_db;

use bamazon_db;

create table products (
	item_id int auto_increment not null,
	product_name varchar(50),
    department_name varchar(50),
    price decimal(10,2),
    stock_quantity integer(25),
    primary key(item_id)
);
insert into products(product_name, department_name, price, stock_quantity)
values
("Socks", "Clothing", 15.00, 45000),
("TVs", "Electronics", 499.99, 8000),
("Jeans", "Clothing", 59.95, 13000),
("Shirts", "Clothing", 25.00, 23000),
("Instant Ramen", "Food", 2.99, 46000),
("Oreos", "Food", 11.99, 32000),
("Laptop", "Electronics", 349.99, 3600),
("Board Game", "Games", 39.99, 4000),
("Video Game", "Games", 59.99, 6700),
("Shoes", "Clothing", 28.99, 2000),
("Frozen Vegetables", "Food", 9.99, 5400)
;

select * from products;