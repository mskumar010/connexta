import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppLayout() {
	return (
		<>
			<div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
				<Sidebar />
				<main className="flex flex-1 flex-col overflow-hidden">
					<Outlet />
				</main>
			</div>
			<Toaster
				position="top-right"
				toastOptions={{
					style: {
						background: 'var(--color-bg-secondary)',
						color: 'var(--color-text-primary)',
						border: '1px solid var(--color-border)',
						borderRadius: '12px',
						fontSize: '14px',
					},
					success: {
						iconTheme: {
							primary: '#10b981',
							secondary: 'white',
						},
					},
					error: {
						iconTheme: {
							primary: '#ef4444',
							secondary: 'white',
						},
					},
				}}
			/>
		</>
	);
}

