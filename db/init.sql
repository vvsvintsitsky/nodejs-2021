CREATE TABLE "users" (
	"id" uuid NOT NULL,
	"login" character varying(255) NOT NULL UNIQUE,
	"password" character varying(255) NOT NULL,
	"age" integer NOT NULL,
	"is_deleted" BOOLEAN NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "groups" (
	"id" uuid NOT NULL,
	"name" character varying(255) NOT NULL UNIQUE,
	"permissions" integer NOT NULL,
	CONSTRAINT "groups_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "user_group" (
	"user_id" uuid NOT NULL,
	"group_id" uuid NOT NULL
) WITH (
  OIDS=FALSE
);



ALTER TABLE "user_group" ADD CONSTRAINT "user_group_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_fk1" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_pk" PRIMARY KEY ("user_id", "group_id");



INSERT INTO
	users (id, login, password, age, is_deleted)
VALUES
	('47a0ef54-2ef6-4378-81f8-9757f108ea21', 'user1', 'password1', 11, false),
	('95db01de-5b79-442e-b0bf-f33c48996482', 'user2', 'password2', 12, false),
	('a5bc34f2-49d3-410a-b4e8-56813d0d4743', 'user3', 'password3', 13, false),
	('73c85f31-419c-4bac-a552-1b606707261d', 'user4', 'password4', 14, false);
