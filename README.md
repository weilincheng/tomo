![Tomo Map](./public/images/tomo_map_screen_shot.png?raw=true "Tomo Map")

# 🙋🏻‍♂️ What is it?

**Tomo** is a location-based social web app where you can find new friends who share common interests.

[Website](https://tomomap.me) | [Demo Video (in Chinese)](https://drive.google.com/file/d/1bZ81Uq8DnKeegX70wve6eDtnPS21dgKy/view)

---

# 📖 Table of Contents

- [What is it?](#🙋🏻‍♂️-what-is-it)
- [Tech Stack](#🛠-tech-stack)
- [System Structure](#🏛-system-structure)
- [Database Schema](#🗄-database-schema)
- [Features](#⚙-features)
- [How to use it?](#how-to-use-it)
- [Authors](#👨🏻‍💻-authors)

# 🛠 Tech Stack

**Client:** JavaScript, jQuery, Bootstrap

**Server:** Node.js, Express, MySQL, Redis

**Cloud Services:** AWS EC2, RDS, ElastiCache, S3, CloudFront

**CI/CD:** AWS CodePipeline, CodeBuild, CodeDeploy

**Testing:** Mocha, Chai

**Others:** Socket.IO, Google Map API

# 🏛 System Structure

![System Structure](./public/images/tomo_system_structure.png?raw=true "System Structure")

# 🗄 Database Schema

[![Database Schema](./public/images/tomo_db_schema.png?raw=true "Database Schema")](https://drawsql.app/tomo-1/diagrams/tomo)

# ⚙ Features

## Map

- Displaying user icons on Google Map
  ![Map](./public/images/map.gif?raw=true "Map")

- Users filtering based on gender, age, and interests
  ![Users filtering](./public/images/users_filtering.gif?raw=true "Users filtering")

## Micro-Blog

- User profile and new post
  ![Micro Blog](./public/images/micro_blog.gif?raw=true "Micro Blog")

## Instant Message

- Sends private message, and displays online/offline status
  ![Instant Message](./public/images/instant_message.gif?raw=true "Instant Message")

# How to use it?

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
