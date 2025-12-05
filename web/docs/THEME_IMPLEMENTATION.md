# Theme Implementation - Apple-Inspired Dark Mode

## Overview

EchoRoom now features a proper dark mode toggle with Apple-inspired design principles:
- **No blue tints** - Pure neutral grays
- **High contrast** - Excellent readability
- **Smooth transitions** - 150ms ease transitions
- **System preference** - Respects OS theme

## Implementation

### Theme Context

**File:** `web/src/contexts/ThemeContext.tsx`

- Manages theme state (light/dark/system)
- Persists to localStorage
- Listens to system preference changes
- Provides `useTheme()` hook

### Theme Toggle Component

**File:** `web/src/components/common/ThemeToggle.tsx`

Two variants:
1. **Full Toggle** - Shows Light/Dark/System options
2. **Compact Toggle** - Single button (used in sidebar)

### Color Palette

**File:** `web/src/lib/theme.ts`

Apple-inspired neutral grays:
- `gray-950` - Main background (#0a0a0a)
- `gray-900` - Secondary background (#171717)
- `gray-800` - Tertiary/hover (#262626)
- `gray-100` - Primary text (#fafafa)
- `gray-300` - Secondary text (#d4d4d4)
- `gray-500` - Tertiary text (#737373)

**No blue tints** - Pure neutral grays only

## Usage

### In Components

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, actualTheme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {actualTheme}
    </button>
  );
}
```

### Theme Toggle in Sidebar

The compact toggle is already integrated in the sidebar footer.

### Adding Theme Toggle to Other Locations

```tsx
import { ThemeToggle } from '../components/common/ThemeToggle';
// or
import { ThemeToggleCompact } from '../components/common/ThemeToggle';
```

## Design Principles

1. **Neutral Grays Only**
   - No blue-tinted grays
   - Warm, neutral palette
   - Apple-inspired

2. **High Contrast**
   - Text: gray-100 on gray-950
   - Minimum 4.5:1 ratio
   - Accessible by default

3. **Smooth Transitions**
   - 150ms ease transitions
   - All color changes animated
   - No jarring switches

4. **System Preference**
   - Respects OS theme
   - Auto-switches with system
   - Manual override available

## Testing

### Manual Testing

1. **Toggle Theme**
   - Click theme toggle in sidebar
   - Verify smooth transition
   - Check localStorage persistence

2. **System Preference**
   - Set theme to "System"
   - Change OS theme
   - Verify auto-switch

3. **Persistence**
   - Set theme to dark
   - Refresh page
   - Verify theme persists

## Future Enhancements

- [ ] Light mode color palette
- [ ] Custom accent colors
- [ ] Theme-specific component variants
- [ ] Reduced motion support

---

**Status:** ✅ Implemented
**Last Updated:** Phase 2 Complete

