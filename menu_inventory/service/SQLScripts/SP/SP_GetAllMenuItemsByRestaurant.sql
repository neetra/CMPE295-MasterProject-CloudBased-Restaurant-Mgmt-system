DELIMITER $$
DROP PROCEDURE IF EXISTS SP_GetAllMenuItemsByRestaurant $$
CREATE PROCEDURE SP_GetAllMenuItemsByRestaurant(
	IN restaurantid NVARCHAR(50)
)
BEGIN
	SELECT l.Item_id, l.Item_name, l.Item_price, l.Item_image_link, l.Item_description, l.Item_Category_id, r.Category_description, lrm.Item_Stock_Quantity
		FROM Items l
			 inner join Category r on l.Item_Category_id = r.Category_id  
			  inner join Items_Restaurant_Mapping lrm on l.Item_id = lrm.Item_id 
			   inner join Restaurants rs on lrm.Restaurant_id = rs.Restaurant_id
		WHERE lrm.Restaurant_id = restaurantid;			       
END$$

DELIMITER ;