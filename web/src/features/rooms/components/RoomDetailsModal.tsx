import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';
import type { Room } from '@/types';

interface RoomDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room;
    memberCount: number;
}

export function RoomDetailsModal({ isOpen, onClose, room, memberCount }: RoomDetailsModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#2c2c2e] p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-white"
                                    >
                                        Room Details
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-6">
                                    {/* Room Name & Description */}
                                    <div>
                                        <h4 className="text-xl font-semibold text-white mb-1"># {room.name}</h4>
                                        {room.description && (
                                            <p className="text-sm text-gray-400">{room.description}</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <UserGroupIcon className="h-5 w-5 text-blue-400" />
                                            <span>{memberCount} members</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {room.tags && room.tags.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                                <TagIcon className="h-4 w-4" />
                                                <span>Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {room.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Meta */}
                                    <div className="pt-4 border-t border-white/10 text-xs text-gray-500">
                                        <p>Created on {new Date(room.createdAt).toLocaleDateString()}</p>
                                        <p>ID: {room._id}</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
