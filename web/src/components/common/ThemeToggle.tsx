import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
	const { theme, actualTheme, setTheme } = useTheme();

	const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }> =
		[
			{ value: 'light', icon: Sun, label: 'Light' },
			{ value: 'dark', icon: Moon, label: 'Dark' },
			{ value: 'system', icon: Monitor, label: 'System' },
		];

	return (
		<div
			className="flex items-center gap-1 rounded-lg p-1"
			style={{ backgroundColor: 'var(--color-bg-secondary)' }}
		>
			{themes.map(({ value, icon: Icon, label }) => {
				const isActive = theme === value;
				return (
					<motion.button
						key={value}
						onClick={() => setTheme(value)}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
						style={{
							backgroundColor: isActive ? 'var(--color-bg-tertiary)' : 'transparent',
							color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
						}}
						onMouseEnter={(e) => {
							if (!isActive) {
								e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
								e.currentTarget.style.color = 'var(--color-text-secondary)';
							}
						}}
						onMouseLeave={(e) => {
							if (!isActive) {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.color = 'var(--color-text-tertiary)';
							}
						}}
						title={label}
					>
						<Icon className="h-4 w-4" />
						<span className="hidden sm:inline">{label}</span>
					</motion.button>
				);
			})}
		</div>
	);
}

// Compact version for header/sidebar
export function ThemeToggleCompact() {
	const { actualTheme, toggleTheme } = useTheme();

	return (
		<motion.button
			onClick={toggleTheme}
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			className="rounded-lg p-2 transition-colors"
			style={{ color: 'var(--color-text-tertiary)' }}
			title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
			type="button"
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
				e.currentTarget.style.color = 'var(--color-text-primary)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = 'transparent';
				e.currentTarget.style.color = 'var(--color-text-tertiary)';
			}}
		>
			{actualTheme === 'dark' ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
		</motion.button>
	);
}

