# 🔐 Secure Code Vault

A full-stack encrypted code snippet and file storage platform. All data is encrypted with **AES-256-CBC** before touching the database — the server never stores plaintext.

---

## 📁 Folder Structure

```
secure-code-vault/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Signup, login, verify password
│   │   ├── snippetController.js    # CRUD + encrypt/decrypt
│   │   └── fileController.js       # Upload, download, delete files
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   ├── models/
│   │   ├── User.js                 # User schema (bcrypt password)
│   │   ├── Snippet.js              # Encrypted snippet schema
│   │   └── File.js                 # Encrypted file metadata
│   ├── routes/
│   │   ├── auth.js                 # POST /signup /login /verify-password
│   │   ├── snippets.js             # GET/POST/PUT/DELETE /snippets
│   │   └── files.js                # POST /upload  GET /  GET /:id/download
│   ├── utils/
│   │   └── encryption.js           # AES-256-CBC encrypt/decrypt (text + buffer)
│   ├── uploads/                    # Encrypted files on disk (auto-created)
│   ├── server.js                   # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js           # Sidebar + topbar shell
    │   │   ├── LockScreen.js       # Inactivity lock screen
    │   │   └── PasswordConfirmModal.js  # Re-auth before reveal
    │   ├── context/
    │   │   └── AuthContext.js      # JWT state + auto-lock timer
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js        # Stats + recent activity
    │   │   ├── Snippets.js         # Full CRUD + Monaco editor + reveal
    │   │   ├── FileManager.js      # Upload/download/delete + list/grid view
    │   │   └── Settings.js
    │   ├── utils/
    │   │   ├── api.js              # Axios instance with JWT interceptor
    │   │   └── languages.js        # Language config + Monaco mapping
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

---

### 1. Backend Setup

```bash
cd secure-code-vault/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/secure-code-vault
JWT_SECRET=change_this_to_a_random_64_char_string_for_production
JWT_EXPIRE=7d
ENCRYPTION_KEY=change_this_to_any_string_used_to_derive_aes_key
MAX_FILE_SIZE=10485760
NODE_ENV=development
```

```bash
# Start backend
npm run dev   # or: npm start
```

The backend will start on **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd secure-code-vault/frontend

# Install dependencies
npm install

# Start frontend (proxies /api → localhost:5000)
npm start
```

The frontend will start on **http://localhost:3000**

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Route              | Auth | Description              |
|--------|--------------------|------|--------------------------|
| POST   | `/signup`          | No   | Create account           |
| POST   | `/login`           | No   | Login, receive JWT       |
| GET    | `/me`              | Yes  | Get current user         |
| POST   | `/verify-password` | Yes  | Re-authenticate (reveal) |

### Snippets — `/api/snippets`
| Method | Route        | Auth | Description                    |
|--------|--------------|------|--------------------------------|
| GET    | `/`          | Yes  | List snippets (search, filter) |
| GET    | `/stats`     | Yes  | Dashboard statistics           |
| GET    | `/:id`       | Yes  | Decrypt & return snippet       |
| POST   | `/`          | Yes  | Encrypt & create snippet       |
| PUT    | `/:id`       | Yes  | Update & re-encrypt snippet    |
| DELETE | `/:id`       | Yes  | Delete snippet                 |

### Files — `/api/files`
| Method | Route              | Auth | Description                 |
|--------|--------------------|------|-----------------------------|
| POST   | `/upload`          | Yes  | Encrypt & upload file        |
| GET    | `/`                | Yes  | List file metadata           |
| GET    | `/:id/download`    | Yes  | Decrypt & stream file        |
| DELETE | `/:id`             | Yes  | Delete encrypted file        |

---

## 🔐 Security Architecture

```
User submits code
        ↓
  Express validates input
        ↓
  AES-256-CBC encrypt (unique IV per item)
        ↓
  Store ciphertext + IV in MongoDB
        ↓
  User requests view → Password re-confirm
        ↓
  Fetch from DB → decrypt with server key → return plaintext
        ↓
  Plaintext never persisted anywhere
```

Key security properties:
- **Passwords**: bcrypt with 12 salt rounds — never stored in plaintext
- **JWTs**: Short-lived (7d), verified on every request
- **Encryption key**: Derived via SHA-256 from `ENCRYPTION_KEY` env var — never in code
- **IVs**: Random 16 bytes per encryption — prevents identical ciphertexts
- **Rate limiting**: 10 auth attempts / 15 min, 100 API calls / 15 min
- **Hidden view**: Code blurred by default; requires password re-entry to reveal
- **Auto-lock**: Vault locks after 5 minutes of inactivity

---

## 🎯 Feature Checklist

- [x] JWT authentication (signup / login)
- [x] bcrypt password hashing (12 rounds)
- [x] AES-256-CBC encryption for snippets
- [x] AES-256-CBC encryption for uploaded files (buffer-level)
- [x] Hidden view mode with password re-confirmation
- [x] Monaco Editor with syntax highlighting
- [x] Search by title + filter by language
- [x] File upload (multer) + encrypted disk storage
- [x] Secure file download (decrypt on the fly)
- [x] Auto-lock after 5 min inactivity
- [x] List/Grid toggle for file manager
- [x] Dark mode UI (vault aesthetic)
- [x] Copy-to-clipboard
- [x] Toast notifications
- [x] Rate limiting + Helmet security headers
- [x] Input validation (express-validator)
- [x] File type and size restrictions

---

## 📦 Production Deployment Notes

1. Set `NODE_ENV=production`
2. Use a strong random `JWT_SECRET` (64+ chars)
3. Use a strong `ENCRYPTION_KEY` — **never change this after data is stored** (all data becomes unreadable)
4. Use MongoDB Atlas or a secured MongoDB instance
5. Add HTTPS (nginx/Caddy reverse proxy)
6. Set `CLIENT_URL` to your production frontend domain
7. Run `npm run build` in frontend, serve with nginx or `serve`
