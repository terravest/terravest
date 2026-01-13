PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0,
    usd_balance REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "users" VALUES(4,'test@example.com','testuser','$2b$10$qgqFMcmpTleS2Di.H09oQuLb7b9v/bftJi0H2wcI0.unl.u5FlABm','user',0,42000,'2026-01-12 12:29:41');
INSERT INTO "users" VALUES(5,'terravestproject@proton.me','admin','$2b$10$EclHiPwLDOt51zHl.UGIiOqiVE6Z1wlq7EGuVaFIRhG9wk5hrTEYi','admin',0,0,'2026-01-13 07:44:24');
CREATE TABLE ownerships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    property_id INTEGER,
    tokens_owned REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    token_amount INTEGER NOT NULL,
    purchase_price REAL NOT NULL,
    total_cost REAL NOT NULL,
    unclaimed_rewards REAL DEFAULT 0,
    last_rent_calc_date TEXT,
    total_invested REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "investments" VALUES(2,1,5,5,50,250,0,'2026-01-11T21:00:00.000Z',0,'2026-01-12 07:43:42');
INSERT INTO "investments" VALUES(3,1,5,10,50,500,0,'2026-01-11T21:00:00.000Z',0,'2026-01-12 08:04:01');
INSERT INTO "investments" VALUES(4,1,5,10,50,500,0,'2026-01-11T21:00:00.000Z',0,'2026-01-12 11:45:40');
INSERT INTO "investments" VALUES(5,4,14,10,50,500,0,'2026-01-12T13:32:01.512Z',0,'2026-01-12 13:32:01');
INSERT INTO "investments" VALUES(6,4,14,10,50,500,0,'2026-01-12T13:35:33.114Z',0,'2026-01-12 13:35:33');
INSERT INTO "investments" VALUES(7,4,14,10,50,500,0,'2026-01-12T13:48:45.258Z',0,'2026-01-12 13:48:45');
INSERT INTO "investments" VALUES(8,4,14,10,50,500,0,'2026-01-12T13:52:38.790Z',0,'2026-01-12 13:52:38');
INSERT INTO "investments" VALUES(9,4,14,10,50,500,0,'2026-01-12T13:55:32.351Z',0,'2026-01-12 13:55:32');
INSERT INTO "investments" VALUES(10,4,14,10,50,500,0,'2026-01-12T13:59:40.749Z',0,'2026-01-12 13:59:40');
INSERT INTO "investments" VALUES(11,4,14,10,50,500,0,'2026-01-12T14:02:53.280Z',0,'2026-01-12 14:02:53');
INSERT INTO "investments" VALUES(12,4,14,10,50,500,0,'2026-01-12T14:06:15.916Z',0,'2026-01-12 14:06:15');
INSERT INTO "investments" VALUES(13,4,14,10,50,500,0,'2026-01-12T15:44:05.317Z',0,'2026-01-12 15:44:05');
INSERT INTO "investments" VALUES(14,4,14,10,50,500,0,'2026-01-12T15:51:18.408Z',0,'2026-01-12 15:51:18');
INSERT INTO "investments" VALUES(15,4,15,10,100,1000,0,'2026-01-12T18:24:58.604Z',0,'2026-01-12 18:24:58');
INSERT INTO "investments" VALUES(16,4,15,10,100,1000,0,'2026-01-12T18:36:41.745Z',0,'2026-01-12 18:36:41');
INSERT INTO "investments" VALUES(17,4,15,10,100,1000,0,'2026-01-12T18:51:57.001Z',0,'2026-01-12 18:51:57');
CREATE TABLE deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount_usd REAL,
    address TEXT,
    address_index INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);
INSERT INTO "deposits" VALUES(1,1,100,'bc1qtkaaeqjg889vxdh7m846va7ah5mat5g4nq3cjp',0,'pending','2026-01-11 21:10:20',NULL);
INSERT INTO "deposits" VALUES(2,4,100,'bc1quny46yl67j42qwxhx366qh3ag80mecjpvvex8n',1,'pending','2026-01-12 13:15:07',NULL);
INSERT INTO "deposits" VALUES(3,4,100,'bc1qzuu892tdqu6sexhna4t4zp4ex4gjwrpd89ca2y',2,'pending','2026-01-12 13:20:57',NULL);
INSERT INTO "deposits" VALUES(4,4,100,'bc1q4mqkfpnxdsuy4jkf6puscv2nypxcvqhjmutfgf',3,'pending','2026-01-12 13:25:04',NULL);
INSERT INTO "deposits" VALUES(5,4,100,'bc1qx85wc82djh9yztc75k8xy8ykjv3stgm8admqgd',4,'pending','2026-01-12 13:31:47',NULL);
INSERT INTO "deposits" VALUES(6,4,100,'bc1qj8rmh7jjnsxu7eycpx4cptjj6kfwauyqultqrx',5,'pending','2026-01-12 13:35:20',NULL);
INSERT INTO "deposits" VALUES(7,4,100,'bc1qhf7drtgmlxsl9aashh9dc8xwccp936ztfgn96a',6,'pending','2026-01-12 13:48:31',NULL);
INSERT INTO "deposits" VALUES(8,4,100,'bc1qrrlr5376l066wahjn3lkjjmy89e26pmqqlcyjk',7,'pending','2026-01-12 13:52:23',NULL);
INSERT INTO "deposits" VALUES(9,4,100,'bc1q4e8dtd7s0ycg34z757ap36verrcazpp4kkkh3p',8,'pending','2026-01-12 13:55:17',NULL);
INSERT INTO "deposits" VALUES(10,4,100,'bc1q9wxjjz7fjxcvxkjpqt46srj6sefxdk3cemjqgx',9,'pending','2026-01-12 13:59:24',NULL);
INSERT INTO "deposits" VALUES(11,4,100,'bc1qurv8xnxle3p38e2wpw5p6vawkp82qppxg82tsl',10,'pending','2026-01-12 14:02:40',NULL);
INSERT INTO "deposits" VALUES(12,4,100,'bc1qdc6mex7j0c4s4ew9nu3tx554pqekcxvutdx928',11,'pending','2026-01-12 14:06:02',NULL);
CREATE TABLE withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    address TEXT,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "transactions" VALUES(1,1,'rent_claim',4.623287671232877,'Daily rent rewards claimed','2026-01-12T11:49:08.145Z');
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER,
    order_type TEXT,
    amount REAL,
    status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0, 
    display_order INTEGER DEFAULT 0, 
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
INSERT INTO "property_images" VALUES(5,14,'https://pub-bd8456f943ae4c68b14a610fc10fa1c6.r2.dev/property-2440c022-20d1-4412-93d4-399e74d32ed0.png',0,0,'2026-01-13 08:44:17');
INSERT INTO "property_images" VALUES(6,14,'https://pub-bd8456f943ae4c68b14a610fc10fa1c6.r2.dev/property-16c0cf7b-47b8-4062-b683-536dc1557185.png',0,1,'2026-01-13 08:44:17');
CREATE TABLE IF NOT EXISTS "properties" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    price_usd REAL,
    total_tokens INTEGER,
    available_tokens INTEGER,
    rental_yield TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "properties" VALUES(5,'Luxury Villa Miami',NULL,NULL,5000,100,100,'5.0%',NULL,'active','2026-01-11 21:16:48');
INSERT INTO "properties" VALUES(6,'Downtown Apartment Complex',NULL,NULL,5000,1000,1000,'5.0%',NULL,'active','2026-01-11 21:16:48');
INSERT INTO "properties" VALUES(7,'Commercial Office Building',NULL,NULL,5000,500,500,'5.0%',NULL,'active','2026-01-11 21:16:48');
INSERT INTO "properties" VALUES(8,'Luxury Villa Miami',NULL,NULL,5000,100,100,'5.0%',NULL,'active','2026-01-11 21:18:49');
INSERT INTO "properties" VALUES(9,'Downtown Apartment Complex',NULL,NULL,5000,1000,1000,'5.0%',NULL,'active','2026-01-11 21:18:49');
INSERT INTO "properties" VALUES(10,'Commercial Office Building',NULL,NULL,5000,500,500,'5.0%',NULL,'active','2026-01-11 21:18:49');
INSERT INTO "properties" VALUES(11,'Luxury Villa Miami',NULL,NULL,5000,100,100,'5.0%',NULL,'active','2026-01-12 07:14:52');
INSERT INTO "properties" VALUES(12,'Downtown Apartment Complex',NULL,NULL,5000,1000,1000,'5.0%',NULL,'active','2026-01-12 07:14:52');
INSERT INTO "properties" VALUES(13,'Commercial Office Building',NULL,NULL,5000,500,500,'5.0%',NULL,'active','2026-01-12 07:14:52');
INSERT INTO "properties" VALUES(14,'Luxury Villa Miami','',NULL,5000,100,100,'5.0%','https://pub-bd8456f943ae4c68b14a610fc10fa1c6.r2.dev/property-2440c022-20d1-4412-93d4-399e74d32ed0.png','active','2026-01-12 07:21:48');
INSERT INTO "properties" VALUES(15,'Downtown Apartment Complex',NULL,NULL,5000,1000,1000,'5.0%',NULL,'active','2026-01-12 07:21:48');
INSERT INTO "properties" VALUES(16,'Commercial Office Building',NULL,NULL,5000,500,500,'5.0%',NULL,'active','2026-01-12 07:21:48');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('users',5);
INSERT INTO "sqlite_sequence" VALUES('deposits',12);
INSERT INTO "sqlite_sequence" VALUES('investments',17);
INSERT INTO "sqlite_sequence" VALUES('transactions',1);
INSERT INTO "sqlite_sequence" VALUES('property_images',6);
INSERT INTO "sqlite_sequence" VALUES('properties',16);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_property_id ON investments(property_id);
CREATE INDEX idx_investments_user_property ON investments(user_id, property_id);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_created_at ON deposits(created_at DESC);
CREATE INDEX idx_deposits_user_created ON deposits(user_id, created_at DESC);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);
CREATE INDEX idx_withdrawals_user_created ON withdrawals(user_id, created_at DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_property_order ON property_images(property_id, display_order ASC);