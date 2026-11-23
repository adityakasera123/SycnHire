# SyncHire — Complete Step-by-Step Master Guide (Beginning to End)

## 1. Hum Bana Kya Rahe Hain?
SyncHire ek online technical interview platform hai (jaise HackerRank Interview ya CoderPad). Isme Interviewer aur Candidate bina koi software download kiye browser mein ek saath live code likh sakte hain, code run karke output dekh sakte hain, 1v1 video call kar sakte hain, aur interview khatam hone ke baad Interviewer secret scorecard save kar sakta hai aur candidate ki poori coding journey replay kar sakta hai.

---

## 2. Do Users Honge:
1. **Interviewer (Host):** Account banayega, Login karega, naya Interview Room banayega, link share karega, candidate ko Admit/Deny karega, live code dekhega/likhega, secret notes/ratings bharega, aur final report dekhega.
2. **Candidate (Guest):** Bina login kiye seedha invite link kholega, apna naam daal kar waiting room mein rukega, admit hote hi live code editor aur video call mein join ho jayega. Isko interviewer ke secret notes nahi dikhenge.

---

## 3. Step-by-Step Build Plan (Kaise Banayenge?)

Hum har feature ko **Vertical Slice** tarike se banayenge: pehle us feature ka **Backend**, phir uska **Frontend**, phir **Live Test**, aur phir **GitHub Push**.

---

### ✅ Phase 0: Foundation Setup (DONE)
* **Backend:** Node.js + Express server (`localhost:8000`) banaya aur MongoDB Atlas cloud database se connect kiya.
* **Frontend:** React + Vite + Tailwind CSS (`localhost:5173`) setup kiya.
* **GitHub:** Root folder mein `.gitignore` banaya (taaki `.env` aur `node_modules` push na ho) aur repo live kiya.

---

### 🔜 Phase 1: Interviewer Authentication (Signup & Login)
* **Goal:** Sirf logged-in Interviewer hi dashboard aur room creation access kar sake.
* **Backend mein kya karenge:**
  1. `bcryptjs` aur `jsonwebtoken` install karenge.
  2. `models/User.js` banayenge (Name, Email, Hashed Password).
  3. 3 APIs banayenge: `POST /api/auth/register` (Signup), `POST /api/auth/login` (Login), aur `GET /api/auth/me` (Current User check).
  4. `middleware/authMiddleware.js` banayenge jo har protected request par JWT token verify karega.
* **Frontend mein kya karenge:**
  1. `react-router-dom` aur `axios` install karenge.
  2. `AuthContext` banayenge jo user ka login state aur token sambhalega.
  3. `/signup` aur `/login` pages banayenge.
  4. Protected Route lagayenge taaki bina login kiye koi `/dashboard` na khol sake.
* **Test:** Naya account banakar login karenge aur check karenge ki MongoDB mein password encrypted save hua hai aur Dashboard khul raha hai.

---

### Phase 2: Interviewer Dashboard & Room Creation
* **Goal:** Interviewer naya interview room bana sake aur candidate ko bhejne ke liye unique link copy kar sake.
* **Backend mein kya karenge:**
  1. `models/Room.js` banayenge (unique `roomId`, `hostId`, `title`, `language`, `problemStatement`, `status`, `currentCode`).
  2. APIs banayenge: Create Room (`POST /api/rooms`), Get My Rooms (`GET /api/rooms`), Get Single Room (`GET /api/rooms/:roomId`), aur Delete Room (`DELETE /api/rooms/:roomId`).
* **Frontend mein kya karenge:**
  1. Clean SaaS **Dashboard UI** banayenge jahan saare purane aur active rooms ki list dikhegi.
  2. **"Create New Room"** modal banayenge (Title, Language, Question daalne ke liye).
  3. Har room card par **"Copy Invite Link"** aur **"Enter Room"** button lagayenge.
* **Test:** Dashboard se room banayenge, link copy karenge, aur page refresh karne par bhi room database se load hona chahiye.

---

### Phase 3: Live Collaborative Code Editor (Real-Time Sync)
* **Goal:** Interviewer aur Candidate dono ko VS Code jaisa editor mile aur ek type kare toh doosre ki screen par turant dikhe.
* **Backend mein kya karenge:**
  1. `socket.io` install karenge aur Express server ke saath attach karenge.
  2. `sockets/socketHandler.js` banayenge jo `join-room`, `code-change`, aur `language-change` events ko handle karega.
* **Frontend mein kya karenge:**
  1. `@monaco-editor/react` aur `socket.io-client` install karenge.
  2. Split-screen **Interview Room UI** (`/room/:roomId`) banayenge: Left mein Problem Statement, Center mein Monaco Code Editor + Language Dropdown.
  3. Editor mein jo bhi type hoga, Socket.io ke through room ke doosre member ko real-time sync hoga.
* **Test:** Browser mein 2 alag tabs mein same room link kholenge—ek mein code type karenge aur doosre mein live aata hua dekhenge.

---

### Phase 4: Waiting Lobby (Admit/Deny) & Live Code Execution
* **Goal:** Candidate bina permission ke room mein na ghuse, aur dono apna code run karke real output dekh sakein.
* **Backend mein kya karenge:**
  1. Socket events add karenge: `join-lobby`, `candidate-waiting`, `admit-candidate`, `deny-candidate`.
  2. Code Runner API (`POST /api/code/run`) banayenge jo **Piston API** ko call karke C++, Python, JavaScript, aur Java code run karega aur output/error wapas bhejega.
* **Frontend mein kya karenge:**
  1. **Guest Lobby Screen:** Agar bina login wala user room link khole, toh usse naam daalne aur "Request to Join" ka option dikhega.
  2. **Host Popup:** Interviewer ki screen par "Rahul wants to join — [Admit] [Deny]" popup aayega.
  3. **Run Code Button & Output Console:** Editor ke neeche output box hoga; jab koi bhi "Run" dabayega, output dono ki screen par sync hoga.
* **Test:** Incognito tab se candidate bankar join request bhejenge, Host tab se Admit karenge, aur C++/JS code run karke output verify karenge.

---

### Phase 5: 1v1 Video/Audio Call & Secret Scorecard
* **Goal:** Interviewer aur Candidate baat kar sakein, aur Interviewer chupke se candidate ko rate karke final report save kar sake.
* **Backend mein kya karenge:**
  1. `models/Report.js` banayenge (Final Code, Ratings, Notes, Candidate Name).
  2. Report APIs banayenge: `POST /api/reports` (Save Report) aur `GET /api/reports/:roomId` (View Report).
  3. `end-interview` socket event banayenge jo room lock kar dega.
* **Frontend mein kya karenge:**
  1. **WebRTC (`peerjs`) Video Call:** Right sidebar mein 1v1 video/audio stream + Mic Mute / Camera Off buttons.
  2. **Host-Only Secret Scorecard:** Sirf Interviewer ko right panel mein DSA/Communication/Problem Solving ki 1–5 star ratings aur Notes box dikhega.
  3. **End Interview & Report Page (`/report/:roomId`):** Interview khatam hote hi report save hogi aur clean summary page khulega.
* **Test:** 2 tabs/devices par video/audio test karenge, scorecard bharenge, interview end karenge, aur saved report check karenge.

---

### Phase 6: v2 Killer Features & Final Deployment
* **Goal:** Project ko normal clone se uthakar "Resume-Worthy" banana aur live internet par deploy karna.
* **Killer Feature 1 — Time-Travel Code Replay:** Interview ke dauran har kuch seconds mein code ka snapshot timestamp ke saath save hoga. Report page par ek Play/Pause slider hoga jisse interviewer poora code bante hue replay kar sakega.
* **Killer Feature 2 — Smart Integrity Radar:** Agar candidate tab switch karega ya bada code block copy-paste karega, toh backend mein log save hoga aur interviewer ko chhota silent alert dikhega.
* **Deployment:** Backend ko **Render** par aur Frontend ko **Vercel** par deploy karenge taaki live link resume mein laga sako.



day 2 -
# SyncHire

A real-time, browser-based technical interview platform where interviewers and candidates can collaborate on live executable code over a 1v1 video call.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Monaco Editor, PeerJS (WebRTC)
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT & bcryptjs

## Key Features
- **Interviewer Auth & Dashboard:** Secure signup/login and room management.
- **Zero-Login Guest Lobby:** Candidates join via invite link with host Admit/Deny controls.
- **Live Collaborative Editor:** Real-time code sync (Socket.io) with multi-language execution.
- **1v1 Video/Audio Call:** Built-in WebRTC call inside the workspace.
- **Private Scorecard & Replay:** Host-only ratings, notes, and post-interview code replay.

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd synchire