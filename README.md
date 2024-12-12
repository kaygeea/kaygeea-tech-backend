# Portfolio Website Backend API

## Table of Contents

1. [Introduction](#introduction)  
2. [Key Features](#key-features)  
   - [Centralized Error Handling](#centralized-error-handling)  
   - [Data Validation](#data-validation)  
   - [Customized Logging](#customized-logging)  
3. [Technologies Used](#technologies-used)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Running the Application](#running-the-application)  
5. [API Documentation](#api-documentation)
6. [Code Structure](#code-structure)  
7. [Testing](#testing)
8. [License](#license)  
9. [Contact](#contact)  

## Introduction

[kaygeea.tech](https://kaygeea.tech) communicates with a backend REST API built on top of a Node.js express app based on a service-based MVC architecture and written in TypeScript; communicating to a MongoDB database via the MongoDB node.js driver. This API is designed to provide key functionalities, including fetching profile information, retrieving project details, and managing user authentication for a portfolio management system. While the dashboard implementation for this system is still underway, the API lays a robust foundation for further development.

### Motivation

This API was built to create a dynamic and easily manageable portfolio management system. It enables a centralized "single source of truth" for all portfolio data, ensuring seamless updates as my career progresses. The long-term vision is to integrate this API with an ATS-compliant resume, bridging the gap between professional portfolios and streamlined job applications.

### Technical Highlights

Scalability was a core consideration during development, ensuring the API can adapt as the project grows. By leveraging Node.js (TypeScript), Express, and MongoDB (directly via the Node.js driver), the API is both performant and flexible, avoiding the constraints of ORM frameworks and utilizing the flexibility of a document model database like MongoDB.  

### Intended Audience

Although currently tailored to my portfolio, the ultimate goal is to make this API accessible to professionals seeking a customizable platform to showcase and manage their portfolios. Whether creating a personalized website or tracking projects, this API is a step towards empowering professionals with a powerful tool for career advancement.

### Current Status

The API is in its first iteration and will soon be deployed. Development will continue post-deployment, with additional features and refinements planned for future releases.

## Key Features

### 1. Centralized Error Handling

The API implements a robust error-handling framework, ensuring consistency and clarity across all components. Key elements include:  

- **Custom Errors:**  
  - **AppBaseError:** An abstract base class extending the JavaScript `Error` class. All custom errors inherit from this base, ensuring a consistent structure for error handling.

  - **HttpError:** Thrown for bad request scenarios, such as incorrect input (e.g., wrong username or password during login).

  - **NotFoundError:** Thrown when a requested resource (e.g., profile or project detail) does not exist in the database.

  - **UnexpectedError:** Handles unforeseen exceptions, capturing the message, origin, and stack trace. Includes a `serializeError()` method for custom formatting of error messages.

  - **ValidationError:** Handles invalid data inputs during registration and login or requests with incorrect parameters. Uses `class-validator` to validate data and provides a `serializeError()` method for formatting validation errors to be returned to the client.

- **Async Error Handler:**  
  A custom middleware wraps each controller method, catching any errors and forwarding them to the global error handler for processing.  

- **Global Error Handler:**  
  A centralized error controller identifies error types and handles them appropriately by:  
  - Logging relevant information.  
  - Sending a standardized response to the client.  

This structure abstracts error handling, logging, and processing, ensuring scalability and maintainability. It allows services and models to focus on business logic while leaving error management to a dedicated system.

---

### 2. Data Validation

Data validation is seamlessly integrated into the API to ensure data integrity and reliability. Focus on data validation was important because, it helped to ensure that even without an ORM, only operations with valid data will ever get to the Database, helping to manage DB load.

- **Validation Coverage:**  
  - Validates request payloads (`req.body`) for registration and login.  
  - Validates parameters (`req.params`) for project detail retrieval.  

- **Validation Decorators:**  
  Using the `class-validator` library, the API employs decorators such as:  
  - `@IsDefined()`, `@IsString()`, `@IsEmail()`, `@IsMongoId()`, `@IsIn(Array)`, `@IsOptional()` etc.  

- **Implementation:**  
  Validation is handled via a middleware function which internally uses the `plainToInstance()` method from `class-transformer` npm library to convert plain objects to instances of the relevant DTO classes and the `validate()` method from the `class-validator` npm library to perform the actual validation. This middleware is inserted into route definitions where validation is required.

This approach ensures that only valid data is processed, reducing errors and improving system reliability.

---

### 3. Customized Logging

The API features a customized logging system using **Winston**, providing detailed and actionable log data:  

- **LoggerService Class:**  
  - Includes a `createLogger` method, which takes `loggerName` and `loggerScope` arguments.  
  - `loggerScope` appears as `defaultMeta` metadata, helping identify the source of each log entry.
  - The `createLogger` method also takes an optional `logFilePath` argument to create a logging file transport for the service or model creating the logger.

- **Controller Profiling:**  
  - Logs execution time for all valid requests handled by any controller method, to assist in performance profiling and debugging.

- **Detailed Log Messages:**  
  - Logs include meaningful and structured messages to simplify debugging and system monitoring.  

- **Output:**  
  - Currently logs to the console. Plans are in place to add file-based logging for specific services before deployment.

This logging system not only supports debugging but also provides critical insights into application performance during development.

---

### 4. Other Standout Features

- **Database Design:**
  The database designed is largely influence by the core MongoDB principle that data that is accessed together should be stored together. The design relies on embedding & referencing for related data making it possible to retrieve all profile data as well as project detail data with a single query. This design pattern helps keep queries to a minimal, but efficient at the same time.

- **Service-Based MVC Architecture:**
  Implements a clean, modular design by separating concerns into services, models, and controllers.

- **Data Transfer Objects (DTO)**
  Utilizes DTO classes for moving data between services, models & errors as well as to enable request body validation.

- **Dependency Injection:**
  Ensures flexibility and testability by decoupling service and model instantiations.

- **Singleton Database Service:**
  Manages MongoDB connections via a connection pool, optimizing resource usage and enhancing scalability.

These features collectively showcase the API's thoughtful design and readiness for further growth and complexity.

## Technologies Used

### Backend Frameworks and Languages

- Node.js (TypeScript)
- Express  

### Database

- MongoDB (via MongoDB Node.js Driver)  

### Libraries and Tools

- bcrypt-ts  
- class-transformer  
- class-validator
- http-status  
- jsonwebtoken  
- winston

### Development Tools

- TypeScript  
- Nodemon  
- Prettier  
- ESLint  

### Testing

- Postman ([Collection Link](https://documenter.getpostman.com/view/32179651/2sAYHwL5Jw))  

## Getting Started  

### Prerequisites  

- [Node.js](https://nodejs.org/) (version 22.8.x or later)  
- [MongoDB](https://www.mongodb.com/) (locally installed or cloud instance, e.g., MongoDB Atlas)  

### Installation

Clone the repository:  

   ```bash
   git clone <repository-url>
   cd kaygeea-tech-backend
   ```

Install dependencies:

   ```bash
   npm install
   ```

Create a `.ENV` file based on this template

   ```env
    # MongoDB URI connection string
    MONGODB_CONN_URI=<your-mongodb-uri>

    # MongoDB database name
    DB_NAME=<name>

    # Express server port
    PORT=3000

    # Database service log file path
    DATABASE_SERVICE_LOG_FILE=<path-to-store-db-logs>

    # JWT secret string
    SECRET_STR=<your-jwt-secret>

    # JWT expiration duration (e.g., '1h', '7d')
    TOKEN_LIFESPAN=<your-token-lifespan>
   ```

### Running the Application

   ```bash
   npm run build
   npm start
   ```

## API Documentation

[Postman Collection](https://documenter.getpostman.com/view/32179651/2sAYHwL5Jw)

### Routes

#### View Routes

This route directly connects to the frontend and handles requests related to fetching data & data for display on the website.

1. Get Profile by Username
    - **Endpoint:** `GET /:username`
    - **Description:** Retrieves the user's profile information based on the `userName`.

2. Get Project Details
    - **Endpoint:** `GET /:projectName/:projectDetailId`
    - **Description:** Fetches details for a specific project using the `projectName` and `projectDetailId`.
    - **Validation**: Ensures valid route parameters using a `ProjectDetailRequestDto` class.

#### Dashboard Route

This route also connects to the frontend, however, it allows for user authorization, making updates to profile and project details and requests to this route will eventually require authorization.

1. Register a profile
    - **Endpoint:** `POST /dashboard/profile/register`
    - **Description:** Allows a user to register their profile.
    - **Validation:** Validates the request body using a `RegisterRequestDto` class.

2. Login to a profile.
    - **Endpoint:** `POST /dashboard/profile/login`
    - **Description:** Authenticates a user and generates a JWT token.
    - **Validation:** Validates the request body using a `LoginRequestDto` class.

## Code Structure

The codebase is organized to promote a modular and scalable architecture. Below is an overview of the folder and file structure:

```plaintext
kaygeea-tech-backend/
├── dist/              # Compiled TypeScript files (output directory)
├── logs/              # Application log files
├── node_modules/      # Dependencies installed by npm
├── src/               # Source code directory
│   ├── controllers/   # Route handlers responsible for handling HTTP requests
│   ├── interfaces/    # TypeScript interfaces and type definitions
│   ├── models/        # Database schemas and models
│   ├── routes/        # API route definitions and middleware setup
│   ├── services/      # Business logic and service-layer code
│   ├── utils/         # Utility functions and helper modules
│   ├── app.ts         # Application-level middleware and initialization
│   └── server.ts      # Main entry point for starting the server
├── .env               # Environment variables (excluded from version control)
├── .gitignore         # Git ignore rules
├── .prettierrc        # Prettier configuration file
├── eslint.config.js   # ESLint configuration
├── jest.config.js     # Jest testing framework configuration
├── jsdoc.json         # JSDoc configuration for generating API documentation
├── package.json       # Project metadata and scripts
├── package-lock.json  # Dependency lock file
├── README.md          # Project documentation
├── TEMPLATE.env       # Template for environment variable configuration
└── tsconfig.json      # TypeScript compiler configuration
```

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this code, provided proper attribution is given to the original author. For more details, see the LICENSE file.

## Contact

For questions, suggestions, or inquiries about this project, feel free to reach out:

- **Portfolio Website**: [www.kaygeea.tech](https://www.kaygeea.tech)
- **GitHub**: [kaygeea](https://github.com/kaygeea)
- **Email**: [kaygeea.kga@gmail.com](mailto:kaygeea.kga@gmail.com)

I am open to feedback, contributions, and collaboration opportunities.
