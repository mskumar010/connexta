import { motion } from 'framer-motion';
import { Avatar } from '@/components/common/Avatar';

interface TypingIndicatorProps {
	userNames: string[];
}

export function TypingIndicator({ userNames }: TypingIndicatorProps) {
	if (userNames.length === 0) {
		return null;
	}

	const text =
		userNames.length === 1
			? `${userNames[0]} is typing...`
			: `${userNames.length} people are typing...`;

	return (
		<div className="flex gap-3 px-4 py-2">
			<Avatar name="Typing" size="md" />
			<div className="flex items-center gap-2">
				<span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{text}</span>
				<div className="flex gap-1">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: 'var(--color-text-tertiary)' }}
							animate={{
								y: [0, -4, 0],
								opacity: [0.5, 1, 0.5],
							}}
							transition={{
								duration: 0.6,
								repeat: Infinity,
								delay: i * 0.2,
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

