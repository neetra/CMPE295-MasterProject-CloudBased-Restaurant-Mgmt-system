DELIMITER $$
DROP PROCEDURE IF EXISTS SP_UpdateMenuItem $$
CREATE PROCEDURE SP_UpdateMenuItem(
IN ItemName VARCHAR(255),
IN ItemPrice double,
IN ItemImage_link VARCHAR(255),
IN ItemDescription LONGTEXT,
IN ItemCategoryid NVARCHAR(50),
IN ItemStockQuantity int,
IN ItemId NVARCHAR(50),
IN RestaurantId NVARCHAR(50)
)
BEGIN	
UPDATE Items
SET 
    Item_name = COALESCE(ItemName, Item_name),
    Item_price = COALESCE(ItemPrice, Item_price)  ,
    Item_image_link = COALESCE(ItemImage_link, Item_image_link),
    Item_description = COALESCE(ItemDescription, Item_description) ,
    Item_Category_id  = COALESCE(ItemCategoryid, Item_Category_id)   
WHERE
   Item_id = ItemId;
   
   
UPDATE Items_Restaurant_Mapping
SET Item_Stock_Quantity = COALESCE(ItemStockQuantity,Item_Stock_Quantity)
       
WHERE
   Restaurant_id =RestaurantId and Item_id =ItemId;    
END$$

DELIMITER ;