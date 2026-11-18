# MusicChat

A social network for musicians. Create a profile, list your experience and courses, browse other musicians, and share posts with likes and comments.

- **Frontend** (`musicchat-fe`): React 17, Redux + redux-thunk, React Router 5, MUI / React-Bootstrap, Sass
- **Backend** (`musicchat-be`): Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt

## Demo

▶️ **[Watch the demo video](https://github.com/ayusdasdev/musicchat/releases/download/v1.0.0/musicchat-demo.mp4)** (MP4, 268 MB, attached to the [v1.0.0 release](https://github.com/ayusdasdev/musicchat/releases/tag/v1.0.0))

## Project structure

```
musicchat/
├── musicchat-be/      Express REST API (port 5000)
│   ├── config/        DB connection + env-variable mapping
│   ├── middleware/    JWT auth, ObjectId validation
│   ├── models/        User, Profile, Post
│   └── routes/api/    users, auth, profile, posts
├── musicchat-fe/      React app (port 3000)
│   └── src/
│       ├── components/  auth, dashboard, profile(s), posts, layout
│       ├── redux/       actions + reducers
│       └── utils/       axios API client, auth token helper
├── .dev/              Local in-memory MongoDB for development
└── start.sh           Runs DB + backend + frontend together
```

## Quick start (local)

Requirements: **Node.js 18+** and a bash shell (Linux, macOS or WSL).

```bash
git clone https://github.com/ayusdasdev/musicchat.git
cd musicchat
./start.sh
```

Open http://localhost:3000.

`start.sh`:
- installs dependencies on first run
- starts a local MongoDB (`mongodb-memory-server`, stored in `.dev/db-data`)
- generates a JWT secret once (`.dev/jwt_secret`) so logins survive restarts
- runs the backend on `:5000` and the frontend on `:3000`

Options:

```bash
./start.sh --reset                       # wipe the local database first
MONGO_URI="mongodb://..." ./start.sh     # use your own MongoDB instead
```

Press `Ctrl+C` to stop everything.

### Running the services separately

```bash
# Backend
cd musicchat-be
npm install
MONGO_URI=... JWT_SECRET=... CLIENT_URL=http://localhost:3000 npm run dev

# Frontend
cd musicchat-fe
npm install
npm start
```

## Environment variables

**Backend** (`musicchat-be/.env.example`)

| Variable     | Description                                                         |
| ------------ | ------------------------------------------------------------------- |
| `MONGO_URI`  | MongoDB connection string                                           |
| `JWT_SECRET` | Long random string used to sign auth tokens                         |
| `CLIENT_URL` | Comma-separated frontend URLs allowed by CORS                       |
| `PORT`       | API port (default `5000`)                                           |

**Frontend** (`musicchat-fe/.env.example`)

| Variable            | Description                                     |
| ------------------- | ----------------------------------------------- |
| `REACT_APP_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |

Never commit real `.env` files or secrets.

## API overview

All routes are under `/api`. Protected routes need an `x-auth-token` header.

| Area      | Endpoints |
| --------- | --------- |
| `users`   | `POST /users` – register |
| `auth`    | `GET /auth` – current user · `POST /auth` – login |
| `profile` | `GET /profile/me` · `POST /profile` · `GET /profile` · `GET /profile/user/:user_id` · `DELETE /profile` · `PUT /profile/experience` · `DELETE /profile/experience/:exp_id` · `PUT /profile/course` · `DELETE /profile/course/:crc_id` |
| `posts`   | `POST /posts` · `GET /posts` · `GET /posts/:id` · `DELETE /posts/:id` · `PUT /posts/like/:id` · `PUT /posts/unlike/:id` · `POST /posts/comment/:id` · `DELETE /posts/comment/:id/:comment_id` |

## Author

Ayus Das
