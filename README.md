# tomo

## Table of Contents

- [API Docs](#api-docs)

---

## API Docs

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
  | webiste  | String |  Optional   |

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

|     Field      |  Type  | Description                           |
| :------------: | :----: | :------------------------------------ |
|  access_token  | String | Access token from server.             |
| access_expired | Number | Access token expired time in seconds. |

```
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6joiYXJ0aHVIjoxNjEzNTY3MzA0fQ.6EPCOfBGynidAfpVqlvbHGWHCJ5LZLtKvPaQ",
    "access_expired": "1d",
    "user": {
      "id": 1,
      "name": "test",
      "email": "test@test.com",
      "location":"Taiwan",
      "website":"weilin.com",
    }
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
