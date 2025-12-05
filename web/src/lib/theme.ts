/**
 * Theme configuration - Apple-inspired dark mode
 * No blue tints, neutral grays only
 */

export const theme = {
	colors: {
		// Backgrounds - Neutral grays (no blue tint)
		background: {
			primary: 'bg-gray-950', // Main app background
			secondary: 'bg-gray-900', // Cards, panels, sidebar
			tertiary: 'bg-gray-800', // Hover states, active states
			elevated: 'bg-gray-850', // Elevated surfaces (if needed)
		},
		// Text - High contrast for readability
		text: {
			primary: 'text-gray-100', // Primary text
			secondary: 'text-gray-300', // Secondary text
			tertiary: 'text-gray-500', // Tertiary/muted text
			disabled: 'text-gray-600', // Disabled text
		},
		// Borders - Subtle separators
		border: {
			default: 'border-gray-800', // Default borders
			light: 'border-gray-700', // Light borders
			accent: 'border-gray-600', // Accent borders
		},
		// Accents - Minimal, purposeful
		accent: {
			primary: 'bg-indigo-600', // Primary actions
			primaryHover: 'hover:bg-indigo-700',
			primaryText: 'text-indigo-400', // Accent text
		},
		// Status colors
		status: {
			online: 'bg-green-500', // Online indicator
			offline: 'bg-gray-500', // Offline indicator
			error: 'bg-red-600', // Error states
			warning: 'bg-amber-500', // Warning states
			success: 'bg-green-500', // Success states
		},
	},
	spacing: {
		xs: '0.5rem', // 8px
		sm: '0.75rem', // 12px
		md: '1rem', // 16px
		lg: '1.5rem', // 24px
		xl: '2rem', // 32px
		'2xl': '3rem', // 48px
	},
	borderRadius: {
		sm: 'rounded-lg', // 8px
		md: 'rounded-xl', // 12px
		lg: 'rounded-2xl', // 16px
		full: 'rounded-full',
	},
	shadows: {
		sm: 'shadow-sm',
		md: 'shadow-md',
		lg: 'shadow-lg',
		none: 'shadow-none',
	},
} as const;

/**
 * Apple-inspired color palette
 * Neutral, warm grays without blue tint
 */
export const appleColors = {
	gray: {
		50: '#fafafa',
		100: '#f5f5f5',
		200: '#e5e5e5',
		300: '#d4d4d4',
		400: '#a3a3a3',
		500: '#737373',
		600: '#525252',
		700: '#404040',
		800: '#262626',
		850: '#1f1f1f', // Custom between 800 and 900
		900: '#171717',
		950: '#0a0a0a',
	},
	accent: {
		indigo: {
			400: '#818cf8',
			500: '#6366f1',
			600: '#4f46e5',
			700: '#4338ca',
		},
	},
} as const;

