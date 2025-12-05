import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
	src?: string;
	name: string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	online?: boolean;
}

const sizeClasses = {
	xs: 'h-6 w-6 text-[10px]',
	sm: 'h-8 w-8 text-xs',
	md: 'h-10 w-10 text-sm',
	lg: 'h-12 w-12 text-base',
	xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, name, size = 'md', className, online }: AvatarProps) {
	return (
		<div className={cn('relative inline-flex', className)}>
			{src ? (
				<img
					src={src}
					alt={name}
					className={cn(
						'rounded-full object-cover',
						sizeClasses[size]
					)}
				/>
			) : (
				<div
					className={cn(
						'flex items-center justify-center rounded-full bg-indigo-600 font-semibold text-white',
						sizeClasses[size]
					)}
				>
					{getInitials(name)}
				</div>
			)}
			{online !== undefined && (
				<span
					className={cn(
						'absolute bottom-0 right-0 rounded-full border-2 border-gray-950',
						online ? 'bg-green-500' : 'bg-gray-500',
						size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
					)}
				/>
			)}
		</div>
	);
}

