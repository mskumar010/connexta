import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
	theme: Theme;
	actualTheme: 'light' | 'dark';
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() => {
		// Get from localStorage or default to 'dark'
		const saved = localStorage.getItem('theme') as Theme | null;
		return saved || 'dark';
	});

	const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
		if (theme === 'system') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		}
		return theme;
	});

	useEffect(() => {
		const root = document.documentElement;

		// Determine actual theme
		let currentTheme: 'light' | 'dark';
		if (theme === 'system') {
			currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		} else {
			currentTheme = theme;
		}

		// Remove existing theme classes
		root.classList.remove('light', 'dark');
		// Add new theme class
		root.classList.add(currentTheme);
		setActualTheme(currentTheme);

		// Listen for system theme changes
		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = (e: MediaQueryListEvent) => {
				const newTheme = e.matches ? 'dark' : 'light';
				root.classList.remove('light', 'dark');
				root.classList.add(newTheme);
				setActualTheme(newTheme);
			};

			mediaQuery.addEventListener('change', handleChange);
			return () => mediaQuery.removeEventListener('change', handleChange);
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => {
			const next = prev === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', next);
			return next;
		});
	};

	const handleSetTheme = (newTheme: Theme) => {
		setTheme(newTheme);
		localStorage.setItem('theme', newTheme);
	};

	return (
		<ThemeContext.Provider
			value={{
				theme,
				actualTheme,
				setTheme: handleSetTheme,
				toggleTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
}

