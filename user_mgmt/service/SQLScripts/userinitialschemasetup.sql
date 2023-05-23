
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema UserMgt
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `UserMgt` DEFAULT CHARACTER SET utf8mb4 ;
USE `UserMgt` ;

-- -----------------------------------------------------
-- Table `UserMgt`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserMgt`.`Users` (
  `User_id` nvarchar(255) NOT NULL ,
  `First_name` VARCHAR(50) NULL,
  `Last_name` VARCHAR(100) NULL,
  `Email` VARCHAR(255) NOT NULL,
`Password` NVARCHAR(255)  NULL,
  `Photo_url` NVARCHAR(255) NULL,
  `Dob` DATETIME  NULL,
  `Contact_no` NVARCHAR(255)  NULL,
 
  PRIMARY KEY (`User_id`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC)
  )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `UserMgt`.`Status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserMgt`.`Status` (
  `Status_id` INT NOT NULL AUTO_INCREMENT,
  `Status_name` VARCHAR(50) not NULL,
  PRIMARY KEY (`Status_id`),
   UNIQUE INDEX `Users_Status_name_UNIQUE` (`Status_name` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `UserMgt`.`Roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserMgt`.`Roles` (
  `Role_id` INT NOT NULL AUTO_INCREMENT,
  `Role_name` VARCHAR(50) not NULL,
  PRIMARY KEY (`Role_id`),
  UNIQUE INDEX `Users_Role_name_UNIQUE` (`Role_name` ASC)
  )
ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `UserMgt`.`users_mappings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserMgt`.`UsersMappings` (
  `User_id` nvarchar(255) NOT NULL,
  `Role_id` INT NOT NULL,
  `Status_id` INT NOT NULL, 
  INDEX `fk_users_mappings_users_idx` (`User_id` ASC),
  INDEX `fk_users_mappings_Role_idx` (`Role_id` ASC),
  INDEX `fk_users_mappings_Status_idx` (`Status_id` ASC),
 
  CONSTRAINT `fk_users_mappings_users`
    FOREIGN KEY (`User_id`)
    REFERENCES `UserMgt`.`Users` (`User_id`)
    ON DELETE cascade
    ON UPDATE cascade,
  CONSTRAINT `fk_users_mappings_role`
    FOREIGN KEY (`Role_id`)
    REFERENCES `UserMgt`.`Roles` (`Role_id`)
     ON DELETE cascade
    ON UPDATE cascade,
  CONSTRAINT `fk_users_mappings_status`
    FOREIGN KEY (`Status_id`)
    REFERENCES `UserMgt`.`Status` (`Status_id`)
      ON DELETE cascade
    ON UPDATE cascade,
    PRIMARY KEY (`User_id`, `Status_id`)
 )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `UserMgt`.`Rewards`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserMgt`.`Rewards` (
  `User_id` nvarchar(255) NOT NULL,
  `Rewards` INT NOT NULL DEFAULT 0,

  INDEX `fk_users_mappings_users_idx2` (`User_id` ASC),
  INDEX `fk_users_mappings_Role_idx2` (`Rewards` ASC),
 
  CONSTRAINT `fk_usersrewards_mappings_users`
    FOREIGN KEY (`User_id`)
    REFERENCES `UserMgt`.`Users` (`User_id`)
    ON DELETE cascade
    ON UPDATE cascade)
ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `UserMgt`.`UserRestaurant` (
  `User_id` nvarchar(255) NOT NULL,
  `Restaurant_id` nvarchar(255) NOT NULL,
  PRIMARY KEY (`User_id`,`Restaurant_id` ),
  CONSTRAINT `fk_users_mappings_rest`
    FOREIGN KEY (`User_id`)
    REFERENCES `UserMgt`.`Users` (`User_id`)
     ON DELETE cascade
    ON UPDATE cascade
  )



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;