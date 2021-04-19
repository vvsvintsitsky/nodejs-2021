CREATE TABLE "users" (
	"id" character varying(255) NOT NULL,
	"login" character varying(255) NOT NULL UNIQUE,
	"password" character varying(255) NOT NULL,
	"age" integer NOT NULL,
	"is_deleted" BOOLEAN NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

INSERT INTO
	users (id, login, password, age, is_deleted)
VALUES
	('1', 'user1', 'password1', 11, false),
	('2', 'user2', 'password2', 12, false),
	('3', 'user3', 'password3', 13, false),
	('4', 'user4', 'password4', 14, false);
