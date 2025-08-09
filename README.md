# ThinkUp Server

Backend API for the ThinkUp platform managing articles, categories, comments, and user interactions with Firebase authentication.

## Features

- CRUD operations for articles
- Pagination, category filtering, and search
- User authentication with Firebase Admin SDK
- Article liking/unliking system
- Comment management per article
- Categories aggregation from articles

## Tech Stack

- Node.js, Express.js
- MongoDB (native driver)
- Firebase Admin SDK
- CORS, dotenv

## API Overview

- `GET /articles` - List articles with optional filters (category, author_id, search) and pagination
- `GET /article/:id` - Get single article
- `POST /article` - Create article (auth required)
- `PUT /article/:id` - Update article (auth required)
- `DELETE /article/:id` - Delete article (auth required)
- `PATCH /article/like/:id` - Like/unlike article (auth required)
- `GET /categories` - List all categories
- `GET /comments/:articleId` - Get comments for article
- `POST /comments` - Add comment (auth required)

## Setup

1. Clone repo and install dependencies:

    ```bash
    git clone <repo_url>
    npm install
    ```

2. Create .env file with:

    ```bash
    PORT=3000
    MONGODB_URI=<your_mongodb_uri>
    FIREBASE_SERVICE_ACCOUNT='<firebase_service_account_json_string>'
    ```

3. Run server:

    ```bash
    npm run dev
    ```

## Authentication

Use Firebase ID tokens in the Authorization: Bearer <token> header for protected routes.


<p align="center">Made with ❤️ for ThinkUp</p>
