[![Tomo Map](./public/images/tomo_landing_page.png?raw=true "Tomo Map")](https://tomomap.me)

## 🙋🏻‍♂️ What is it?

**Tomo** is a location-based social web app where you can find new friends with common interests.

[View Website](https://tomomap.me) | [Demo Video (in Chinese)](https://drive.google.com/file/d/1bZ81Uq8DnKeegX70wve6eDtnPS21dgKy/view)

---

## 📖 Table of Contents

- [What is it?](#🙋🏻‍♂️-what-is-it)
- [Tech Stack](#🛠-tech-stack)
- [System Structure](#🏛-system-structure)
- [Database Schema](#🗄-database-schema)
- [Features](#⚙-features)
- [How to render tens of thousands of markers in milliseconds?](#📍-how-to-render-tens-of-thousands-of-markers-in-milliseconds)
- [How to use it?](#📚-how-to-use-it)
- [Author](#👨🏻‍💻-author)

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

- Clicks the clustering marker to zoom in.
  ![Map](./public/images/map_zoom_in.gif?raw=true "Map")

- Filters users based on gender, age, and interests.
  ![Users filtering](./public/images/users_filtering.gif?raw=true "Users filtering")

### Micro-Blog

- Adds new posts with photos or deletes old posts.

### Follow/Block

- Follows users you find interesting to receive new post notifications.

- Blocks any users if you do not want them to see your micro-blog or send messages to you.

### Instant Message

- Sends private messages.
- The circle badge on the upper right corner of the user profile image indicates the user's online/offline status.

## 📍 How to render tens of thousands of markers in milliseconds?

Without any optimization, it might take minutes to render 10k markers on Google Maps. Below are the two optimizations used in Tomo to improve the rendering time.

### Optimization 1: Only renders markers within the visible range

- Since the visible range of maps is limited, it is enough to just render markers that are within the visible range.
- But what if the currently visible range is large that we still need to render many markers? That’s why we need the second optimization.

### Optimization 2: Aggregates markers into clusters by the k-means clustering algorithm

- When there are numerous markers on the map, instead of rendering each marker individually, we can render a clustering marker to represent a group of markers. There are two advantages:
  - Keep the information on the map simple and easy to understand
  - Reduce the number of markers we need to render
- After the aggregation on the server side, the client side only receives aggregated clustering markers that carry a number to indicate the number of markers. Assuming we aggregate 10k markers into 10 groups, the number of markers we need to render is 1000 times less.

### Flow

![Marker Rendering](./public/images/marker_rendering.png?raw=true "Instant Message")

## 📚 How to use it?

1. Clone the project

   ```
   git clone git@github.com:weilincheng/tomo.git
   ```

2. Change to the project directory and install NPM dependencies

   ```
   npm install
   ```

3. Refer to `.env.template` to create a `.env` file under root directory

4. Run the below command to start the server

   ```
   node index.js
   ```

5. Use browser to open the localhost path `http://localhost:8080` (You can set the port number in `.env`)

## Inspiration

The project was inspired by [Twitter](https://twitter.com) and [Snapchat](https://www.snapchat.com).

## 👨🏻‍💻 Author

- [@weilincheng](https://www.github.com/weilincheng)
