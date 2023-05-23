
DELIMITER $$
DROP PROCEDURE IF EXISTS Sp_Add_Restaurant $$
CREATE PROCEDURE Sp_Add_Restaurant(

IN RestaurantName VARCHAR(255),
IN RestaurantImageUrl VARCHAR(255)

)
BEGIN
	
    DECLARE restaurantId NVARCHAR(50);
	
	SET @restaurantId = UUID_SHORT();
	INSERT into Restaurants(Restaurant_id, Restaurant_name, Restaurant_image_url) values (@restaurantId, RestaurantName, RestaurantImageUrl) ;
	
	SELECT Restaurant_id, Restaurant_name, Restaurant_image_url FROM Restaurants where Restaurant_id Like @restaurantId ;
    
END$$

DELIMITER ;