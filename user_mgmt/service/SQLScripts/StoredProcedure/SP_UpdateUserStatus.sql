
DELIMITER $$
DROP PROCEDURE IF EXISTS SP_UpdateUserStatus $$
CREATE PROCEDURE SP_UpdateUserStatus(
IN InuserId nvarchar(255),
IN InstatusId int )
BEGIN
	
    
    update UserMappings set Status_id = InstatusId WHERE User_id = InuserId;
    
	SELECT l.User_id, l.First_name, l.Last_name, l.Email, l.Photo_url, l.Dob, l.Contact_no, r.Role_id, r.Status_id
    FROM Users l left join UsersMappings r on l.User_id = r.User_id 
    where l.User_id like InuserId ;
    
END$$

DELIMITER ;