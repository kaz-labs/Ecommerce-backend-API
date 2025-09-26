# E-commerce Backend API for Telegram Marketplace

This document provides a comprehensive overview of the E-commerce Backend API, designed to power a marketplace within the Telegram platform. It serves as a guide for developers to get started with the project, understand its architecture, and contribute effectively.

The API is built with Node.js and Express.js, following a modular monolith architecture inspired by Domain-Driven Design (DDD).

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Project Overview](#project-overview)
  - [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [API Endpoints](#api-endpoints)
    - [User Management](#user-management)
    - [Admin](#admin)
    - [Product Management](#product-management)
    - [Review Management](#review-management)
    - [Category Management](#category-management)
    - [Shop Management](#shop-management)
    - [Cart Management](#cart-management)
    - [Order Management](#order-management)
- [Data Models](#data-models)
- [Key Concepts & Constraints](#key-concepts--constraints)
  - [Telegram Authentication](#telegram-authentication)
  - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
  - [Single-Shop Cart Constraint](#single-shop-cart-constraint)
  - [Product Snapshotting in Orders](#product-snapshotting-in-orders)
- [Testing](#testing)
  - [Testing Framework](#testing-framework)
  - [Test Structure](#test-structure)
- [Performance Goals](#performance-goals)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following software installed:
*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community)

### Installation

1.  Clone the repository to your local machine.
   
2.  Install the required dependencies:
    ```sh
    npm install
    ```

### Configuration

The project uses a `.env` file for environment variables. Create a `.env` file in the `backend` directory by copying the `.env.example` file (if it exists) or by creating a new one.

Your `.env` file should contain the following variables:

```
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
```

*   `PORT`: The port on which the server will run.
*   `MONGODB_URI`: The connection string for your MongoDB database.
*   `JWT_SECRET`: A secret key for signing JSON Web Tokens.
*   `TELEGRAM_BOT_TOKEN`: The token for your Telegram bot, used for Telegram-specific features.

### Running the Application

To start the Express server, run the following command:

```sh
npm start
```

The server will start on the port specified in your `.env` file (default is 3000).

### Running Tests

To run the test suite, use the following command:

```sh
npm test
```

This will execute all tests using Jest.

## Project Overview

This project provides a comprehensive e-commerce backend for a Telegram-based marketplace. It includes functionalities for user management, product and shop management, and a complete cart and order workflow. The system is designed with a strong emphasis on security, performance, and a seamless user experience tailored for the Telegram platform.

### Core Features

The backend supports the following core features:

*   **User Management**: Registration, authentication (including Telegram-specific login), role management (Customer, Vendor, Admin), and user profile management.
*   **Product Management**: Full CRUD (Create, Read, Update, Delete) operations for products, product categories, and customer reviews/ratings.
*   **Shop Management**: Allows vendors to create and manage their own dedicated shops.
*   **Cart & Order Management**: A complete shopping cart system with a single-shop constraint, and an order management system that includes order history and product detail snapshotting.
*   **Authentication & Authorization**: Robust security enforced using JSON Web Tokens (JWT) and a detailed Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) permission matrix.
*   **Consistent API**: A well-defined RESTful API for all functionalities.
*   **Error Handling**: Comprehensive error handling with appropriate HTTP status codes.

## Technology Stack

*   **Backend Framework**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
*   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)
*   **Telegram Integration**: [Telegraf.js](https://telegraf.js.org/)
*   **Testing**: [Jest](https://jestjs.io/)

## Project Structure

The `backend/src` directory is organized as follows, following Domain-Driven Design (DDD) principles:

```
src/
├── app.js              # Main application file, Express app setup
├── config/             # Configuration files (e.g., database.js)
├── controllers/        # Express controllers, handle API requests and responses
├── middleware/         # Custom middleware (auth, error handling, logging, etc.)
├── models/             # Mongoose data models
├── routes/             # Express route definitions
├── services/           # Business logic and service layer
├── telegram/           # Telegram bot integration (BFF - Backend for Frontend)
└── utils/              # Utility functions
```

## API Documentation

The complete API specification is available in the `openAPI-spec/` directory.
*   `openapi.json`: The OpenAPI 3.0 specification file.
*   `openapi-notes.md`: Additional notes and context for the API.

### Base URL

All API endpoints are prefixed with:
`/api/v1`

### Authentication

Most endpoints require authentication. The API uses JWT Bearer Token authentication. To access protected routes, you must include an `Authorization` header with the value `Bearer <your_jwt_token>`.

### API Endpoints

Here is a summary of the available API endpoints, grouped by functionality.

#### User Management

| Method | Path                   | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| POST   | `/users/register`      | Register a new user.               |
| POST   | `/users/login`         | Log in a user.                     |
| POST   | `/users/telegram-auth` | Authenticate a user via Telegram.  |
| GET    | `/users/me`            | Get the current user's profile.    |
| PATCH  | `/users/me`            | Update the current user's profile. |

#### Admin

| Method | Path                     | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| GET    | `/admin/users`           | Get all users (Admin only).        |
| PATCH  | `/admin/users/{id}/role` | Update a user's role (Admin only). |

#### Product Management

| Method | Path             | Description                   |
| ------ | ---------------- | ----------------------------- |
| POST   | `/products`      | Create a new product.         |
| GET    | `/products`      | Get all products (paginated). |
| GET    | `/products/{id}` | Get a single product by ID.   |
| PATCH  | `/products/{id}` | Update a product by ID.       |
| DELETE | `/products/{id}` | Delete a product by ID.       |

#### Review Management

| Method | Path                            | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | `/products/{productId}/reviews` | Create a review for a product. |
| GET    | `/products/{productId}/reviews` | Get all reviews for a product. |

#### Category Management

| Method | Path          | Description                     |
| ------ | ------------- | ------------------------------- |
| POST   | `/categories` | Create a new category.          |
| GET    | `/categories` | Get all categories (paginated). |

#### Shop Management

| Method | Path          | Description              |
| ------ | ------------- | ------------------------ |
| POST   | `/shops`      | Create a new shop.       |
| GET    | `/shops/{id}` | Get a single shop by ID. |
| PATCH  | `/shops/{id}` | Update a shop by ID.     |

#### Cart Management

| Method | Path                   | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| GET    | `/cart`                | Get the current user's cart.           |
| POST   | `/cart`                | Add an item to the cart.               |
| PATCH  | `/cart/items/{itemId}` | Update an item's quantity in the cart. |
| DELETE | `/cart/items/{itemId}` | Remove an item from the cart.          |

#### Order Management

| Method | Path           | Description                               |
| ------ | -------------- | ----------------------------------------- |
| POST   | `/orders`      | Create a new order from the user's cart.  |
| GET    | `/orders`      | Get all orders for the current user/shop. |
| GET    | `/orders/{id}` | Get a single order by ID.                 |

## Data Models

The application uses the following data models. For more details, see `specs/001-develop-a-comprehensive/data-model.md`.

*   **User**: Base model for all users, with discriminators for `Customer`, `Vendor`, and `Admin` roles. Contains `telegramId`, `username`, and `role`.
*   **Shop**: Represents a vendor's storefront. Includes `name`, `description`, and a reference to the `vendor`.
*   **Product**: An item for sale. Includes `name`, `description`, `price`, and references to `Category` and `Shop`.
*   **Category**: Used to classify products. Contains a unique `name`.
*   **Review**: Customer feedback on a product. Includes `rating`, `comment`, and references to `Product` and `User`.
*   **Cart**: A user's temporary collection of items from a single shop. Contains references to `User` and `Shop`, and an array of `items`.
*   **Order**: A confirmed purchase. Contains references to `User` and `Shop`, an array of `items` (with product details snapshotted), and an order `status`.

## Key Concepts & Constraints

### Telegram Authentication
The `/users/telegram-auth` endpoint provides a secure way to log in or register users based on data from Telegram's login widget. It verifies a hash provided by Telegram to ensure data integrity.

### Role-Based Access Control (RBAC)
The application enforces strict access control based on user roles (`customer`, `vendor`, `admin`). For example:
*   Only `admin` users can access the `/admin/*` routes.
*   Only `vendor` or `admin` users can create, update, or delete products.
*   Only `customer` users can create reviews or manage their own cart.

### Single-Shop Cart Constraint
A user's cart can only contain items from a single shop at a time. If a user tries to add an item from a different shop, the API will return an error. This simplifies the checkout process.

### Product Snapshotting in Orders
When an order is created, the `name` and `price` of each product are copied and stored within the order document. This ensures that the order details remain historically accurate, even if the original product information is updated later.

## Testing

### Testing Framework
The project uses [Jest](https://jestjs.io/) as its testing framework.

### Test Structure
Tests are located in the `backend/tests/` directory and are organized into three categories:

*   `unit/`: Unit tests for individual functions, models, or services in isolation.
*   `integration/`: Integration tests that verify the interaction between different parts of the application (e.g., a full user story flow from controller to database).
*   `contract/`: Contract tests that verify the API endpoints adhere to the OpenAPI specification. They check request/response schemas, status codes, and basic success/error cases.

The project follows a Test-Driven Development (TDD) approach, where tests are written before the implementation code.

## Performance Goals

The application is designed to meet the following performance targets:

*   **API Response Times**: Average response time of <200ms, with a 95th percentile of <500ms.
*   **Database Queries**: Critical queries should complete within 50ms.
*   **Scalability**: The system is designed to support at least 100 concurrent users with 99% uptime.
