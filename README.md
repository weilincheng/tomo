![Tomo Map](./public/images/tomo_map_screen_shot.png?raw=true "Tomo Map")

# 🙋🏻‍♂️ What is Tomo?

**Tomo** is a location-based social web app where you can find new friends who share common interests.

[Demo](https://tomomap.me)

# 📖 Table of Contents

- [What is Tomo?](#🙋🏻‍♂️-what-is-tomo)
- [Tech Stack](#🛠-tech-stack)
- [System Structure](#🏛-system-structure)
- [Database Schema](#🗄-database-schema)
- [Features](#⚙-features)
- [API Docs](#api-docs)
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

![Database Schema](./public/images/tomo_db_schema.png?raw=true "Database Schema")

# ⚙ Features

## Map

- Displaying user icons on Google Map
  ![Map](./public/images/map.gif?raw=true "Map")

- Users filtering based on gender, age, and interests
  ![Users filtering](./public/images/users_filtering.gif?raw=true "Users filtering")

## Micro-Blog

- New post
  ![New post](./public/images/users_filtering.gif?raw=true "New post")

## Instant Message

- Displays online/offline status

---

# API Docs

### API Version

v1

---

### User Sign Up API

- **End point**: `/user/signup`

- **Method**: `POST`

- **Request Headers:**
  | Field | Type | Description |
  | :---: | :---: | :---: |
  | Content-Type | String | Only accept `application/json`. |

* **Request Body**

  |  Field   |  Type  | Description |
  | :------: | :----: | :---------: |
  |   name   | String |  Required   |
  |  email   | String |  Required   |
  | password | String |  Required   |
  | location | String |  Optional   |
  | website  | String |  Optional   |

- **Request Body Example:**

```
{
  "name":"test",
  "email":"test@test.com",
  "password":"test",
  "location":"Taiwan",
  "website":"weilin.com"
}
```

- **Success Response: 200**

|       Field       |  Type  | Description                           |
| :---------------: | :----: | :------------------------------------ |
|   access_token    | String | Access token from server.             |
| access_expiration | Number | Access token expired time in seconds. |

```
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6joiYXJ0aHVIjoxNjEzNTY3MzA0fQ.6EPCOfBGynidAfpVqlvbHGWHCJ5LZLtKvPaQ",
  "access_expiration": "1d",
  "user": {
    "id": 1,
    "name": "test",
    "email": "test@test.com",
    "location":"Taiwan",
    "website":"weilin.com",
  }
}
```

- **Email Already Exists: 403**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

- **Client Error Response: 400**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

- **Server Error Response: 500**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

---

### User Sign In API

- **End point**: `/user/signin`

- **Method**: `POST`

- **Request Headers:**
  | Field | Type | Description |
  | :---: | :---: | :---: |
  | Content-Type | String | Only accept `application/json`. |

* **Request Body**

  |  Field   |  Type  |             Description              |
  | :------: | :----: | :----------------------------------: |
  | provider | String | Required. Only accepts `native` now. |
  |  email   | String |               Required               |
  | password | String |               Required               |

- **Request Body Example:**

```
{
  "name":"test",
  "email":"test@test.com",
  "password":"test",
  "location":"Taiwan",
  "website":"weilin.com"
}
```

- **Success Response: 200**

|     Field      |     Type      | Description                           |
| :------------: | :-----------: | :------------------------------------ |
|  access_token  |    String     | Access token from server.             |
| access_expired |    Number     | Access token expired time in seconds. |
|      user      | `User Object` | User information                      |

- **Success Response Example:**

```
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6joiYXJ0aHVIjoxNjEzNTY3MzA0fQ.6EPCOfBGynidAfpVqlvbHGWHCJ5LZLtKvPaQ",
  "access_expired": 3600,
  "user": {
    "id": 11245642,
    "name": "test",
    "email": "test@test.com",
  }
}
```

- **Sign In Failed: 403**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

- **Client Error Response: 400**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

- **Server Error Response: 500**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

---

### User Profile API

- **End Point:** `/user/profile`

- **Method:** `GET`

- **Request Headers:**

|     Field     |  Type  |                                      Description                                       |
| :-----------: | :----: | :------------------------------------------------------------------------------------: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik` |

- **Success Response: 200**

| Field |     Type      | Description |
| :---: | :-----------: | :---------- |
| data  | `User Object` | User info.  |

- **Success Response Example:**

```
{
  "id": 11245642,
  "name": "test",
  "email": "test@test.com",
}
```

- **Client Error (No token) Response: 401**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

- **Client Error (Wrong token) Response: 403**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

- **Server Error Response: 500**

| Field |  Type  | Description    |
| :---: | :----: | :------------- |
| error | String | Error message. |

### User Id API

- **End Point:** `/user/:userId`

- **Method:** `GET`

- **Query Parameters:** `userId`

- **Success Response Example:**

```
{
  "id": 11245642,
  "name": "test",
  "email": "test@test.com",
}
```

### Add User Posts API

- **End Point:** `/user/:userId/posts`

- **Method:** `POST`

- **Request Headers:**

|     Field     |  Type  |                                      Description                                       |
| :-----------: | :----: | :------------------------------------------------------------------------------------: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik` |

- **Request Body Example:**

```
{
  "content": "Hello!"
}
```

### Get User Posts API

- **End Point:** `/user/:userId/posts`

- **Method:** `GET`

- **Success Response Example:**

```
{
  "id": 11245642,
  "user_id": 12,
  "text": "A hard day's night",
  "created_at": "2022-06-21T07:03:37.000Z",
  "post_images" : ["image1.jpg", "image2.jpg"]
}
```

### Add User Follower API

- **End Point:** `/user/follow/:targetUserId`

- **Method:** `POST`

- **Request Headers:**

|     Field     |  Type  |                                      Description                                       |
| :-----------: | :----: | :------------------------------------------------------------------------------------: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik` |

### Remove User Follower API

- **End Point:** `/user/follow/:targetUserId`

- **Method:** `DELETE`

- **Request Headers:**

|     Field     |  Type  |                                      Description                                       |
| :-----------: | :----: | :------------------------------------------------------------------------------------: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik` |

### Get User Follower / Following API

- **End Point:** `/user/follow/:targetUserId`

- **Method:** `GET`

### Get Message API

- **End Point:** `/message/:currentUserId/:targetUserId`

- **Method:** `GET`

- **Query Parameters :** `currentUserId`, `targetUserId`

  - currentUserId can only be an int
  - targetUserId can be an int or `all`
  - This end point returns all the user id that sends message to current user id when targetUserId is set to `all`
  - This end point returns all the messages between current user id and target user id when targetUserId is set to an int

- **Request Headers:**

|     Field     |  Type  |                                      Description                                       |
| :-----------: | :----: | :------------------------------------------------------------------------------------: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik` |

### Save Message API

- **End Point:** `/message/:currentUserId/:targetUserId`

- **Method:** `POST`

- **Query Parameters :** `currentUserId`, `targetUserId`

- **Request Headers:**

|     Field     |  Type  |                                      Description                                       |
| :-----------: | :----: | :------------------------------------------------------------------------------------: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik` |

- **Request Body Example:**

```
{
  "type": "text",
  "content": "Hello!!"
}
```

# 👨🏻‍💻 Authors

- [@weilincheng](https://www.github.com/weilincheng)
