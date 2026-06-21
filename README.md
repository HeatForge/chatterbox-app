# chatterbox-app

A full-stack application template with React frontend and Spring Boot backend.

## Structure

```
├── frontend/          React + Vite + TypeScript
├── backend/           Spring Boot + Maven + GraalVM Native
├── scripts/           Development scripts
├── db/                Database schema reference
├── dist/              Build output
├── config.yaml        Project metadata
└── .env               Environment variables
```

## Prerequisites

- Node.js 20+
- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- GraalVM 21+ (for native image builds only)

## Setup

```bash
# Install frontend dependencies
cd frontend && npm install

# Start PostgreSQL (if not running)
# Ensure the database and user from .env exist

# Start development servers
scripts/start
```

## Scripts

| Script                   | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `scripts/start`          | Start frontend and backend in development mode                  |
| `scripts/build`          | Build frontend static files and backend native image to `dist/` |
| `scripts/test`           | Run all tests; use `-f` or `-b` for frontend/backend only       |
| `scripts/clone-template` | Clone this template to start a new project                      |

## Environment Variables

See `.env.example` for all available variables. Copy to `.env` and adjust as needed.
