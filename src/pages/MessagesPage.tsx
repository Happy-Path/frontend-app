// src/pages/MessagesPage.tsx
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import ConversationsPanel from '@/components/messages/ConversationsPanel';
import ChatWindow from '@/components/messages/ChatWindow';
import { useState } from 'react';

export default function MessagesPage() {
    const { user } = useAuth();
    const [activeId, setActiveId] = useState<string | null>(null);

    if (user && !['teacher', 'parent'].includes(user.role)) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} />
                <main className="container px-4 py-6 max-w-7xl">
                    <div className="grid place-items-center h-[60vh]">
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
                            <p className="mt-2">You need teacher or parent access to view Messages.</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const myId =
        (user && ((user as any)._id || (user as any).id)) ||
        localStorage.getItem('userId') ||
        '';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user || undefined} />

            <main className="container px-4 py-6 max-w-7xl">
                <div
                    className="
            grid grid-cols-12 gap-4
            h-[calc(100vh-160px)]
            min-h-0
          "
                >
                    {/* Left: Conversations */}
                    <div className="col-span-4 min-h-0 min-w-0 flex">
                        <div className="h-full w-full">
                            <ConversationsPanel
                                myId={myId}
                                activeId={activeId}
                                onSelect={setActiveId}
                                title="Conversations"
                            />
                        </div>
                    </div>

                    {/* Right: Chat */}
                    <div className="col-span-8 min-h-0 min-w-0 flex">
                        <div className="flex-1 min-h-0">
                            <ChatWindow activeId={activeId} myId={myId} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
