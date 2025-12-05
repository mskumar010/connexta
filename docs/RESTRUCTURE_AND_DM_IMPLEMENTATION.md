# Restructure and DM Implementation Documentation

This document outlines the phased approach taken to restructure the application from a room-centric model (EchoRoom) to a Direct Message-centric model (Connexta), similar to WhatsApp.

## Phase 1: Backend Architecture

The foundation of the restructure involved updating the data models and API endpoints to support direct conversations.

### 1.1 Data Models

- **Conversation Model (`Conversation`)**: Created to manage both Direct Messages (DMs) and Rooms.
  - Fields: `participants`, `lastMessage`, `lastMessageAt`, `type` ('dm' | 'room'), `roomId` (optional).
- **User Model Updates**: Added `conversations` array to track active conversations for each user.
- **Message Model Updates**: Added `conversationId` to link messages to specific conversations. Made `roomId` optional.

### 1.2 API Routes

- **`GET /conversations`**: Endpoint to retrieve the list of conversations for the authenticated user.
- **`POST /conversations`**: Endpoint to create a new DM conversation or retrieve an existing one.
- **`GET /conversations/:id`**: Endpoint to fetch details of a specific conversation.

### 1.3 Real-time Events (Socket.IO)

- **`conversation:create`**: Emitted when a new conversation is started.
- **`message:dm`**: Handles sending and receiving direct messages.
- **`conversation:typing`**: Manages typing indicators within a specific conversation.

## Phase 2: Frontend Implementation

The frontend was overhauled to prioritize the conversation list and provide a seamless messaging experience.

### 2.1 State Management (Redux)

- **`conversationsSlice`**: Manages the state of the conversation list, active conversation, and unread counts.
- **`contactsSlice`**: Manages the state of user contacts (for the "New Chat" feature).

### 2.2 Components

- **`ConversationList`**: The primary navigation component in the sidebar, displaying a list of active chats with previews.
- **`NewChatModal`**: A modal interface for searching users and initiating new direct messages.
- **`ConversationPage`**: The main chat view for DMs, displaying the message history and input area.
- **`RoomsPage`**: A new "Discover" page for browsing and joining public rooms, moving them away from the primary sidebar view.

### 2.3 Routing

- **`/`**: Defaults to the Conversation List (Home).
- **`/chat/:conversationId`**: Route for individual DM threads.
- **`/rooms`**: Route for the Room Discovery page.
- **`/room/:roomId`**: Route for specific Room chats.

### 2.4 Sidebar Refactor

- Updated the `Sidebar` to display `ConversationList` by default.
- Added a "New Chat" button for quick access.
- Moved Room access to a "Discover Rooms" link at the bottom of the list.

## Phase 3: Rebranding (EchoRoom -> Connexta)

The final phase involved updating the application identity to reflect the new direction.

### 3.1 UI Updates

- Replaced all visible instances of "EchoRoom" with "Connexta" in:
  - Login and Register pages.
  - Home page welcome message.
  - Sidebar header.
  - Onboarding/Welcome room messages.

### 3.2 Configuration

- Updated the MongoDB database name to `connexta`.
- Updated `package.json` metadata in both server and client projects.

## Future Considerations

- **Data Migration**: Existing messages in Rooms are preserved, but a migration strategy may be needed if the data structure evolves further.
- **Room Features**: Rooms are now secondary. Future updates might add features specific to DMs (e.g., read receipts, media sharing) that might not apply to Rooms.
