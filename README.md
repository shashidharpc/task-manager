# Task Manager

A full-stack Task Management application built using Flask, MongoDB, Bootstrap, and Vanilla JavaScript. Users can register, log in, and manage their tasks through a simple and responsive interface.

---

## Features

* User Registration and Login
* JWT Authentication
* Password Hashing using Werkzeug
* Create, Read, Update, and Delete Tasks
* Task Status Management (Todo, In Progress, Done)
* MongoDB Database Integration
* User-Specific Task Management
* Responsive Bootstrap UI
* Flask Serves Both Frontend and Backend

---

## Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Frontend        | HTML, CSS, JavaScript, Bootstrap 5 |
| Backend         | Python, Flask                      |
| Authentication  | Flask-JWT-Extended                 |
| Database        | MongoDB (PyMongo)                  |
| Version Control | Git & GitHub                       |
| Deployment      | Render (Planned)                   |

---

## Project Structure

```text
taskmanager/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/
│   │   └── settings.py
│   ├── models/
│   │   └── database.py
│   └── routes/
│       ├── auth.py
│       └── tasks.py
│
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── register.html
│   │   └── dashboard.html
│   │
│   ├── components/
│   │   ├── styles.css
│   │   └── dashboard.js
│   │
│   └── services/
│       └── api.js
│
└── README.md
```

---

## Prerequisites

Before running the project, install:

* Python 3.10 or higher
* MongoDB Community Server or MongoDB Atlas
* Git (optional)

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd taskmanager
```

### 2. Create Virtual Environment

```bash
cd backend
python -m venv testenv
```

### 3. Activate Virtual Environment

Windows:

```bash
testenv\Scripts\activate
```

Linux / macOS:

```bash
source testenv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET_KEY=my-secret-key
FLASK_ENV=development
```

If using MongoDB Atlas:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET_KEY=my-secret-key
```

### 6. Run the Application

```bash
python app.py
```

Open:

```text
http://localhost:5000
```

The login page will load automatically.

---

## API Endpoints

### Authentication

#### Register User

```http
POST /register
```

Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

#### Login User

```http
POST /login
```

Request Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Tasks

All task routes require a valid JWT token.

#### Get Tasks

```http
GET /tasks
```

#### Create Task

```http
POST /tasks
```

```json
{
  "title": "Learn Flask",
  "description": "Complete project",
  "status": "Todo"
}
```

#### Update Task

```http
PUT /tasks/<task_id>
```

#### Delete Task

```http
DELETE /tasks/<task_id>
```

---

## Database Design

### Users Collection

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "hashed_password"
}
```

### Tasks Collection

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "string",
  "description": "string",
  "status": "Todo | In Progress | Done",
  "created_at": "datetime"
}
```

---

## Assumptions

* JWT tokens are stored in localStorage.
* Email verification is not implemented.
* Password reset functionality is not included.
* This application is designed for educational and assignment purposes.

---

## Trade-offs & Technical Decisions

* Flask was chosen because it is lightweight and easy to maintain.
* MongoDB was selected for flexible document storage.
* Vanilla JavaScript was used instead of a frontend framework to keep the application lightweight.
* Bootstrap was used to speed up UI development and ensure responsiveness.
* JWT authentication provides secure stateless authentication.

---

## Future Improvements

* Drag-and-drop Kanban board
* Task priorities
* Due dates
* Dark mode
* Task search and filtering
* User profile management
* Email notifications

---

## Deployment

Deployment will be completed using:

* GitHub (Source Code)
* MongoDB Atlas (Database)
* Render (Application Hosting)

---

## Deployment Links

Frontend:

```text
To be added after deployment
```

Backend:

```text
To be added after deployment
```

---

## Author
Shashidhar P C
Task Manager Application 