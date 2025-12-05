# Connexta

A full-stack, real-time chat application with Discord-style rooms, built with modern web technologies.

## 🚀 Tech Stack

### Frontend (Web)

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** - Modern utility-first styling
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Smooth animations
- **React Virtuoso** - Virtualized message lists
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend (Server)

- **Node.js** + **Express** + **TypeScript**
- **Socket.IO** - WebSocket server
- **MongoDB** (Atlas) - Database
- **JWT** - Authentication (access + refresh tokens)

### Mobile (Future)

- **React Native CLI** (not Expo)
- **React Navigation**
- **FlashList** - Virtualized lists

## 📁 Project Structure

```
connexta/
├── web/              # React frontend (Vercel)
├── server/           # Node.js backend (Render)
├── mobile/           # React Native app (future)
├── .gitignore        # Monorepo gitignore
└── README.md         # This file
```

## 🎯 Features

### Phase 0 - Core (Current)

- ✅ User authentication (email/password)
- ✅ JWT with refresh tokens
- ✅ Single room chat
- ✅ Real-time messaging via Socket.IO

### Phase 1 - Multi-Room

- [ ] Discord-style sidebar with rooms
- [ ] Join/leave rooms
- [ ] Room-scoped messages
- [ ] Typing indicators
- [ ] Online user presence

### Phase 2 - Polish

- [ ] Message virtualization
- [ ] Smooth transitions & animations
- [ ] Skeleton loaders
- [ ] Toast notifications
- [ ] Message actions (reply, copy)

### Phase 3 - Reliability

- [ ] Connection state recovery
- [ ] Missed message sync
- [ ] Optimistic UI updates
- [ ] Reconnection handling

### Phase 4 - Mobile

- [ ] React Native client
- [ ] Shared auth & socket logic
- [ ] Optimized mobile UI

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (for production)

### Getting Started

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd echo-room
```

#### 2. Install dependencies

**Web:**

```bash
cd web
npm install
npm run dev
```

**Server:**

```bash
cd server
npm install
npm run dev
```

#### 3. Environment Variables

**Web** (`web/.env.local`):

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

**Server** (`server/.env`):

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/echoroom
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
```

## 📦 Scripts

### Web

- `npm run dev` - Start dev server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start dev server (node --watch)
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Frontend

- **Redux Toolkit** for global state
- **RTK Query** for REST API calls
- **Socket.IO** for real-time events
- **React Router** for navigation
- **Feature-based** folder structure

### Backend

- **Express** REST API
- **Socket.IO** WebSocket server
- **MongoDB** with Mongoose
- **JWT** authentication middleware
- **Modular** route structure

## 🚢 Deployment

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set build directory to `web`
3. Add environment variables
4. Deploy

### Backend (Render)

1. Create new Web Service
2. Connect GitHub repo
3. Set root directory to `server`
4. Add environment variables
5. Deploy

## 📝 License

MIT

## 👥 Contributing

This is a personal showcase project. Contributions welcome!

---

**Built with ❤️ for showcasing modern full-stack development**

# connexta
