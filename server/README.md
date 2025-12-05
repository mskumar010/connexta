# Connexta Server

Backend server for Connexta chat application.

> 📚 **Documentation:** See [`docs/`](./docs/) folder for detailed documentation.

## 🚀 Tech Stack

- **Node.js** + **Express** - REST API
- **Socket.IO** - WebSocket server for real-time communication
- **TypeScript** - Type safety
- **MongoDB** - Database (via Mongoose, to be added)

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update `.env` with your configuration:

- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

## 🏃 Development

```bash
# Start dev server with hot reload (tsx watch)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

**Note:** Uses `tsx watch` instead of nodemon for faster TypeScript execution.

## 📡 Socket.IO Events

### Client → Server

- `auth:identify` - Authenticate with JWT
- `room:join` - Join a room
- `room:leave` - Leave a room
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server → Client

- `auth:ok` - Authentication successful
- `auth:error` - Authentication failed
- `room:joined` - Successfully joined room
- `room:left` - Successfully left room
- `message:new` - New message received
- `message:ack` - Message acknowledged
- `typing:update` - Typing indicator update

## 🏗️ Project Structure

```
server/
├── src/
│   ├── index.ts          # Main server file
│   ├── routes/           # Express routes (to be added)
│   ├── middleware/       # Express middleware (to be added)
│   ├── models/           # Database models (to be added)
│   ├── services/         # Business logic (to be added)
│   └── utils/            # Utility functions (to be added)
├── dist/                 # Compiled JavaScript
├── .env                  # Environment variables (gitignored)
├── .env.example          # Example environment variables
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 🔐 Authentication

JWT-based authentication with access and refresh tokens.

## 📝 API Endpoints (To be implemented)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get room details
- `GET /rooms/:id/messages` - Get room messages
- `POST /rooms` - Create new room

## 🚢 Deployment

The server is designed to be deployed on **Render** or similar platforms.

1. Set environment variables in your hosting platform
2. Build: `npm run build`
3. Start: `npm start`
