DROP TABLE IF EXISTS "CEOU_GROUPES";
CREATE TABLE "CEOU_GROUPES" 
(
	"groupe_id" varchar(23) NOT NULL,
	"groupe_nom" varchar(50) NOT NULL,
	"groupe_info" text NULL,
	primary key(groupe_id)
);
DROP TABLE IF EXISTS "CEOU_USERS";
CREATE TABLE "CEOU_USERS" 
(
	"user_id" varchar(23) NOT NULL,
	"user_pseudo" varchar(50) NOT NULL,
	"user_email" varchar(100) NULL,
	"user_profil" varchar(255) NULL,
	"user_actif" varchar(1) NULL,
	"user_info" text NULL,

	"user_groupe_id" varchar(23) NULL,
	primary key(user_id)
);
DROP TABLE IF EXISTS "CEOU_EVT";
CREATE TABLE "CEOU_EVT" 
(
	"evt_id" varchar(23) NOT NULL,
	"evt_nom" varchar(255) NOT NULL,
	"evt_info" text NULL,
	"evt_etat" varchar(1) NULL,
	
	"evt_groupe_id" varchar(23) NOT NULL,
	primary key(evt_id)
);
DROP TABLE IF EXISTS "CEOU";
CREATE TABLE "CEOU" 
(
	"ceou_id" varchar(23) NOT NULL,
	"ceou_lieu" varchar(255) NOT NULL,
	"ceou_date" datetime NOT NULL,
	"ceou_info" text NULL,
	"ceou_etat" varchar(1) NULL,
	
	"ceou_evt_id" varchar(23) NOT NULL,
	primary key(ceou_id)
);
DROP TABLE IF EXISTS "CEOU_FORUM";
CREATE TABLE "CEOU_FORUM" 
(
	"forum_id" varchar(23) NOT NULL,
	"forum_date" datetime NOT NULL,
	"forum_info" text NULL,
	
	"forum_evt_id" varchar(23) NOT NULL,
	"forum_user_id" varchar(23) NOT NULL,
	primary key(forum_id)
);
DROP TABLE IF EXISTS "CEOU_CHOIX";
CREATE TABLE "CEOU_CHOIX" 
(
	"choix_id" varchar(23) NOT NULL,
	"choix_ok" varchar(1) NULL,
	"choix_ko" varchar(1) NULL,
	"choix_kk" varchar(1) NULL,
	
	"choix_ceou_id" varchar(23) NOT NULL,
	"choix_user_id" varchar(23) NOT NULL,
	primary key(choix_id)
);