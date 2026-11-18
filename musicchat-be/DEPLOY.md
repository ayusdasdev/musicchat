# MusicChat – fix notes and deploy guide

## What was wrong (and what was fixed)

### Blockers – why a fresh deploy would not work
1. **CORS locked to the old frontend URL.** `app.js` only allowed `https://musicchat-wheat.vercel.app`. Any new frontend URL gets blocked, so login and register fail silently.
   - Fixed: allowed origins now come from the `CLIENT_URL` env variable.
2. **Backend URL hard-coded in the frontend.** `src/utils/api.js` pointed at `https://musicchat-be.onrender.com/api`, which you no longer control.
   - Fixed: it now reads `REACT_APP_API_URL`.
3. **Database password and JWT secret committed to a public repo** (`config/default.json`). You no longer control that Atlas cluster, and anyone can read those credentials.
   - Fixed: secrets are now read from `MONGO_URI` / `JWT_SECRET` env variables. Use a **new** Atlas cluster and a new secret.
4. **Frontend `package-lock.json` out of sync.** `npm ci` failed.
   - Fixed: the lock file has been regenerated.
5. **Build fails in CI mode.** Bootstrap 5.1 caused a CSS warning, which is treated as an error when `CI=true`.
   - Fixed: Bootstrap upgraded to 5.3. `CI=true npm run build` now compiles cleanly.
6. **The app crashes when the server can't be reached.** Every `catch` read `err.response.status`. During a network error, a CORS error or a Render cold start, `err.response` is undefined, so the app threw a TypeError and the spinner never stopped.
   - Fixed: an interceptor now turns these into a "Cannot reach server" alert.

### Bugs fixed
- `GET /api/profile/me` populated `['name,avatar']` (a single wrong string), so the dashboard got no name or avatar. Fixed to `['name', 'avatar']`.
- Deleting an account left that user's posts behind. They are now deleted too.
- Liking, commenting on, or deleting a comment on a post that no longer exists caused a 500 crash. It now returns a 404.
- Adding experience or a course before creating a profile caused a 500 crash. It now returns a clear message.
- Refreshing on `/dashboard` and similar pages could 404 on Vercel. Added `vercel.json` with an SPA rewrite.
- Smaller fixes:
  - removed the fake `Access-Control-*` *request* headers (servers send these, not clients)
  - removed the unused `client/build` static block and the unused `utils/cors.js`
  - added `prop-types` as a dependency
  - removed `--openssl-legacy-provider`

### Known limitation (not a code bug)
- On Render's free plan, the backend sleeps after 15 minutes of no traffic. The first request after that takes about a minute. If the first login seems stuck, wait and try again.

---

## Step-by-step deploy

### 0. Prerequisites
- A new GitHub account or your current one
- Free accounts on **MongoDB Atlas**, **Render** and **Vercel** (sign in with GitHub)
- Node 18+ installed locally (optional, only if you want to run the app locally)

### 1. Push the code to two new GitHub repos
```bash
cd musicchat-be
git init && git add . && git commit -m "MusicChat backend"
git branch -M main
git remote add origin https://github.com/<you>/musicchat-be.git
git push -u origin main

cd ../musicchat-fe
git init && git add . && git commit -m "MusicChat frontend"
git branch -M main
git remote add origin https://github.com/<you>/musicchat-fe.git
git push -u origin main
```
(Create both empty repos on github.com first. Do not add a README there.)

### 2. Create the database (MongoDB Atlas)
1. Go to cloud.mongodb.com and create a project. Then **Create cluster**, choose **M0 Free**, and pick a region near Mumbai.
2. Go to **Database Access** and **Add user** with a username and a generated password. Save the password.
3. Go to **Network Access** and **Add IP**, then enter `0.0.0.0/0`. Render's free plan has no fixed IP, so this is needed.
4. Go to **Connect**, choose **Drivers**, and copy the connection string. Replace `<password>`, and put `musicChatDatabase` before the `?`:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/musicChatDatabase?retryWrites=true&w=majority`

### 3. Deploy the backend (Render)
1. In Render, click **New**, then **Web Service**, and connect the `musicchat-be` repo.
2. Use these settings:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: Free
3. Add these **Environment Variables**:
   - `MONGO_URI` = the string from step 2
   - `JWT_SECRET` = any long random string (for example from `openssl rand -hex 32`)
   - `CLIENT_URL` = `http://localhost:3000` for now. You'll update it in step 5.
4. Click **Deploy**. In the logs, wait until you see both `Server started on port ...` and `MongoDB Connected...`.
5. Open `https://<your-service>.onrender.com/`. It should show `"All ok!"`. Copy this URL.

### 4. Deploy the frontend (Vercel)
1. In Vercel, click **Add New**, then **Project**, and import `musicchat-fe`. The framework preset is detected as Create React App.
2. Add this **Environment Variable**:
   - `REACT_APP_API_URL` = `https://<your-service>.onrender.com/api` (the URL must end in `/api`)
3. Click **Deploy**. Copy the URL it gives you, for example `https://musicchat-xyz.vercel.app`.

### 5. Connect the frontend and backend
1. In Render, go to the backend's **Environment** settings and set:
   `CLIENT_URL` = `https://musicchat-xyz.vercel.app,http://localhost:3000`
   Don't include a trailing slash. Add more URLs separated by commas.
2. Save. Render redeploys automatically.

### 6. Test it
Open the Vercel URL and test the app in this order:
1. register
2. you are redirected to the dashboard
3. create a profile
4. add an experience and a course
5. create a post
6. like it
7. comment on it
8. log out and log back in
9. refresh on /dashboard

If something fails, open the browser DevTools (F12) and check:
- **Console** shows a "CORS" error: `CLIENT_URL` on Render doesn't exactly match your Vercel URL.
- **Network** shows requests going to `localhost:5000`: `REACT_APP_API_URL` wasn't set before the build. Set it and click **Redeploy** in Vercel. React bakes env variables in at build time.
- **"Cannot reach server"**: the backend is waking up. Wait about a minute.
- **Render logs** show `MONGO_URI is not set`, or an auth or timeout error: check the env variable, the DB user's password, and that Network Access includes `0.0.0.0/0`.

### Run locally (optional)
```bash
# terminal 1
cd musicchat-be && npm install
MONGO_URI="..." JWT_SECRET="dev" CLIENT_URL="http://localhost:3000" npm run dev
# terminal 2
cd musicchat-fe && npm install && npm start   # uses .env.development -> localhost:5000
```

### Using Claude Code later
Open a repo folder and run `claude`. Useful prompts:
- "Read the project and list bugs or security issues"
- "Run the app locally and fix any errors"
- "Why does login fail with this console error: …"
