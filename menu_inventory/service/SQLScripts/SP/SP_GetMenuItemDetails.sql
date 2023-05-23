DELIMITER $$
DROP PROCEDURE IF EXISTS SP_GetMenuDetails $$
CREATE PROCEDURE SP_GetMenuDetails(
IN ItemID NVARCHAR(50),
IN ItemName varchar(255)
)
BEGIN
	SELECT l.Item_id, l.Item_name, l.Item_price, l.Item_image_link, l.Item_description, l.Item_Category_id, r.Category_description, rs.Restaurant_name, lrm.Item_Stock_Quantity
		FROM Items l 
			left join Category r on l.Item_Category_id = r.Category_id 
			 inner join Items_Restaurant_Mapping lrm on l.Item_id = lrm.Item_id 
			   inner join Restaurants rs on lrm.Restaurant_id = rs.Restaurant_id 
			where l.Item_id like ItemID or l.Item_name like CONCAT ('%', ItemName, '%') ;       
END$$

DELIMITER ;