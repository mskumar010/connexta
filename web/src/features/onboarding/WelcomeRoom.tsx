import { useEffect } from 'react';
import { ChatArea } from '@/components/layout/ChatArea';
import { MessageList } from '@/features/chat/components/MessageList';
import { MessageInput } from '@/features/chat/components/MessageInput';
import { addMessage } from '@/features/chat/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import type { UIMessage } from '@/types';

interface WelcomeMessage {
	text: string;
	sender: {
		id: string;
		displayName: string;
		avatarUrl?: string;
	};
	delay: number; // Delay in milliseconds before showing this message
}

const WELCOME_MESSAGES: WelcomeMessage[] = [
	{
		text: `System initialized. User detected. Loading onboarding protocol v2.4...`,
		sender: {
			id: 'tech-lead',
			displayName: 'DevOps Dave 🛠️',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
		},
		delay: 500,
	},
	{
		text: `Wait, wait! Dave, stop scaring them with the technical jargon!`,
		sender: {
			id: 'simplifier',
			displayName: 'Simple Sarah ✨',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
		},
		delay: 2000,
	},
	{
		text: `Hi there! 👋 Ignore Dave. He thinks everyone speaks binary. Welcome to EchoRoom! It's actually super simple to use.`,
		sender: {
			id: 'simplifier',
			displayName: 'Simple Sarah ✨',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
		},
		delay: 4000,
	},
	{
		text: `Technically, binary is the foundation of all digital communication, Sarah. I was merely establishing a handshake.`,
		sender: {
			id: 'tech-lead',
			displayName: 'DevOps Dave 🛠️',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
		},
		delay: 7000,
	},
	{
		text: `Hey everyone! Let's focus. Welcome to the community! 🌟 I'm here to help you find your way around.`,
		sender: {
			id: 'guide',
			displayName: 'Community Guide 🗺️',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guide',
		},
		delay: 9000,
	},
	{
		text: `You can join any room on the left sidebar. "General" is great for hanging out, and "Tech Talk" is where Dave lives. 😉`,
		sender: {
			id: 'guide',
			displayName: 'Community Guide 🗺️',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guide',
		},
		delay: 12000,
	},
	{
		text: `Correct. The latency in Tech Talk is optimized for high-frequency knowledge transfer.`,
		sender: {
			id: 'tech-lead',
			displayName: 'DevOps Dave 🛠️',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
		},
		delay: 15000,
	},
	{
		text: `See? Easy! Just click a room and start chatting. Have fun! 🎉`,
		sender: {
			id: 'simplifier',
			displayName: 'Simple Sarah ✨',
			avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
		},
		delay: 17000,
	},
];

interface WelcomeRoomProps {
	userName: string;
	userId: string;
	roomId: string;
	onComplete?: () => void;
}

export function WelcomeRoom({ userName, userId, roomId, onComplete }: WelcomeRoomProps) {
	const dispatch = useDispatch<AppDispatch>();
	const messages = useSelector((state: RootState) => state.chat.messages[roomId] || []);

	useEffect(() => {
		// Add personalized welcome message
		const personalizedMessage: WelcomeMessage = {
			text: `Hey ${userName}! So glad you joined us!`,
			sender: {
				id: 'guide',
				displayName: 'Community Guide 🗺️',
				avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guide',
			},
			delay: 0,
		};

		const allMessages = [personalizedMessage, ...WELCOME_MESSAGES];

		// Display messages with delays
		const timeouts: ReturnType<typeof setTimeout>[] = [];

		allMessages.forEach((msg, index) => {
			const timeout = setTimeout(() => {
				const uiMessage: UIMessage = {
					id: `welcome-${index}-${Date.now()}`,
					roomId,
					sender: msg.sender,
					text: msg.text,
					createdAt: new Date().toISOString(),
					isMine: false,
					isSystemMessage: false,
				};

				// Add to Redux
				dispatch(addMessage({ roomId, message: uiMessage }));

				// Check if all messages are shown
				if (index === allMessages.length - 1) {
					// Call onComplete after a short delay
					if (onComplete) {
						setTimeout(() => {
							onComplete();
						}, 2000);
					}
				}
			}, msg.delay);

			timeouts.push(timeout);
		});

		// Cleanup timeouts on unmount
		return () => {
			timeouts.forEach(clearTimeout);
		};
	}, [userName, userId, roomId, dispatch, onComplete]);

	return (
		<ChatArea
			header={
				<div className="flex items-center gap-2">
					<span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
						👋 Welcome Room
					</span>
				</div>
			}
		>
			<div className="flex h-full flex-col">
				<div className="flex-1 overflow-hidden">
					<MessageList
						messages={messages}
						typingUserIds={[]}
						typingUserNames={{}}
					/>
				</div>
				<MessageInput roomId={roomId} />
			</div>
		</ChatArea>
	);
}

