DELIMITER $$
DROP PROCEDURE IF EXISTS SP_AddMenuItem $$
CREATE PROCEDURE SP_AddMenuItem(
IN ItemName VARCHAR(255),
IN ItemPrice double,
IN ItemImage_link VARCHAR(255),
IN ItemDescription LONGTEXT,
IN ItemCategoryid NVARCHAR(50),
IN Restaurantid NVARCHAR(50)
)
BEGIN
	
    DECLARE itemId NVARCHAR(50);
	
	SET @itemId = UUID_SHORT();
	INSERT into Items(Item_id, Item_name, Item_price, Item_image_link, Item_Category_id, Item_description) values (@itemId, ItemName, ItemPrice, ItemImage_link, ItemCategoryid, ItemDescription) ;
	INSERT into Items_Restaurant_Mapping(Item_id, Restaurant_id) values (@itemId,Restaurantid);
	SELECT l.Item_id, l.Item_name, l.Item_price, l.Item_image_link, l.Item_description , r.Restaurant_id, c.Category_description, l.Item_Category_id, rs.Restaurant_name, r.Item_Stock_Quantity
		FROM Items l 
			left join Items_Restaurant_Mapping r on l.Item_id = r.Item_id
			inner join Category c on l.Item_Category_id = c.Category_id
			inner join Restaurants rs on rs.Restaurant_id =  r.Restaurant_id
			where l.Item_id Like @itemId and r.Restaurant_id  LIKE Restaurantid  Limit 1;
    
END$$

DELIMITER ;