
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema MenuInventory
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `MenuInventory` DEFAULT CHARACTER SET utf8mb4 ;
USE `MenuInventory` ;

-- -----------------------------------------------------
-- Table `MenuInventory`.`Resturants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MenuInventory`.`Restaurants` (
  `Restaurant_id` NVARCHAR(50) NOT NULL,
  `Restaurant_name` VARCHAR(255) NOT NULL,   
  CONSTRAINT `pk_Restaurant_id`
    Primary KEY (`Restaurant_id`)      
 )
 ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `MenuInventory`.`Items_Category
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MenuInventory`.`Category` (
  `Category_id` NVARCHAR(50) NOT NULL,
  `Category_description` VARCHAR(255) NOT NULL,   
  CONSTRAINT `pk_Category_id`
    Primary KEY (`Category_id`),
    CONSTRAINT `uk_Category_description`
   UNIQUE (`Category_description`)        
 )
 ENGINE = InnoDB;
 
-- -----------------------------------------------------
-- Table `MenuInventory`.`Items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MenuInventory`.`Items` (
  `Item_id` NVARCHAR(50) NOT NULL ,
  `Item_name` VARCHAR(255) NOT NULL,
  `Item_price` double default 0 , 
   `Item_image_link` VARCHAR(255)  NULL,
    `Item_description` LONGTEXT NULL,  
      `Item_Category_id` NVARCHAR(50) NOT NULL,

    FOREIGN KEY (`Item_Category_id`)  REFERENCES `MenuInventory`.`Category` (`Category_id`)  ON DELETE cascade ON UPDATE cascade ,
   PRIMARY KEY (`Item_id`)
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `MenuInventory`.`Items_mappings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `MenuInventory`.`Items_Restaurant_Mapping` (
  `Item_id` NVARCHAR(50) NOT NULL,
   `Restaurant_id` NVARCHAR(50) NOT NULL,
  INDEX `fk_Items_mappings_Items_idx` (`Item_id` ASC),
 
  CONSTRAINT `fk_RM_Item_id`
    FOREIGN KEY (`Item_id`)
    REFERENCES `MenuInventory`.`Items` (`Item_id`)
    ON DELETE cascade
    ON UPDATE cascade,
     CONSTRAINT `fk_RM_Restaurant_id`
    FOREIGN KEY (`Restaurant_id`)
    REFERENCES `MenuInventory`.`Restaurants` (`Restaurant_id`)
    ON DELETE cascade
    ON UPDATE cascade,
    primary key (`Item_id`,  `Restaurant_id`)
 )
ENGINE = InnoDB;





SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;