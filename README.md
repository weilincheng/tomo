# Tomo

![Tomo Map](./public/images/tomo_map_screen_shot.png?raw=true "Tomo Map")

## 🙋🏻‍♂️ What is it?

**Tomo** is a location-based social web app where you can find new friends with common interests.

[Website](https://tomomap.me) | [Demo Video (in Chinese)](https://drive.google.com/file/d/1bZ81Uq8DnKeegX70wve6eDtnPS21dgKy/view)

---

## 📖 Table of Contents

- [What is it?](#🙋🏻‍♂️-what-is-it)
- [Tech Stack](#🛠-tech-stack)
- [System Structure](#🏛-system-structure)
- [Database Schema](#🗄-database-schema)
- [Features](#⚙-features)
- [How to render tens of thousands of markers in milliseconds?](#📍-how-to-render-tens-of-thousands-of-markers-in-milliseconds)
- [Installation](installation)
- [Authors](#👨🏻‍💻-authors)

## 🛠 Tech Stack

**Client:** JavaScript, jQuery, Bootstrap

**Server:** Node.js, Express, MySQL, Redis

**Cloud Services:** AWS EC2, RDS, ElastiCache, S3, CloudFront

**CI/CD:** AWS CodePipeline, CodeBuild, CodeDeploy

**Testing:** Mocha, Chai

**Others:** Socket.IO, Google Map API

## 🏛 System Structure

- Orchestrated CI/CD flow using AWS CodePipeline, CodeBuild, and CodeDeploy.
- Kept server stateless by reorganizing MySQL, Redis, and static assets to AWS RDS, ElastiCache, and S3.
  ![System Structure](./public/images/tomo_system_structure.png?raw=true "System Structure")

## 🗄 Database Schema

[![Database Schema](./public/images/tomo_db_schema.png?raw=true "Database Schema")](https://drawsql.app/tomo-1/diagrams/tomo)

## ⚙ Features

### Map

- Click the clustering marker to zoom in.
  ![Map](./public/images/map.gif?raw=true "Map")

- You can filter users based on gender, age, and interests
  ![Users filtering](./public/images/users_filtering.gif?raw=true "Users filtering")

### Micro-Blog

- You can add new posts with photos or delete old posts.
  ![Micro Blog](./public/images/micro_blog.gif?raw=true "Micro Blog")

### Instant Message

- You can send private messages to mutual followers.
- The rounded badge on the upper right corner of the user profile image indicates the user's online/offline status.

  ![Instant Message](./public/images/instant_message.gif?raw=true "Instant Message")

## 📍 How to render tens of thousands of markers in milliseconds?

Without any optimization, it might take minutes to just render 10k markers on Google Maps. Below are the two optimizations used in Tomo to improve the rendering time.

### Optimization 1: Only renders markers within the visible range

- We only need to renders

### Optimization 2: Aggregates markers into clusters by k-means clustering algorithm

## How to use it?

1. Clone the project

   ```
   git clone git@github.com:weilincheng/tomo.git
   ```

2. Change to the project directory and install NPM dependencies

   ```
   npm install
   ```

# 👨🏻‍💻 Authors

- [@weilincheng](https://www.github.com/weilincheng)
