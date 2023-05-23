DELIMITER $$
DROP PROCEDURE IF EXISTS SP_GetAllMenuItems $$
CREATE PROCEDURE SP_GetAllMenuItems()
BEGIN
	SELECT l.Item_id, l.Item_name, l.Item_price, l.Item_image_link, l.Item_description, l.Item_Category_id, r.Category_description, rs.Restaurant_name, rs.Restaurant_id 
		FROM Items l
			 inner join Category r on l.Item_Category_id = r.Category_id  
			  inner join Items_Restaurant_Mapping lrm on l.Item_id = lrm.Item_id 
			   inner join Restaurants rs on lrm.Restaurant_id = rs.Restaurant_id ;     
END$$

DELIMITER ;