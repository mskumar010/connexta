import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowBigUp, ArrowBigDown, Share2, Flag, MoreHorizontal, Minus, Plus } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { formatMessageTime, stringToColor, cn } from '@/lib/utils';
import type { UIMessage } from '@/types';

interface MessageItemProps {
	message: UIMessage;
	onReply?: (message: UIMessage) => void;
	depth?: number;
	isCollapsed?: boolean;
	onCollapse?: () => void;
}

export const MessageItem = memo(function MessageItem({
	message,
	onReply,
	depth = 0,
	isCollapsed,
	onCollapse
}: MessageItemProps) {
	// Calculate if message is recent (less than 5 minutes old)
	const isRecent = useMemo(() => {
		const created = new Date(message.createdAt);
		const now = new Date();
		const diff = now.getTime() - created.getTime();
		return diff < 5 * 60 * 1000; // 5 minutes
	}, [message.createdAt]);

	// Generate thread color based on sender ID
	const threadColor = useMemo(() => stringToColor(message.sender.id), [message.sender.id]);

	if (message.isSystemMessage) {
		return (
			<div className="flex items-center justify-center py-2">
				<div
					className="rounded-full px-4 py-1"
					style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
				>
					<p className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>{message.text}</p>
				</div>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className="group relative flex gap-3 px-4 py-3 transition-colors hover:bg-white/5"
			style={{
				marginLeft: `${depth * 24}px`,
				paddingLeft: depth > 0 ? '12px' : '16px',
			}}
		>
			{/* Vertical line for threading (visual guide) */}
			{depth > 0 && (
				<div
					className="absolute -left-[1px] top-0 h-full w-[2px] opacity-30 hover:opacity-100 transition-opacity"
					style={{ backgroundColor: threadColor }}
				/>
			)}

			{/* Voting Column (Mock) */}
			{!isCollapsed && (
				<div className="flex flex-col items-center gap-1 pt-1 w-6 shrink-0">
					<button className="text-gray-500 hover:text-orange-500 transition-colors">
						<ArrowBigUp className="h-6 w-6" />
					</button>
					<span className="text-xs font-bold text-gray-400">
						{Math.floor(Math.random() * 1000)}
					</span>
					<button className="text-gray-500 hover:text-blue-500 transition-colors">
						<ArrowBigDown className="h-6 w-6" />
					</button>
				</div>
			)}

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1.5 text-xs">
					{isCollapsed && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onCollapse?.();
							}}
							className="mr-1 text-gray-400 hover:text-white"
						>
							<Plus className="h-3 w-3" />
						</button>
					)}

					<div className="flex items-center gap-2">
						<Avatar
							src={message.sender.avatarUrl}
							name={message.sender.displayName}
							size="xs"
						/>
						<span
							className="font-bold hover:underline cursor-pointer"
							style={{ color: threadColor }}
						>
							{message.sender.displayName}
						</span>
						<span className="text-gray-500">
							• {formatMessageTime(message.createdAt)}
						</span>
						{isRecent && (
							<span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-medium border border-blue-500/30 animate-pulse">
								NEW
							</span>
						)}
						{message.isOptimistic && (
							<span className="italic text-gray-500">Sending...</span>
						)}
					</div>
				</div>

				{!isCollapsed ? (
					<>
						<div className="pl-1">
							<p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
								{message.text}
							</p>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-4 mt-3 pl-1 opacity-60 group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => onReply?.(message)}
								className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors"
							>
								<MessageSquare className="h-4 w-4" />
								<span>Reply</span>
							</button>
							<button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors">
								<Share2 className="h-4 w-4" />
								<span>Share</span>
							</button>
							<button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors">
								<Flag className="h-4 w-4" />
								<span>Report</span>
							</button>
							<button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors">
								<MoreHorizontal className="h-4 w-4" />
							</button>
						</div>
					</>
				) : (
					<button
						onClick={onCollapse}
						className="text-xs text-gray-500 hover:text-gray-400 italic ml-1"
					>
						(collapsed)
					</button>
				)}
			</div>

			{/* Collapse button for expanded state - positioned relative to content */}
			{!isCollapsed && (
				<div
					className="absolute left-4 top-10 bottom-0 w-6 group/line cursor-pointer"
					onClick={onCollapse}
				>
					<div
						className="h-full w-[2px] mx-auto bg-transparent group-hover/line:bg-gray-700/50 transition-colors"
						style={{
							// On hover, show the thread color
							borderLeft: `2px solid ${threadColor}`,
							opacity: 0.1
						}}
					/>
				</div>
			)}
		</motion.div>
	);
});

