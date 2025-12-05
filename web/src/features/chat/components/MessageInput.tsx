import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { useRoomSocket } from '@/hooks/useRoomSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { addMessage } from '@/features/chat/chatSlice';
import { useDispatch } from 'react-redux';
import { generateTempId } from '@/lib/utils';
import type { AppDispatch } from '@/app/store';
import type { UIMessage } from '@/types';

interface MessageInputProps {
	roomId: string;
	replyingTo?: UIMessage | null;
	onCancelReply?: () => void;
}

export function MessageInput({ roomId, replyingTo, onCancelReply }: MessageInputProps) {
	const [text, setText] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const dispatch = useDispatch<AppDispatch>();
	const { user } = useSelector((state: RootState) => state.auth);
	const { socket } = useRoomSocket({
		roomId,
		userId: user?._id || '',
	});

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [text]);

	// Focus input when replying
	useEffect(() => {
		if (replyingTo && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [replyingTo]);

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setText(value);

		// Typing indicator
		if (value.trim() && !isTyping && roomId !== 'welcome') {
			setIsTyping(true);
			socket?.emit('typing:start', { roomId });
		}

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Stop typing after 2 seconds of inactivity
		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			if (roomId !== 'welcome') {
				socket?.emit('typing:stop', { roomId });
			}
		}, 2000);
	};

	const handleSend = () => {
		if (!text.trim()) return;

		if (!socket && roomId !== 'welcome') {
			toast.error('Connection lost. Reconnecting...');
			return;
		}

		if (!user) return;

		const tempId = generateTempId();
		const messageText = text.trim();

		// Optimistic update
		const optimisticMessage = {
			id: tempId,
			roomId,
			sender: {
				id: user._id,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
			},
			text: messageText,
			createdAt: new Date().toISOString(),
			isMine: true,
			isOptimistic: true,
			parentId: replyingTo?.id,
		};

		dispatch(addMessage({ roomId, message: optimisticMessage }));

		// Send via socket
		if (roomId !== 'welcome') {
			socket?.emit('message:send', {
				roomId,
				text: messageText,
				tempId,
				parentId: replyingTo?.id,
			});
		}

		// Clear input and reply state
		setText('');
		if (onCancelReply) onCancelReply();

		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}

		// Stop typing
		if (isTyping) {
			setIsTyping(false);
			if (roomId !== 'welcome') {
				socket?.emit('typing:stop', { roomId });
			}
		}
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
		if (e.key === 'Escape' && replyingTo && onCancelReply) {
			onCancelReply();
		}
	};

	return (
		<div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
			{replyingTo && (
				<div className="flex items-center justify-between px-4 py-2 text-sm" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
					<div className="flex items-center gap-2 overflow-hidden">
						<span style={{ color: 'var(--color-text-secondary)' }}>Replying to</span>
						<span className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
							{replyingTo.sender.displayName}
						</span>
					</div>
					<button
						onClick={onCancelReply}
						className="p-1 rounded hover:bg-white/10"
						style={{ color: 'var(--color-text-secondary)' }}
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			)}
			<div className="p-4">
				<div className="flex gap-2">
					<textarea
						ref={textareaRef}
						value={text}
						onChange={handleInput}
						onKeyDown={handleKeyDown}
						placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
						rows={1}
						className="flex-1 resize-none rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
						style={{
							backgroundColor: 'var(--color-bg-tertiary)',
							borderColor: 'var(--color-border)',
							color: 'var(--color-text-primary)',
						}}
						onFocus={(e) => {
							e.target.style.borderColor = '#6366f1';
							e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
						}}
						onBlur={(e) => {
							e.target.style.borderColor = 'var(--color-border)';
							e.target.style.boxShadow = 'none';
						}}
					/>
					<Button
						onClick={handleSend}
						disabled={!text.trim()}
						variant="primary"
						size="md"
						className="self-end"
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

