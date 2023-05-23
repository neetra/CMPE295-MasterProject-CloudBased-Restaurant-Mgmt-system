
DELIMITER $$
DROP PROCEDURE IF EXISTS SP_Add_Category $$
CREATE PROCEDURE SP_Add_Category(

IN CategoryDescription VARCHAR(255)


)
BEGIN
	
    DECLARE categoryId NVARCHAR(50);
	
	SET @categoryId = UUID_SHORT();
	INSERT into Category(Category_id, Category_description) values (@categoryId, CategoryDescription) ;
	
	SELECT Category_id, Category_description  FROM Category where Category_id Like @categoryId  ;
    
END$$

DELIMITER ;