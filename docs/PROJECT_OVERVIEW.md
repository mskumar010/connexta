# Connexta Project Overview

## 🚀 Project Identity

**Connexta** is a full-stack, real-time messaging application designed to deliver a premium, WhatsApp-like experience with a focus on Direct Messages (DMs) and modern aesthetics. It is built to showcase advanced full-stack development capabilities, featuring real-time communication, robust authentication, and a polished user interface.

**Tagline:** Connect instantly, chat simply.

---

## 🎯 Feature Specification

### Core Features (Implemented - Phase 0-3)

- **Authentication & Security**:
  - Secure Email/Password Login & Registration.
  - JWT-based authentication with Access and Refresh tokens.
  - Automatic token rotation for seamless sessions.
  - Protected routes and API endpoints.
- **Real-Time Communication**:
  - Instant messaging via Socket.IO.
  - Live typing indicators.
  - Real-time connection state management (Online/Offline/Reconnecting).
  - Automatic recovery of missed messages upon reconnection.
- **User Interface**:
  - **WhatsApp-Style Layout**: Sidebar for conversation list, main chat area for DMs.
  - **Premium Aesthetics**: "Apple-inspired" dark mode using neutral grays (no blue tints).
  - **Optimistic UI**: Immediate feedback for user actions before server confirmation.
  - **Threaded Messaging**: Reply to messages in threads.
  - **Toast Notifications**: Non-intrusive alerts for success and error states.
  - **Direct Messages**: Primary focus on 1-1 conversations.
  - **Room Discovery**: Browse and join public chat rooms via a dedicated "Discover" section.

### Planned Features (Phase 4 & Future)

- **Mobile Application**: Native mobile experience using React Native CLI (Non-Expo).
- **Advanced Media**: Voice and Video chat capabilities.
- **Rich Content**: File sharing, image previews, and link unfurling.
- **Social Features**: User profiles, status updates, and friend systems.
- **Room Administration**: Create, edit, and delete rooms with permission controls.

---

## 🛠️ Technical Architecture

### Frontend (Web)

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Utility-first, performant)
- **State Management**: Redux Toolkit (Global state), RTK Query (Data fetching)
- **Routing**: React Router v7
- **Real-Time**: Socket.IO Client
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Virtualization**: React Virtuoso (For efficient message lists)

### Backend (Server)

- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: MongoDB (Atlas) with Mongoose ODM
- **Real-Time**: Socket.IO Server
- **Authentication**: JSON Web Tokens (JWT)

### Mobile (Future)

- **Framework**: React Native CLI
- **Navigation**: React Navigation
- **State**: Redux Toolkit (Shared logic with web)

---

## 🎨 Design System

**Philosophy**: The design prioritizes a "premium" feel, avoiding generic Bootstrap-like aesthetics. It leans heavily on modern, flat design principles with subtle depth.

- **Color Palette**: Strictly neutral grays for dark mode (`gray-950` background, `gray-900` panels). **Rule:** No blue-tinted grays (e.g., `slate`, `zinc`) are used to maintain the "Apple-like" clean look.
- **Typography**: Clean sans-serif fonts (Inter/System defaults).
- **Motion**: Subtle, purposeful animations using Framer Motion (150-300ms duration).
- **Spacing**: Consistent 4px grid system (Tailwind defaults).

---

## 📏 Development Standards

### Type Safety

- **Strict TypeScript**: The codebase enforces a "No `any`" policy.
- **Unknown**: `unknown` is preferred for uncertain types, requiring explicit type narrowing before use.
- **Explicit Returns**: All functions must have explicit return types.

### Code Quality

- **Linting**: ESLint is configured to catch potential issues and enforce style.
- **File Structure**: Feature-based architecture (`features/`, `components/`, `hooks/`) to keep related code together.
- **Path Aliases**: All internal imports use `@/` (e.g., `@/components/Button`) for cleanliness and refactoring ease.

### Best Practices

- **Performance**: Use `memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders.
- **Security**: Never commit secrets. Validate all inputs.
- **Git**: Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`) are encouraged.

---

## 📚 Documentation Index

- **[README.md](../README.md)**: Quick start guide and project summary.
- **[DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)**: Detailed coding standards and rules.
- **[STATUS.md](./STATUS.md)**: Current project progress and roadmap.
- **[SETUP.md](./SETUP.md)**: Environment setup and dependency list.
