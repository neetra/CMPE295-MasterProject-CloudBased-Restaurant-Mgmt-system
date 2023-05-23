ALTER TABLE Restaurants
ADD COLUMN Restaurant_image_url varchar(255) AFTER Restaurant_name;

ALTER TABLE Items_Restaurant_Mapping
ADD COLUMN Item_Stock_Quantity int default 1;
