
DELIMITER $$
DROP PROCEDURE IF EXISTS SP_AddNewUser $$
CREATE PROCEDURE SP_AddNewUser(
IN in_fn VARCHAR(50),
IN in_ln VARCHAR(100) ,
IN in_password NVARCHAR(255)  ,
IN In_Email VARCHAR(255) ,
in roleId int,
in statusId int,
in restuarntId NVARCHAR(255)
)
BEGIN
	
    DECLARE userId NVARCHAR(50);  

	SET @userId = UUID_SHORT();
	INSERT into Users(User_id, First_name, Last_name, Email, Password) values (@userId, in_fn, in_ln, In_Email, in_password) ;
	INSERT into UsersMappings(User_id, Role_id, Status_id) values (@userId, roleId, statusId) ;
    
	IF restuarntId then	
		Insert into UserRestaurant(User_id, Restaurant_id) values(@userId, restuarntId);
	END IF;
    
	SELECT l.User_id, l.First_name, l.Last_name, l.Email, l.Photo_url, l.Dob, l.Contact_no, r.Role_id, r.Status_id
    FROM Users l left join UsersMappings r on l.User_id = r.User_id 
    where l.User_id like @userId and l.Email like In_Email LIMIT 1;
    
END$$

DELIMITER ;