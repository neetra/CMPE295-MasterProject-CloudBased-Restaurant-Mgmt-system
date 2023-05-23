select * from Items l left join Items_Descriptions r on l.Item_id = r.Item_id;

select count(*) from Items;
select count(*) from Items_Descriptions;