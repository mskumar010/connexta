import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateRoomMutation } from '@/api/roomsApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { toast } from 'react-hot-toast';

import { ROOM_TAGS } from '@/data/tags';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [createRoom, { isLoading }] = useCreateRoomMutation();

    const filteredTags = ROOM_TAGS.filter(tag =>
        tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
        !selectedTags.includes(tag)
    ).slice(0, 5);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            if (selectedTags.length >= 5) {
                toast.error('Maximum 5 tags allowed');
                return;
            }
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTags.length === 0) {
            toast.error('Please select at least one tag');
            return;
        }
        try {
            await createRoom({ name, description, tags: selectedTags }).unwrap();
            toast.success('Room created successfully');
            onClose();
            setName('');
            setDescription('');
            setSelectedTags([]);
            setTagSearch('');
        } catch (error: any) {
            console.error('Failed to create room:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to create room';
            toast.error(`Error: ${errorMessage}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl"
                        style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Create New Room</h2>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1 hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Room Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. General, Random, Tech"
                                required
                                autoFocus
                            />

                            <div className="space-y-1">
                                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                    Tags (Select at least one)
                                </label>
                                <div className="relative">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTag(tag)}
                                                    className="hover:text-indigo-700"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                        placeholder="Search tags..."
                                        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        style={{
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text-primary)'
                                        }}
                                    />
                                    {tagSearch && (
                                        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-md border shadow-lg"
                                            style={{
                                                backgroundColor: 'var(--color-bg-secondary)',
                                                borderColor: 'var(--color-border)'
                                            }}
                                        >
                                            {filteredTags.length > 0 ? (
                                                filteredTags.map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            toggleTag(tag);
                                                            setTagSearch('');
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                                                        style={{ color: 'var(--color-text-primary)' }}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-gray-500">No tags found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    style={{
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    rows={3}
                                    placeholder="What's this room about?"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isLoading} disabled={selectedTags.length === 0}>
                                    Create Room
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
