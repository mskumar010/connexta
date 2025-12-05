# Connection State Recovery Strategy

## Overview

EchoRoom uses a **hybrid approach** for connection state recovery that combines:
- **MongoDB** (server-side) - Persistent event sequence storage
- **Redux** (client-side) - In-memory state with localStorage backup
- **Socket.IO** - Built-in reconnection + custom recovery

## ❌ Why NOT SQLite?

SQLite is **not needed** for connection state recovery because:

1. **We already have MongoDB** - No need for another database
2. **Client-side state is ephemeral** - Redux + localStorage is sufficient
3. **Socket.IO handles reconnection** - We just need to track sequence numbers
4. **Simpler architecture** - One database (MongoDB) for everything

## ✅ Recommended Approach

### Server-Side (MongoDB)

**Store sequence numbers in MongoDB:**

```typescript
// Message Schema
Message {
  _id: ObjectId
  roomId: string
  senderId: string
  text: string
  createdAt: Date
  seq: number  // ← Monotonically increasing per room
}
```

**How it works:**
1. Each message gets a `seq` number (incrementing counter per room)
2. Server maintains `lastSeq` per room in memory or Redis (optional)
3. On reconnect, client sends `lastSeenSeq`
4. Server queries: `Message.find({ roomId, seq: { $gt: lastSeenSeq } })`
5. Server sends missed messages via `connection:missed` event

### Client-Side (Redux + localStorage)

**Store in Redux slice:**

```typescript
// connectionSlice.ts
interface ConnectionState {
  status: 'connected' | 'reconnecting' | 'disconnected'
  lastSeenSeq: number  // ← Per room or global
  lastEventId: string  // ← For Socket.IO recovery
  rooms: {
    [roomId: string]: {
      lastSeenSeq: number
    }
  }
}
```

**Persistence strategy:**
1. **In-memory (Redux)** - Fast access during session
2. **localStorage backup** - Persist `lastSeenSeq` per room
3. **On reconnect** - Restore from localStorage, send to server

### Socket.IO Recovery

**Option 1: Built-in Recovery (Recommended)**
```typescript
// Server
const io = new Server(httpServer, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Client automatically handles recovery
```

**Option 2: Custom Recovery (More Control)**
```typescript
// Client sends on reconnect
socket.emit('connection:recover', {
  lastEventId: connectionState.lastEventId,
  lastSeenSeq: connectionState.lastSeenSeq,
  rooms: Object.keys(connectionState.rooms),
});

// Server responds
socket.on('connection:recover', async (data) => {
  const { lastSeenSeq, rooms } = data;
  
  for (const roomId of rooms) {
    const missed = await Message.find({
      roomId,
      seq: { $gt: lastSeenSeq },
    }).sort({ seq: 1 });
    
    socket.emit('connection:missed', {
      roomId,
      messages: missed,
      fromSeq: lastSeenSeq,
      toSeq: missed[missed.length - 1]?.seq,
    });
  }
});
```

## Implementation Flow

### 1. Normal Operation

```
Client → Server: message:send { roomId, text, clientLastSeq }
Server: Save to MongoDB with seq++
Server → Room: message:new { message, seq }
Client: Update lastSeenSeq in Redux + localStorage
```

### 2. Disconnection

```
Client detects disconnect
→ Update Redux: status = 'reconnecting'
→ Save lastSeenSeq to localStorage
→ Socket.IO auto-reconnects
```

### 3. Reconnection

```
Socket.IO reconnects
→ Client sends: connection:recover { lastSeenSeq, rooms }
→ Server queries missed messages
→ Server sends: connection:missed { messages, fromSeq, toSeq }
→ Client merges into Redux
→ Update UI: "Synced X missed messages"
```

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Redux)    │──lastSeenSeq──┐
└─────────────┘                │
       │                       │
       │ message:send          │
       ▼                       │
┌─────────────┐                │
│  Socket.IO  │                │
└─────────────┘                │
       │                       │
       │ Broadcast             │
       ▼                       │
┌─────────────┐                │
│   Server    │                │
│  (Express)  │                │
└─────────────┘                │
       │                       │
       │ Save with seq++       │
       ▼                       │
┌─────────────┐                │
│  MongoDB    │◄───────────────┘
│  Messages   │
│  seq: 1,2,3 │
└─────────────┘
```

## Storage Requirements

### Server (MongoDB)
- **Messages collection** - `seq` field (indexed)
- **Optional: Redis** - For `lastSeq` cache (if scaling)

### Client (Browser)
- **Redux** - In-memory state (~10-50KB)
- **localStorage** - `lastSeenSeq` per room (~1KB)
- **No SQLite needed** - localStorage is sufficient

## Performance Considerations

1. **Index `seq` field** in MongoDB for fast queries
2. **Limit missed messages** (e.g., max 100 messages)
3. **Batch recovery** - Send all missed messages in one event
4. **Optimistic UI** - Show messages immediately, sync in background

## Example Implementation

### Server (MongoDB Query)
```typescript
async function getMissedMessages(roomId: string, lastSeenSeq: number) {
  return await Message.find({
    roomId,
    seq: { $gt: lastSeenSeq },
  })
    .sort({ seq: 1 })
    .limit(100) // Prevent huge payloads
    .populate('senderId', 'displayName avatarUrl');
}
```

### Client (Redux Action)
```typescript
// On reconnect
dispatch(connectionSlice.actions.setStatus('reconnecting'));

// On recovery
socket.on('connection:missed', (data) => {
  dispatch(chatSlice.actions.addMissedMessages(data.messages));
  dispatch(connectionSlice.actions.updateLastSeenSeq({
    roomId: data.roomId,
    seq: data.toSeq,
  }));
  // Persist to localStorage
  localStorage.setItem(`lastSeq:${data.roomId}`, data.toSeq);
});
```

## Summary

✅ **Use MongoDB** for persistent message storage with `seq` numbers  
✅ **Use Redux** for in-memory client state  
✅ **Use localStorage** for persistence across sessions  
✅ **Use Socket.IO** built-in recovery + custom seq-based recovery  
❌ **Don't use SQLite** - Not needed, adds complexity

This approach is:
- **Simple** - One database (MongoDB)
- **Scalable** - Can add Redis later if needed
- **Reliable** - Multiple layers of recovery
- **Performant** - Indexed queries, batched recovery

