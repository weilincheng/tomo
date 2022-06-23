-- Create the database and tables if they don't exist
CREATE DATABASE IF NOT EXISTS tomo;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nickname` VARCHAR(747) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `location` VARCHAR(255),
    `website` VARCHAR(2048), 
    `profile_image` VARCHAR(255), 
    `background_image` VARCHAR(255),
);
DROP TABLE IF EXISTS `relationships`;
CREATE TABLE `relationships`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `follower_user_id` INT UNSIGNED NOT NULL,
    `followed_user_id` INT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`follower_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY(`followed_user_id`) REFERENCES `users`(`id`)
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
    `interest_name` VARCHAR(255) NOT NULL
);
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