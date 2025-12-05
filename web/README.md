# EchoRoom Web

React frontend for EchoRoom - a real-time chat application with Discord-style rooms.

> 📚 **Documentation:** See [`docs/`](./docs/) folder for detailed documentation.

## 🚀 Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** - Modern utility-first styling
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Smooth animations
- **React Virtuoso** - Virtualized message lists
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **clsx** + **tailwind-merge** - Utility helpers

## 📁 Project Structure

```
web/src/
├── api/              # RTK Query API slices
│   ├── authApi.ts
│   ├── roomsApi.ts
│   └── messagesApi.ts
├── app/              # Redux store configuration
│   ├── store.ts
│   └── rootReducer.ts
├── features/         # Feature-based modules
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── rooms/
│   │   ├── roomsSlice.ts
│   │   └── useRooms.ts
│   ├── chat/
│   │   ├── chatSlice.ts
│   │   ├── ChatRoomPage.tsx
│   │   └── components/
│   │       ├── MessageList.tsx
│   │       ├── MessageInput.tsx
│   │       ├── MessageItem.tsx
│   │       └── TypingIndicator.tsx
│   ├── connection/
│   │   └── connectionSlice.ts
│   └── onboarding/
│       ├── onboardingSlice.ts
│       └── WelcomeRoom.tsx
├── components/       # Shared UI components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── Skeleton.tsx
│   │   └── Toast.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Sidebar.tsx
│       └── RoomHeader.tsx
├── hooks/            # Custom React hooks
│   ├── useSocket.ts
│   ├── useRoomSocket.ts
│   ├── useAuth.ts
│   └── useWelcomeSequence.ts
├── lib/              # Utilities and helpers
│   ├── socket.ts
│   ├── theme.ts
│   └── utils.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── styles/           # Global styles
│   └── globals.css
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── router.tsx        # React Router configuration
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 UI/UX Guidelines

### Design System

- **Theme**: Dark mode by default (Discord-inspired)
- **Colors**: Gray scale (950-100) with accent colors
- **Spacing**: Consistent scale (gap-2, gap-4, p-4, etc.)
- **Typography**: System fonts with proper line heights
- **Border Radius**: `rounded-2xl` for cards, `rounded-lg` for buttons

### Animations (Framer Motion)

- **Page transitions**: Fade + slight upward motion
- **Room switch**: Old messages fade out, skeleton shimmer for new
- **Message entry**: Subtle upward + opacity animation
- **Typing indicator**: Pulsing dots
- **Buttons**: Scale + shadow on hover/active
- **Toasts**: Slide in from top-right, auto-dismiss

### Performance

- **Message list**: Virtualized with React Virtuoso
- **Memoization**: Memoize MessageItem components
- **Code splitting**: Route-based lazy loading
- **Socket events**: Batch dispatch to Redux

## 📦 Key Dependencies

### Core
- `react@^19.2.0` - React library
- `react-dom@^19.2.0` - React DOM
- `typescript@~5.9.3` - TypeScript

### State & Routing
- `@reduxjs/toolkit@^2.11.0` - Redux Toolkit
- `react-redux@^9.2.0` - React Redux bindings
- `react-router-dom@^7.10.0` - React Router

### Real-time
- `socket.io-client@^4.8.1` - Socket.IO client

### UI & Animations
- `framer-motion@^12.23.25` - Animation library
- `lucide-react@^0.555.0` - Icon library
- `react-virtuoso@^4.16.1` - Virtualized lists
- `sonner@^2.0.7` - Toast notifications

### Utilities
- `clsx@^2.1.1` - Class name utility
- `tailwind-merge@^3.4.0` - Tailwind class merging

## 🔧 Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 🏗️ Architecture

### State Management

- **Redux Toolkit** for global state
- **RTK Query** for REST API calls
- **Socket.IO** for real-time events (separate from Redux)
- **Feature-based slices** (auth, rooms, chat, connection)

### Routing

- **React Router v7** with protected routes
- **Lazy loading** for code splitting
- **Route-based authentication** checks

### Socket.IO Integration

- **Dedicated hook** (`useSocket`) for connection management
- **Room-specific hooks** (`useRoomSocket`) for room events
- **Connection state** tracked in Redux (`connectionSlice`)

## 🚢 Deployment

### Vercel

1. Connect GitHub repository
2. Set build directory to `web`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy

### Environment Variables (Production)

```env
VITE_API_URL=https://your-backend.render.com
VITE_SOCKET_URL=https://your-backend.render.com
```

## 📝 Development Phases

### Phase 0 - Setup ✅
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS v4 configuration
- [x] All dependencies installed
- [x] Basic folder structure

### Phase 1 - Core UI (Current)
- [ ] Redux store setup
- [ ] React Router configuration
- [ ] Main layout (Sidebar + Chat area)
- [ ] Basic components (Button, Input, Avatar)
- [ ] Auth pages (Login/Register)
- [ ] Protected routes

### Phase 2 - Real-time Chat
- [ ] Socket.IO connection
- [ ] Message list with virtualization
- [ ] Message input component
- [ ] Typing indicators
- [ ] Online user presence

### Phase 3 - Multi-Room
- [ ] Room list in sidebar
- [ ] Room switching
- [ ] Room-scoped messages
- [ ] Join/leave room functionality

### Phase 4 - Polish
- [ ] Animations (Framer Motion)
- [ ] Skeleton loaders
- [ ] Toast notifications
- [ ] Message actions (reply, copy)
- [ ] Connection state recovery UI

## 🐛 Troubleshooting

### Tailwind classes not working
- Ensure `@import 'tailwindcss'` is in `index.css`
- Check that `@tailwindcss/vite` plugin is in `vite.config.ts`

### Socket.IO connection issues
- Verify `VITE_SOCKET_URL` is set correctly
- Check CORS configuration on server
- Ensure server is running

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## 📚 Resources

- [Vite Documentation](https://vite.dev)
- [React Router v7](https://reactrouter.com)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Socket.IO Client](https://socket.io/docs/v4/client-api)

---

**Built with ❤️ for EchoRoom**
