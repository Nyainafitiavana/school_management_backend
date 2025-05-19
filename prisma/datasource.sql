---insert default status----
INSERT INTO public."Status"
(id, "uuid", designation, code)
VALUES
    (1, 'c8c0558c-b141-4351-ae3e-a3adccf7627c', 'Actif', 'ACT'),
    (2, '80125fcc-92cb-46e2-b509-4312bbeea8d4', 'Supprimé', 'SPR'),
    (3, 'e0e78201-da43-40e1-960d-7aea421bd473', 'Clôturé', 'CLT'),
    (4, '1c2c0990-1652-413a-a574-b0c0df184bac', 'En cours', 'ENC'),
    (5, '75a2e68c-d3d1-4d0f-90ab-222a5042c0d1', 'Ancien', 'ANC'),
    (6, '6fc53137-308f-4c58-b6d7-9b9509cfa846', 'Suspendu', 'SPD'),
    (7, '3641f095-70ae-4865-b16c-e6650852cfa1', 'Non payé', 'NOP'),
    (8, 'eedc0eaa-e2d6-4fcf-84dc-d958a0ec5b1b', 'Payé', 'PAY'),
    (9, 'd96bdd31-8305-460c-a5e5-8e12f593ae23', 'Expulsé', 'EXP');

---insert default roles----
INSERT INTO public."Roles"
(id, "uuid", designation, statusId)
VALUES
    (1, '38bee17b-6fa7-49d9-9cf0-e3fb5e50190b', 'Proviseur', 1),
    (2, '3a8e81ec-c48f-4dc0-8e20-ed657436d2c8', 'Surveillant générale', 1),
    (3, '8fea52d2-f3ba-4dea-ad60-8dd9d09665fc', 'Surveillant', 1),
    (4, '6a920897-98bd-4c7b-96cc-fadab75371b5', 'Enseignant', 1);
ALTER SEQUENCE public."Roles_id_seq"
	RESTART 5;

---insert default user----
INSERT INTO public."Users"
(id, "uuid", "firstName", "lastName", email, address, "phoneNumber1", "password", "isFullTime", "statusId")
VALUES(1, 'fa3784d6-8f72-4ab1-a476-0d954bf7c3ea', 'FITAHIANTSOA', 'Ny Aina Fitiavana', 'admin@gmail.com', 'Lot 40 Imerintsiatosika', '+261342034890', '$2b$10$RF.j8oxFNSUzuMoSIKnLf.RoMxjJH2sF28KEpZEJUj7Vn/90i6mNC', true, 1);
ALTER SEQUENCE public."Users_id_seq"
	RESTART 2;

---insert default user roles----
INSERT INTO public."UsersRoles"
(id, uuid, "userId", "roleId")
VALUES
    (1, '9c744ac3-b89f-466c-81e3-d4d95492bec4', 1, 1),
    (2, '96b2fd55-795f-4f24-9756-b54088e45321', 1, 4);
ALTER SEQUENCE public."UsersRoles_id_seq"
	RESTART 3;

---insert all menu---
INSERT INTO public."Menu"
(id, uuid, designation, path, code)
VALUES
    (1, 'f72024ea-1a9a-49d3-87ec-724e15cb11cb', 'Utilisateurs', '/utilisateurs', 'User'),
    (2, '36fb27c3-75be-4099-98e5-613ce5e5bc06', 'Etudiants', '/etudiants', 'Student'),
    (3, '1b96e889-efaf-45bd-ae6c-435344add7b2', 'Niveaux', '/niveaux', 'Level'),
    (4, '03981027-e8d8-4bea-aaa6-48a2c62c8d5b', 'Matières', '/matiers', 'Subject'),
    (5, '642b63f4-4331-4a4d-9b55-c605ca52c48f', 'Années scolaires', '/annees_scolaires', 'SchoolYear'),
    (6, 'f7ce90e4-3773-4abc-b82a-20e7cb51779c', 'Privilèges', '/privilege', 'Privilege');
ALTER SEQUENCE public."Menu_id_seq"
	RESTART 7;

---insert default menu roles---
INSERT INTO public."MenuRoles"
(id, "uuid", "menuId", "roleId", privilege)
VALUES
    (1, '449ac99f-9bbf-47ce-a8f9-14a9c754143d', 1, 1, '[1,2,3,4]'),
    (2, '9a7efeaf-69d6-402d-9d3b-69b659da71f9', 2, 1, '[1,2,3,4]'),
    (3, '9f8106c6-5f9d-4ca2-8eab-1ea6a4f5e4ac', 3, 1, '[1,2,3,4]'),
    (4, '91856d1d-bd97-4562-9b7c-452048186dba', 4, 1, '[1,2,3,4]'),
    (5, '170f0255-4f88-4a47-b9e1-fa028476ab77', 5, 1, '[1,2,3,4]'),
    (6, 'c4257d56-71e5-427b-bf06-ed817513b1b4', 6, 1, '[1,2,3,4]'),
    (7, '00d062df-a3e3-41d0-8edb-bdad4534b9e1', 2, 4, '[1,2,3,4]');
ALTER SEQUENCE public."MenuRoles_id_seq"
	RESTART 8;

---insert default school period---
INSERT INTO public."SchoolPeriod"
(id, uuid, designation)
VALUES
    (1, 'bc62ab05-40a9-471e-a45e-a59e30a9e181', '1ère trimestre'),
    (2, '0bf0ddd2-3d8b-4dc2-8ae7-b06bda3dfb18', '2ème trimestre'),
    (3, 'a539e609-b963-430d-b7ee-73738a1b2dd0', '3ème trimestre'),
    (4, 'f20d6801-544a-45e3-8387-e3185eac22f4', '1ère semestre'),
    (5, 'aa68a2c44-1537-4f6a-b7f1-68b3497a081a', '2ème semestre');
ALTER SEQUENCE public."SchoolPeriod_id_seq"
	RESTART 6;

---insert default payment type--
INSERT INTO public."TypePayment"
(id, uuid, designation, code, "statusId")
VALUES
    (1, '73bdb28b-2ed1-4b83-965b-75bdbc6882c1', 'Écolage', 'ECL', 1),
    (2, '42430fd5-2110-4026-b4b8-f70f7080e6c5', 'Droit de scolarité', 'DRS', 1);
ALTER SEQUENCE public."TypePayment_id_seq"
	RESTART 3;

---insert default test type--
INSERT INTO public."TestType"
(id, uuid, designation)
VALUES
    (1, '27700b08-87d9-4afd-8669-022002940907', 'Examen finale'),
    (2, '9f381398-2bb9-4517-af8a-e471ea35335c', 'Contrôle');
ALTER SEQUENCE public."TestType_id_seq"
    RESTART 3;