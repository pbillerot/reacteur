DROP TABLE IF EXISTS "TEX";
CREATE TABLE TEX (
	"tex_id" VARCHAR (50),
	"tex_pseudo" VARCHAR (50),
	"tex_name" VARCHAR (50),
	"tex_pwd" VARCHAR (255),
	"tex_email" VARCHAR (100),
	"tex_profil" VARCHAR (50),
	"tex_actif" VARCHAR(50),
	"tex_datemaj" DATETIME,
	"tex_langage" VARCHAR(50),
	"tex_os" VARCHAR(50),
	"tex_memo" TEXT,
	"tex_entier" INTEGER,
	"tex_montant" NUMERIC(9,2),
	"tex_taux" VARCHAR(50),
	PRIMARY KEY (tex_id)
);
DROP TABLE IF EXISTS "TEX_LANGUAGES";
CREATE TABLE TEX_LANGUAGES (
	"lang_id" VARCHAR (50),
	"lang_name" VARCHAR (50),
	PRIMARY KEY (lang_id)
);