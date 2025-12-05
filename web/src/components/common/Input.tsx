import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, ...props }, ref) => {
		return (
			<div className="w-full">
				{label && (
					<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
						{label}
					</label>
				)}
				<input
					ref={ref}
					className={cn(
						'w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2',
						error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
						!error && 'focus:border-indigo-500 focus:ring-indigo-500/20',
						className
					)}
					style={{
						backgroundColor: 'var(--color-bg-tertiary)',
						borderColor: error ? '#ef4444' : 'var(--color-border)',
						color: 'var(--color-text-primary)',
					}}
					{...props}
				/>
				{error && (
					<p className="mt-1 text-sm" style={{ color: '#f87171' }}>{error}</p>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';

