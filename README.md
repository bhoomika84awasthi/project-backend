# Project Backend (Express + MongoDB)

This backend implements:
- Signup and Login (JWT)
- Project CRUD (create, read, update, delete)
- ProjectTask CRUD and listing by project
- ProjectStatus create & list
- Comment create & list by task

## Requirements
- Node.js (v16+)
- MongoDB running locally or accessible via connection string

## Setup
1. Extract the ZIP.
2. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
3. Run:
   ```
   npm install
   npm run dev
   ```
   Server will start on `http://localhost:5000` by default.

## API Endpoints (base: /api)

### Auth
- POST /api/auth/signup
  - body: { "name","email","password" }
- POST /api/auth/login
  - body: { "email","password" }
- Both return `{ token, user }`. Include token in header `Authorization: Bearer <token>` for protected routes.

### Projects (protected)
- POST /api/projects
  - body: { title, description }
- GET /api/projects
- GET /api/projects/:id
- PUT /api/projects/:id
- DELETE /api/projects/:id

### Tasks (protected)
- POST /api/tasks
  - body: { title, project, description, assignedTo, status }
- GET /api/tasks/project/:projectId
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Statuses (protected)
- POST /api/statuses
  - body: { name, color }
- GET /api/statuses

### Comments (protected)
- POST /api/comments
  - body: { content, task }
- GET /api/comments/task/:taskId

## Testing with Postman
1. Sign up: POST /api/auth/signup with JSON body:
   ```
   {
     "name": "Alice",
     "email": "alice@example.com",
     "password": "password123"
   }
   ```
2. Login: POST /api/auth/login -> copy `token` from response.
3. In Postman, create a header for protected requests:
   - Key: `Authorization`
   - Value: `Bearer <token>`
4. Create a project, create statuses, create tasks (use returned project._id), add comments to a task, list them.
5. Example: Create project
   - POST /api/projects
   - Body: { "title": "My Project", "description": "desc" }

## Notes
- This is a minimal starter implementation. Add validation, error handling, role checks, rate limiting, pagination, tests, etc. as needed.
