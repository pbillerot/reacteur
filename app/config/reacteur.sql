/*
	Tables du framework REACTEUR
*/

-- Gestion des comptes (les users)
DROP TABLE IF EXISTS "ACTUSERS";
CREATE TABLE "ACTUSERS" (
	"user_email" varchar(100) NOT NULL,
	"user_pseudo" varchar(20) NOT NULL,
	"user_profil" varchar(20) NULL,
	"user_actif" varchar(1) NULL,
	"user_pwd" varchar(255) NULL,
	primary key(user_email)
);
CREATE INDEX index_user_pseudo ON ACTUSERS(user_pseudo);
INSERT INTO ACTUSERS
(user_pseudo, user_email, user_profil, user_actif, user_pwd)
values
('admin', 'reacteur@yopmail.com', 'ADMIN', '1', '');

-- Gestion des jetons
DROP TABLE IF EXISTS "ACTTOKENS";
CREATE TABLE "ACTTOKENS" (
	"tok_id" varchar(23) NOT NULL,
	"tok_url" varchar(255) NOT NULL,
	"tok_redirect" varchar(255) NOT NULL,
	"tok_pseudo" varchar(100) NOT NULL,
	"tok_email" varchar(100) NOT NULL,
	"tok_expired" datetime NOT NULL,
	"tok_used" datetime NULL,
	primary key(tok_id)
)