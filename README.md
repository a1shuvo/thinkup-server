# ThinkUp Server

ThinkUp Server is the backend API service for the ThinkUp platform — a content and community-driven application that manages articles, categories, comments, user interactions, and authentication using Firebase.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- Secure user authentication and authorization with Firebase Admin SDK
- CRUD operations for articles
- Pagination, filtering (by category), and searching articles by title
- Categories management and retrieval
- Comment system linked to articles
- Like/unlike functionality for articles with user tracking
- CORS enabled for frontend-backend integration
- Express middleware for JSON parsing and request validation

---

## Tech Stack

- Node.js
- Express.js
- MongoDB (with native MongoDB driver)
- Firebase Admin SDK (for authentication & token verification)
- dotenv for environment variable management
- CORS middleware

---

## API Endpoints

### Articles

- `GET /articles`  
  Fetch articles with optional query params:

  - `category` (string) — filter by category
  - `author_id` (string) — filter articles by author (requires Firebase auth)
  - `search` (string) — case-insensitive search in article title
  - `page` (number, default 1) — pagination page number
  - `limit` (number, default 9) — number of articles per page

- `GET /article/:id`  
  Fetch a single article by its ID.

- `POST /article`  
  Create a new article. Requires Firebase authentication via Bearer token.

- `PUT /article/:id`  
  Update an existing article by ID. Requires Firebase authentication.

- `DELETE /article/:id`  
  Delete an article by ID. Requires Firebase authentication.

- `PATCH /article/like/:id`  
  Like or unlike an article. Requires Firebase authentication.  
  Request body must contain `{ userId: string }`.

### Categories

- `GET /categories`  
  Retrieve all distinct article categories.

### Comments

- `GET /comments/:articleId`  
  Get comments for a specific article.

- `POST /comments`  
  Post a new comment. Requires Firebase authentication.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud)
- Firebase project with service account credentials
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/a1shuvo/thinkup-server.git
   cd thinkup-server
   ```
