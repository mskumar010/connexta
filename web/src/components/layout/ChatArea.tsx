import type { ReactNode } from 'react';

interface ChatAreaProps {
	header?: ReactNode;
	children: ReactNode;
}

export function ChatArea({ header, children }: ChatAreaProps) {
	return (
		<div 
			className="flex h-full flex-col"
			style={{ backgroundColor: 'var(--color-bg-secondary)' }}
		>
			{header && (
				<div 
					className="flex h-14 items-center border-b px-4"
					style={{ borderColor: 'var(--color-border)' }}
				>
					{header}
				</div>
			)}
			<div className="flex-1 overflow-hidden">{children}</div>
		</div>
	);
}

