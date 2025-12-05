import { Skeleton } from '@/components/common/Skeleton';

export function MessageListSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className={`flex items-end gap-2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'
                        }`}
                >
                    {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                    <div
                        className={`space-y-2 ${i % 2 === 0 ? 'items-start' : 'items-end'
                            } flex flex-col`}
                    >
                        <Skeleton className="h-4 w-20" />
                        <Skeleton
                            className={`h-10 ${i % 2 === 0 ? 'w-48 rounded-bl-none' : 'w-64 rounded-br-none'
                                } rounded-2xl`}
                        />
                    </div>
                    {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                </div>
            ))}
        </div>
    );
}
