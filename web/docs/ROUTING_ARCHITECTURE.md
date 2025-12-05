# Routing Architecture

## Current Setup

### Main Router File: `web/src/router.tsx`

**This is the SINGLE file that contains ALL routing configuration.**

```tsx
// router.tsx - ALL routes defined here
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'room/:roomId', element: <ChatRoomPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);
```

## File Structure

```
web/src/
├── router.tsx          ← MAIN ROUTER FILE (all routes here)
├── App.tsx            ← Just imports AppRouter
├── pages/             ← Page components (not routes)
│   ├── HomePage.tsx
│   ├── ChatRoomPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
└── components/
    └── layout/
        └── AppLayout.tsx  ← Uses <Outlet /> for nested routes
```

## How It Works

1. **router.tsx** - Defines ALL routes in one place
2. **App.tsx** - Just renders `<AppRouter />`
3. **pages/** - Contains page components (not route definitions)
4. **AppLayout** - Uses `<Outlet />` to render child routes

## Current Route Structure

```tsx
// router.tsx
const router = createBrowserRouter([
  // Layout route (has sidebar)
  {
    path: '/',
    element: <AppLayout />,  // Sidebar + <Outlet />
    children: [
      { index: true, element: <HomePage /> },        // /
      { path: 'room/:roomId', element: <ChatRoomPage /> },  // /room/general
    ],
  },
  // Standalone routes (no layout)
  { path: '/login', element: <LoginPage /> },       // /login
  { path: '/register', element: <RegisterPage /> },  // /register
]);
```

## Should We Split Routes?

### Option 1: Keep Everything in `router.tsx` ✅ (Current - Recommended)

**Pros:**
- ✅ Single source of truth
- ✅ Easy to see all routes at once
- ✅ Simple to maintain
- ✅ Good for small-medium apps

**Cons:**
- ⚠️ Can get long with many routes
- ⚠️ All routes in one file

**Best for:** Current project size (4-10 routes)

### Option 2: Split into Multiple Route Files

**Structure:**
```
web/src/
├── router.tsx          ← Main router (imports route configs)
├── routes/
│   ├── index.ts        ← Combines all routes
│   ├── authRoutes.ts  ← Login, Register
│   ├── appRoutes.ts   ← Home, Chat rooms
│   └── protectedRoutes.ts ← Protected routes
```

**Pros:**
- ✅ Better organization for large apps
- ✅ Routes grouped by feature
- ✅ Easier to find specific routes

**Cons:**
- ⚠️ More files to manage
- ⚠️ Need to import/combine routes
- ⚠️ Overkill for small apps

**Best for:** Large apps (20+ routes)

## Recommendation

**Keep current structure (Option 1)** because:
1. We only have 4 routes currently
2. Single file is easier to maintain
3. Can always refactor later if needed
4. React Router v7 works great with single router file

## When to Split Routes

Consider splitting when:
- You have 15+ routes
- Routes are organized by features (auth, admin, user)
- Multiple developers working on different route sections
- You need route guards/middleware per section

## Current Route Definitions

| Route | Path | Component | Layout |
|-------|------|-----------|--------|
| Home | `/` | `HomePage` | ✅ AppLayout |
| Chat Room | `/room/:roomId` | `ChatRoomPage` | ✅ AppLayout |
| Login | `/login` | `LoginPage` | ❌ None |
| Register | `/register` | `RegisterPage` | ❌ None |

## Summary

**Main Router File:** `web/src/router.tsx`
- Contains ALL route definitions
- Uses `createBrowserRouter`
- Exports `AppRouter` component

**App.tsx:** Just renders the router
```tsx
function App() {
  return <AppRouter />;
}
```

**Pages:** Components, not route definitions
- `pages/HomePage.tsx` - Component
- `pages/ChatRoomPage.tsx` - Component
- Imported in `router.tsx`

---

**Current approach is perfect for this project size!**

