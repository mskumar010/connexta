# EchoRoom Development Rules & Guidelines

This document outlines the coding standards, best practices, and rules to follow when developing EchoRoom across all platforms (Web, Server, Mobile).

---

## 📋 Table of Contents

1. [TypeScript Type Safety Rules](#typescript-type-safety-rules)
2. [Web Development Rules](#web-development-rules)
3. [Server Development Rules](#server-development-rules)
4. [Mobile Development Rules](#mobile-development-rules)
5. [General Best Practices](#general-best-practices)

---

## 🔒 TypeScript Type Safety Rules

### Core Principle
**Always prefer type safety over convenience. Use the most specific type possible.**

### `any` - The Last Resort

**❌ NEVER use `any` unless absolutely necessary**

**When to use `any`:**
- Only when integrating with JavaScript libraries that have no type definitions
- As a temporary workaround during development (must be fixed before merge)
- When dealing with truly dynamic code that cannot be typed

**Rules:**
1. **Always add a TODO comment** explaining why `any` is used
2. **Must be reviewed** before merging to main
3. **Prefer `unknown`** if you need to accept any value but want type safety

**Example:**
```typescript
// ❌ BAD
function processData(data: any) {
  return data.value;
}

// ✅ GOOD - Use unknown and type guard
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}

// ✅ ACCEPTABLE - With TODO (temporary)
// TODO: Replace with proper types when library types are available
function handleSocketError(error: any) {
  console.error(error?.message || 'Unknown error');
}
```

### `unknown` - The Safe Default

**✅ ALWAYS use `unknown` when type is uncertain**

**When to use `unknown`:**
- Handling external data (API responses, user input)
- Dynamic values from third-party libraries
- Values that need validation before use
- Event handlers where event type is uncertain

**Rules:**
1. **Must perform type narrowing** before using the value
2. **Use type guards** (typeof, instanceof, custom guards)
3. **Never access properties** without type checking

**Example:**
```typescript
// ✅ GOOD
function handleApiResponse(response: unknown) {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as { data: unknown }).data)
  ) {
    return (response as { data: User[] }).data;
  }
  throw new Error('Invalid API response');
}

// ✅ GOOD - Custom type guard
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    typeof (obj as { id: unknown }).id === 'string'
  );
}
```

### `never` - The Exhaustive Type

**✅ Use `never` for impossible states**

**When to use `never`:**
- Functions that always throw errors
- Functions that never return (infinite loops)
- Exhaustive type checking in switch/if statements
- Conditional types to eliminate union branches

**Rules:**
1. **Use in error handlers** that always throw
2. **Use in exhaustive checks** to catch unhandled cases
3. **Use in type narrowing** to ensure all cases are handled

**Example:**
```typescript
// ✅ GOOD - Function that never returns
function throwError(message: string): never {
  throw new Error(message);
}

// ✅ GOOD - Exhaustive type checking
type Status = 'loading' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return 'Done!';
    case 'error':
      return 'Failed!';
    default:
      // TypeScript error if Status type is extended without handling
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

### Type Safety Checklist

Before committing code, verify:
- [ ] No `any` types (unless documented with TODO)
- [ ] All `unknown` values are type-narrowed before use
- [ ] All functions have explicit return types
- [ ] All props/interfaces are properly typed
- [ ] No implicit `any` from missing types

---

## 🌐 Web Development Rules

### Tech Stack
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** - Styling
- **Redux Toolkit** - State management
- **React Router v7** - Routing
- **Socket.IO Client** - Real-time
- **Framer Motion** - Animations
- **React Virtuoso** - Virtualization
- **Lucide React** - Icons

### Component Rules

1. **Component Structure**
   ```typescript
   // ✅ GOOD - Proper component structure
   import type { ComponentProps } from 'react';
   import { memo } from 'react';
   
   interface ButtonProps extends ComponentProps<'button'> {
     variant?: 'primary' | 'secondary';
   }
   
   export const Button = memo(function Button({ 
     variant = 'primary', 
     ...props 
   }: ButtonProps) {
     // Component logic
   });
   ```

2. **Type-only Imports**
   ```typescript
   // ✅ GOOD - Type-only imports
   import type { User } from '../types';
   import type { PayloadAction } from '@reduxjs/toolkit';
   
   // ❌ BAD - Mixed imports
   import { User, getUser } from '../types';
   ```

3. **Redux Hooks**
   ```typescript
   // ✅ GOOD - Typed hooks
   import type { RootState, AppDispatch } from '../app/store';
   import { useDispatch, useSelector } from 'react-redux';
   
   const dispatch = useDispatch<AppDispatch>();
   const user = useSelector((state: RootState) => state.auth.user);
   ```

4. **Event Handlers**
   ```typescript
   // ✅ GOOD - Typed event handlers
   const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault();
     // Handler logic
   };
   
   // ❌ BAD - Untyped
   const handleClick = (e: any) => {
     // Handler logic
   };
   ```

### Styling Rules

1. **Tailwind Classes Only**
   - No inline styles
   - Use `cn()` utility for conditional classes
   - Follow design system tokens

2. **Dark Mode**
   - Use system dark mode tokens
   - No blue tints in dark mode
   - Apple-inspired neutral grays

3. **Animations**
   - Use Framer Motion for all animations
   - Keep animations subtle and performant
   - Respect `prefers-reduced-motion`

### Import Rules

1. **Use Path Aliases**
   - Use `@/` for all internal imports
   - Avoid relative paths like `../../` or `./`
   - Example: `import { Button } from '@/components/ui/Button'`

### File Organization

```
src/
├── features/        # Feature-based modules
├── components/      # Shared components
├── hooks/          # Custom hooks
├── lib/            # Utilities
├── types/          # TypeScript types
└── pages/          # Page components
```

### Naming Conventions

- **Components**: PascalCase (`MessageItem.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSocket.ts`)
- **Utilities**: camelCase (`formatTime.ts`)
- **Types**: PascalCase (`User`, `Message`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

---

## 🖥️ Server Development Rules

### Tech Stack
- **Node.js** + **Express** + **TypeScript**
- **Socket.IO** - WebSocket server
- **MongoDB** (Mongoose) - Database
- **JWT** - Authentication

### Type Safety Rules

1. **Request/Response Types**
   ```typescript
   // ✅ GOOD - Typed Express handlers
   interface CreateRoomRequest {
     name: string;
     description?: string;
   }
   
   app.post('/rooms', (req: Request<{}, {}, CreateRoomRequest>, res: Response) => {
     const { name, description } = req.body;
     // Handler logic
   });
   
   // ❌ BAD - Untyped
   app.post('/rooms', (req: any, res: any) => {
     // Handler logic
   });
   ```

2. **Database Models**
   ```typescript
   // ✅ GOOD - Typed Mongoose models
   interface IUser extends Document {
     email: string;
     displayName: string;
     passwordHash: string;
   }
   
   const User = model<IUser>('User', userSchema);
   ```

3. **Socket.IO Events**
   ```typescript
   // ✅ GOOD - Typed socket events
   interface SocketMessageSend {
     roomId: string;
     text: string;
     tempId: string;
   }
   
   socket.on('message:send', (data: SocketMessageSend) => {
     // Handler logic
   });
   ```

### Error Handling

```typescript
// ✅ GOOD - Typed error handling
try {
  // Operation
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Environment Variables

```typescript
// ✅ GOOD - Validate env vars
const PORT = process.env.PORT || '3000';
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}
```

### File Organization

```
server/src/
├── routes/         # Express routes
├── middleware/     # Express middleware
├── models/         # Mongoose models
├── services/       # Business logic
├── utils/          # Utilities
└── types/          # TypeScript types
```

---

## 📱 Mobile Development Rules

### Tech Stack (Future)
- **React Native CLI** (not Expo)
- **TypeScript**
- **React Navigation**
- **Redux Toolkit**
- **Socket.IO Client**
- **FlashList** - Virtualization

### Component Rules

1. **React Native Components**
   ```typescript
   // ✅ GOOD - Typed React Native components
   import type { ViewProps } from 'react-native';
   
   interface ButtonProps extends ViewProps {
     title: string;
     onPress: () => void;
   }
   
   export function Button({ title, onPress, ...props }: ButtonProps) {
     // Component logic
   }
   ```

2. **Navigation Types**
   ```typescript
   // ✅ GOOD - Typed navigation
   type RootStackParamList = {
     Home: undefined;
     ChatRoom: { roomId: string };
   };
   
   type ChatRoomScreenProps = StackScreenProps<RootStackParamList, 'ChatRoom'>;
   ```

### Platform-Specific Code

```typescript
// ✅ GOOD - Platform checks
import { Platform } from 'react-native';

const padding = Platform.OS === 'ios' ? 16 : 12;
```

### File Organization

```
mobile/src/
├── screens/        # Screen components
├── components/     # Shared components
├── navigation/     # Navigation config
├── hooks/         # Custom hooks
├── store/         # Redux store
└── types/         # TypeScript types
```

---

## 🎨 Design System Rules

### Dark Mode Guidelines

1. **No Blue Tints**
   - Use neutral grays (gray-50 to gray-950)
   - Avoid blue-tinted grays
   - Apple-inspired color palette

2. **Color Palette**
   ```css
   /* Backgrounds */
   bg-gray-950  /* Main background */
   bg-gray-900  /* Card/panel background */
   bg-gray-800  /* Hover states */
   
   /* Text */
   text-gray-100 /* Primary text */
   text-gray-300 /* Secondary text */
   text-gray-500 /* Tertiary text */
   
   /* Accents */
   indigo-600    /* Primary accent */
   green-500     /* Success/online */
   red-600        /* Error/danger */
   ```

3. **Contrast Ratios**
   - Minimum 4.5:1 for text
   - Minimum 3:1 for UI components
   - Test with accessibility tools

### Animation Rules

1. **Performance**
   - Use `transform` and `opacity` only
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change` sparingly

2. **Duration**
   - Micro-interactions: 150-200ms
   - Transitions: 200-300ms
   - Page transitions: 300-400ms

3. **Easing**
   - Default: `ease-out`
   - Entrances: `ease-out`
   - Exits: `ease-in`

---

## 📝 General Best Practices

### Code Quality

1. **ESLint Rules**
   - No `any` without TODO
   - No `console.log` in production code
   - No unused variables/imports
   - Consistent formatting

2. **Git Commit Messages**
   ```
   feat(web): add dark mode toggle
   fix(server): resolve socket connection issue
   refactor(chat): optimize message rendering
   ```

3. **Documentation**
   - JSDoc comments for public APIs
   - README updates for new features
   - Type definitions for all exports

### Performance

1. **React**
   - Use `memo()` for expensive components
   - Use `useMemo()` and `useCallback()` appropriately
   - Lazy load routes

2. **Bundle Size**
   - Tree-shake unused code
   - Code split by route
   - Optimize images/assets

### Security

1. **Never commit**
   - API keys
   - Secrets
   - `.env` files
   - Private keys

2. **Validate**
   - All user input
   - API responses
   - Environment variables

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] No `any` types (unless documented)
- [ ] All `unknown` values are type-narrowed
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] No console.logs in production code
- [ ] Components are properly typed
- [ ] Dark mode works correctly
- [ ] Animations are performant
- [ ] Code follows file organization rules
- [ ] Git commit message follows convention

---

## 🚨 Breaking These Rules

If you must break a rule:

1. **Document why** in a comment
2. **Add a TODO** to fix it later
3. **Get code review approval**
4. **Create an issue** to track the fix

---

**Last Updated:** Phase 2 Complete
**Maintained By:** Development Team

