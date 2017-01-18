# TODO

- ident J'ai perdu mon mot de passe
    reste à traiter la génération du token avant l'envoi du mail
x ident créer un compte
x ajouter un enregistrement
x supprimer un enregistrement

MEP
npm i randomstring
npm i save moment
npm i save nodemailer
npm i save sprintf-js
npm i save async
CREATE TABLE "ACTTOKENS" (
    "tok_id" varchar(23) NOT NULL,
    "tok_url" varchar(255) NOT NULL,
    "tok_email" varchar(100) NOT NULL,
    primary key(tok_id)
);
