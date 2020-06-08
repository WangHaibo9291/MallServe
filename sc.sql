SET NAMES UTF8;
DROP DATABASE IF EXISTS sc;
CREATE DATABASE sc CHARSET=UTF8;
USE sc;
CREATE TABLE user (
  uid INT PRIMARY KEY AUTO_INCREMENT,
  uname VARCHAR(32),
  upwd VARCHAR(32),
  email VARCHAR(64),
  phone VARCHAR(16),
  avatar VARCHAR(128),        #头像图片路径
  user_name VARCHAR(32),      #用户名，如王小明
  gender INT         
);
CREATE TABLE laptop (
  lid INT PRIMARY KEY AUTO_INCREMENT,
  fid INT, 
  uname VARCHAR(32),
  title VARCHAR(128),
  price DECIMAL(10,2),
  ddr VARCHAR(64),
  colour VARCHAR(32),
  imgs VARCHAR(128)
); 
CREATE TABLE imgs (
  lid INT PRIMARY KEY AUTO_INCREMENT,
  tid INT,
  img VARCHAR(128)
);
CREATE TABLE marquee(
  cid INT PRIMARY KEY AUTO_INCREMENT,
  img VARCHAR(128),
  title VARCHAR(64),                            
  href VARCHAR(128)
);
CREATE TABLE cart(
 id  INT PRIMARY KEY AUTO_INCREMENT,
 lid INT,
 price DECIMAL(10,2),
 count INT,
 lname VARCHAR(255),
 uid   INT
);
CREATE TABLE sc_index (
  lid INT PRIMARY KEY AUTO_INCREMENT,
  uname VARCHAR(64),
  price DECIMAL(10,2),
  imgs VARCHAR(128)
);
CREATE TABLE car (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lid INT ,
  uname VARCHAR(64),
  site VARCHAR(64),
  ddr VARCHAR(128),
  color VARCHAR(64),
  price VARCHAR(64),
  imgs VARCHAR(128),
  uid INT,
  count INT
);
