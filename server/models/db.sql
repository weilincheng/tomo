-- Create the database and tables if they don't exist
CREATE DATABASE IF NOT EXISTS tomo;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nickname` VARCHAR(747) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `website` VARCHAR(2048), 
    `profile_image` VARCHAR(255), 
    `background_image` VARCHAR(255),
    `bio` VARCHAR(255),
    `geo_location_lat` DOUBLE,
    `geo_location_lng` DOUBLE,
    `display_geo_location` BOOLEAN DEFAULT TRUE,
    `gender` ENUM('pnts', 'male', 'female', 'neutral') DEFAULT 'neutral',
    `birthdate` DATETIME,
    INDEX geo_location_index (geo_location_lat, geo_location_lng)
);

CREATE INDEX geo_location_index ON users(geo_location_lat, geo_location_lng);

DROP TABLE IF EXISTS `relationships`;
CREATE TABLE `relationships`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `follower_user_id` INT UNSIGNED NOT NULL,
    `followed_user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`follower_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY(`followed_user_id`) REFERENCES `users`(`id`)
);

DROP TABLE IF EXISTS `blocklist`;
CREATE TABLE `blocklist`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `blocker_user_id` INT UNSIGNED NOT NULL,
    `blocked_user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`blocker_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY(`blocked_user_id`) REFERENCES `users`(`id`)
);

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `text` VARCHAR(280) NOT NULL,
    `user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
);
DROP TABLE IF EXISTS `post_images`;
CREATE TABLE `post_images`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    FOREIGN KEY(`post_id`) REFERENCES `posts`(`id`)
);
DROP TABLE IF EXISTS `interests`;
CREATE TABLE `interests`(
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `category` VARCHAR(255) NOT NULL
);

INSERT INTO interests (name, category) VALUES ('Baking', 'Indoors'), ('Cooking', 'Indoors'), ('Bonsai', 'Indoors'), ('Coding', 'Indoors'), ('Dancing', 'Outdoors'), ('Fishing', 'Outdoors'), ('Gardening', 'Outdoors'), ('Hiking', 'Outdoors'), ('Running', 'Outdoors'), ('Singing', 'Indoors'), ('Traveling', 'Outdoors'), ('Writing', 'Indoors'), ('Yoga', 'Indoors'), ('Pilates', 'Indoors'), ('Weaving', 'Indoors'), ('Photography', 'Outdoors'), ('Sewing', 'Indoors'), ('Badminton', 'Outdoors'), ('Baseball', 'Outdoors'), ('Motorcycling', 'Outdoors'), ('Rugby', 'Outdoors'), ('Tennis', 'Outdoors'), ('Skiing', 'Outdoors'), ('Coffee', 'Indoors'), ('Anime', 'Indoors');

DROP TABLE IF EXISTS `user_interests`;
CREATE TABLE `user_interests`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `interest_id` SMALLINT UNSIGNED NOT NULL,
    FOREIGN KEY(`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY(`interest_id`) REFERENCES `interests`(`id`)
);

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sender_user_id` INT UNSIGNED NOT NULL,
    `receiver_user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`sender_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY(`receiver_user_id`) REFERENCES `users`(`id`)
);
DROP TABLE IF EXISTS `message_content`;
CREATE TABLE `message_content`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `message_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    FOREIGN KEY(`message_id`) REFERENCES `messages`(`id`)
);

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sender_user_id` INT UNSIGNED NOT NULL,
    `receiver_user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `has_read` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(`sender_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY(`receiver_user_id`) REFERENCES `users`(`id`)
);

DROP TABLE IF EXISTS `notification_content`;
CREATE TABLE `notification_content`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `notification_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('follow', 'post', 'message') NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    FOREIGN KEY(`notification_id`) REFERENCES `notifications`(`id`)
);

SELECT u.id, u.nickname, u.created_at, u.website, u.profile_image, u.bio, u.geo_location_lat, u.geo_location_lng, u.gender,  
    DATE_FORMAT(FROM_DAYS(DATEDIFF(now(), u.birthdate)), '%Y')+0 AS age,
    JSON_ARRAYAGG(i.name) as interests
FROM users AS u
LEFT JOIN user_interests AS ui ON u.id = ui.user_id
LEFT JOIN interests AS i ON ui.interest_id = i.id
WHERE u.display_geo_location = true AND u.geo_location_lat BETWEEN 25.029807317238774 AND 25.030333479713914 AND u.geo_location_lng BETWEEN  121.53521727816917 AND 121.53606820897915 
AND "Pilates" IN (SELECT i.name FROM user_interests AS ui LEFT JOIN interests AS i ON ui.interest_id = i.id WHERE ui.user_id = u.id)
GROUP BY u.id;