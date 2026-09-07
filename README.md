# Smart Line Investment — Loan & Leasing Management System

A comprehensive, enterprise-grade Loan & Leasing Management System designed for **Smart Line Investment**. Built with a robust **Spring Boot 3** REST backend and a modern **React + Vite** frontend styled with Ant Design 5 and Tailwind CSS.

## System Architecture

- **Backend**: Spring Boot 3.2, Spring Security 6 (Stateless JWT + RBAC), Spring Data JPA, Hibernate, MySQL 8.0, Lombok, SpringDoc OpenAPI (Swagger UI).
- **Frontend**: React 18, Vite, Ant Design 5, Tailwind CSS, Lucide Icons, Axios, React Router 6, TanStack Query.
- **Database**: MySQL 8.0 (`loan_management_db`).

## Project Structure

```
Loan-Management-System/
├── backend/                  # Spring Boot 3 REST API Application
│   ├── src/main/java/com/smartline/loan/
│   │   ├── config/           # Security, Web MVC, OpenAPI configs
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Request/Response data transfer objects
│   │   ├── entity/           # JPA database entities
│   │   ├── exception/        # Custom exceptions and GlobalExceptionHandler
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JWT filter, provider, UserPrincipal
│   │   └── service/          # Business logic services
│   ├── src/main/resources/   # application.yml, database migration
│   ├── pom.xml               # Maven configuration & dependencies
│   └── mvnw.cmd              # Maven Wrapper
├── frontend/                 # Vite + React Frontend Application
│   ├── src/
│   │   ├── api/              # Axios HTTP client and API services
│   │   ├── assets/           # Images, logos, branding assets
│   │   ├── components/       # Shared UI components (StatCard, StatusBadge, etc.)
│   │   ├── contexts/         # AuthContext and state providers
│   │   ├── layouts/          # DashboardLayout, AppSidebar, AppHeader
│   │   ├── pages/            # Feature pages (Auth, Dashboard hubs)
│   │   ├── routes/           # ProtectedRoute and route definitions
│   │   └── styles/           # Tailwind and Ant Design themes
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── Docs/                     # Architecture & Implementation specifications
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18+ and npm
- MySQL 8.0 running locally on port 3306

### 1. Database Setup
Ensure MySQL is running on `localhost:3306`. The database `loan_management_db` will be auto-created on first start.
Default connection properties can be configured in `backend/src/main/resources/application.yml` or overridden via environment variables:
- `DB_URL`: `jdbc:mysql://localhost:3306/loan_management_db`
- `DB_USERNAME`: `root`
- `DB_PASSWORD`: `Pamiya@440`

### 2. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.
Swagger API Documentation will be accessible at: `http://localhost:8080/swagger-ui/index.html`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will start on `http://localhost:5173`.
