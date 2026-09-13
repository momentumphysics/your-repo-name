PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
CREATE TABLE IF NOT EXISTS "user_verifications" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT DEFAULT '',
    region TEXT,
    latitude REAL,
    longitude REAL,
    birthdate TEXT,
    email TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
INSERT INTO user_verifications VALUES(1,'asdasda',NULL,-5.154406400000000054,119.4557439999999958,'2026-09-03',NULL,'2026-09-14 00:27:08');
INSERT INTO user_verifications VALUES(2,'asdaaaa',NULL,-5.154406400000000054,119.4557439999999958,'2026-02-04',NULL,'2026-09-14 00:32:46');
INSERT INTO user_verifications VALUES(5,'','aaaaa',NULL,NULL,NULL,NULL,'2026-09-14 02:35:02');
INSERT INTO user_verifications VALUES(6,'',NULL,NULL,NULL,NULL,'asdas@asd.cpo','2026-09-14 02:35:14');
INSERT INTO user_verifications VALUES(8,'asdaasaa','Lat: -5.1544, Lng: 119.4557',-5.154406400000000054,119.4557439999999958,NULL,NULL,'2026-09-14 02:40:39');
INSERT INTO user_verifications VALUES(9,'aaaaaaa','Lat: -5.1544, Lng: 119.4557',-5.154406400000000054,119.4557439999999958,'2026-09-02','abdillahhmm208@gmail.com','2026-09-14 02:41:05');
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('user_verifications',10);
PRAGMA writable_schema=OFF;
COMMIT;
