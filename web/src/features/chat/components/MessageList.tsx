import { useEffect, useRef, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { MessageItem } from '@/features/chat/components/MessageItem';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import { MessageListSkeleton } from '@/features/chat/components/MessageListSkeleton';
import type { UIMessage } from '@/types';

interface MessageListProps {
	messages: UIMessage[];
	typingUserIds: string[];
	typingUserNames: { [userId: string]: string };
	isLoading?: boolean;
	onReply?: (message: UIMessage) => void;
}

export function MessageList({
	messages,
	typingUserIds,
	typingUserNames,
	isLoading,
	onReply,
}: MessageListProps) {
	const virtuosoRef = useRef<any>(null);
	const [collapsedMessageIds, setCollapsedMessageIds] = useState<Set<string>>(new Set());

	const toggleCollapse = (messageId: string) => {
		setCollapsedMessageIds((prev) => {
			const next = new Set(prev);
			if (next.has(messageId)) {
				next.delete(messageId);
			} else {
				next.add(messageId);
			}
			return next;
		});
	};

	// Transform messages into threaded structure
	const threadedMessages = useMemo(() => {
		const messageMap = new Map<string, UIMessage>();
		const rootMessages: UIMessage[] = [];
		const childrenMap = new Map<string, UIMessage[]>();

		// First pass: map messages and identify roots
		messages.forEach((msg) => {
			messageMap.set(msg.id, msg);
			if (!msg.parentId) {
				rootMessages.push(msg);
			} else {
				const siblings = childrenMap.get(msg.parentId) || [];
				siblings.push(msg);
				childrenMap.set(msg.parentId, siblings);
			}
		});

		// Flatten tree
		const result: { message: UIMessage; depth: number }[] = [];

		const traverse = (msg: UIMessage, depth: number) => {
			result.push({ message: msg, depth });

			// If collapsed, don't traverse children
			if (collapsedMessageIds.has(msg.id)) {
				return;
			}

			const children = childrenMap.get(msg.id) || [];
			children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			children.forEach((child) => traverse(child, depth + 1));
		};

		// Sort roots by createdAt
		rootMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		rootMessages.forEach((msg) => traverse(msg, 0));

		// Handle orphaned messages (if parent is missing from current view)
		const visitedIds = new Set(result.map(r => r.message.id));
		messages.forEach(msg => {
			if (!visitedIds.has(msg.id)) {
				// Only show if not a child of a collapsed message (this is tricky for orphans, 
				// but for now let's just show them at depth 0)
				result.push({ message: msg, depth: 0 });
			}
		});

		return result;
	}, [messages, collapsedMessageIds]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (virtuosoRef.current && messages.length > 0) {
			// Only scroll if we are near bottom or it's initial load?
			// For now, keep simple behavior but maybe debounce it
			setTimeout(() => {
				virtuosoRef.current?.scrollToIndex({
					index: threadedMessages.length - 1,
					behavior: 'smooth',
				});
			}, 100);
		}
	}, [messages.length]);

	const typingNames = typingUserIds
		.map((id) => typingUserNames[id])
		.filter(Boolean);

	if (isLoading) {
		return <MessageListSkeleton />;
	}

	if (messages.length === 0 && typingNames.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center space-y-2">
					<p style={{ color: 'var(--color-text-tertiary)' }}>No messages yet</p>
					<p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Start the conversation!</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<Virtuoso
				ref={virtuosoRef}
				data={threadedMessages}
				itemContent={(_index, item) => (
					<MessageItem
						key={item.message.id}
						message={item.message}
						depth={item.depth}
						onReply={onReply}
						isCollapsed={collapsedMessageIds.has(item.message.id)}
						onCollapse={() => toggleCollapse(item.message.id)}
					/>
				)}
				initialTopMostItemIndex={threadedMessages.length - 1}
				followOutput="smooth"
				style={{ height: '100%' }}
			/>
			{typingNames.length > 0 && <TypingIndicator userNames={typingNames} />}
		</div>
	);
}
