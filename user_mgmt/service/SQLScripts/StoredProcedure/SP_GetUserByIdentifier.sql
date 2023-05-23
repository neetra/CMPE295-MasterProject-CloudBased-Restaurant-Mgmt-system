Restaurants
DELIMITER $$
DROP PROCEDURE IF EXISTS SP_GetUserByIdentifier $$
CREATE PROCEDURE SP_GetUserByIdentifier(
IN In_userId nvarchar(255),
IN In_Email VARCHAR(255) )
BEGIN 
    
	SELECT l.User_id, 
			l.First_name,
            l.Last_name,
            l.Email,
            l.Photo_url, 
            l.Dob,
            l.Contact_no,
            r.Role_id, 
            rr.Role_name,
            s.Status_name,
            r.Status_id,
            q.Restaurant_id
    FROM  UsersMappings r 
    left join Users l  on l.User_id = r.User_id 
    
    left join  Roles rr on r.Role_id = rr.Role_id
    
    left join Status s on r.Status_id = s.Status_id
    
    left join UserRestaurant  q on l.User_id = q.User_id
    where l.User_id = In_userId or l.Email = In_Email;
    
END$$

DELIMITER ;