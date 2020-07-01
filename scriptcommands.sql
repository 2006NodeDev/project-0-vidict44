create schema project0;
set schema 'project0';

CREATE TABLE "Role"
(
    "roleId" serial primary key,
    "role" text not null
);

CREATE TABLE "User"
(
    "userId" serial primary key,
    "username" text not null unique,
    "password" text not null,
    "firstName" text not null,
    "lastName" text not null,
    "email" text not null,
    "role" int references "Role" ("roleId")
);

CREATE TABLE "reimbursementStatus"
(
    "statusId" serial primary key,
    "status" text not null unique
);

CREATE TABLE "reimbursementType"
(
    "typeId" serial primary key,
    "type" text not null unique
);

CREATE TABLE "reimbursement"
(
    "reimbursementId" serial primary key,
    "author" int references "User" ("userId"),
    "amount" int not null,
    "dateSubmitted" int not null,
    "dateResolved" int not null,
    "description" text not null,
    "resolver" int references "User" ("userId"),
    "status" int references "reimbursementStatus" ("statusId"),
    "type" int references "reimbursementType" ("typeId")
);


insert into "reimbursementStatus" ("status")
	values	('Pending'),
			('Approved'),
			('Denied');
		

insert into "reimbursementType" ("type")
	values	('Lodging'),
			('Travel'),
			('Food'),
			('Other');
		
insert into "Role" ("role") 
	values ('Admin'),
			('Manager'),
			('User');

insert into "User" ("username", "password", "firstName" , "lastName" , "email" , "role") 
	values ('h.granger','d1ff1cultyL3v3lM4x!', 'Hermione', 'Granger', 'h.granger@gmail.com', 1),
			('TheChosen1','th3B0ywh0L1v3d!', 'Harry', 'Potter', 'TheChosen1@gmail.com', 2),
			('TheWeaze','password', 'Ron', 'Weasley', 'TheWeaze@gmail.com', 3);

insert into "reimbursement" ("author", "amount", "dateSubmitted" , "dateResolved" , "description" , "resolver" , "status", "type")
	values (1, 50, 2020, 2020, 'New Wand', 1, 2, 4),
			(1, 115, 2020, 2020, 'Gryffindor House Robes', 1, 2, 4),
			(2, 500, 2019, 2020, 'Gryffindor Quidditch Robes', 1, 2,4 ),
			(2, 500, 2019, 2020, 'A bucket of chocolate frogs', 1, 3,3 ),
			(2, 2000, 2020, 2020, 'Traveling to the International Quidditch Tournament', 2, 2, 2 ),
			(3, 5000, 2019, 2020, 'Lodging at The Three Broomsticks for half a year because Charlie`s dragon set my bed on fire', 1, 3,1 ),
			(3, 15000, 2019, 2020, 'Buying all the sweets at Honeydukes (for the dragons, so they won`t set my bed on fire)', 1, 3,3 ),
			(3, 1000, 2019, 2020, 'Bribing the sorting hat to re-sort me so I can get into the slytherin common room', 1, 3,1 ),
			(3, 2000, 2020, 2020, 'Traveling to the International Quidditch Tournament', 2, 1,2 ),
			(3, 50, 2019, 2020, 'Replacing my 5th wand because Scabbers almost ate it and it won`t work properly', 1, 3,4 );
		
select * from "reimbursementStatus";
select * from "reimbursementType";
select * from "Role";
select * from "User";
select * from "reimbursement";



