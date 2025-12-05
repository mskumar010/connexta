import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateProfileMutation } from '@/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { toast } from 'react-hot-toast';
import type { RootState } from '@/app/store';

export function ProfilePage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({ displayName, avatarUrl }).unwrap();
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
            console.error(error);
        }
    };

    return (
        <div className="flex h-full flex-col p-6">
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Profile Settings</h1>

            <div className="max-w-md space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user?.displayName}</h2>
                        <p style={{ color: 'var(--color-text-tertiary)' }}>{user?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        required
                    />

                    <Input
                        label="Avatar URL (Optional)"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.png"
                    />

                    <Button type="submit" isLoading={isLoading}>
                        Save Changes
                    </Button>
                </form>
            </div>
        </div>
    );
}
