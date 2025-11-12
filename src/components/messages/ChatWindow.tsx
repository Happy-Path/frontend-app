// src/components/messages/ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
    activeId: string | null;
    /** Logged-in user's _id (used to color/align own messages) */
    myId?: string | null;
};

export default function ChatWindow({ activeId, myId }: Props) {
    const qc = useQueryClient();
    const [text, setText] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const { data: msgsData } = useQuery({
        queryKey: ['messages', activeId],
        queryFn: () => messageService.getMessages(activeId!, 1, 60),
        enabled: !!activeId,
        refetchInterval: 5000,
    });

    const sendMut = useMutation({
        mutationFn: () => messageService.sendMessage(activeId!, text),
        onSuccess: () => {
            setText('');
            qc.invalidateQueries({ queryKey: ['messages', activeId] });
            qc.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    useEffect(() => {
        if (!activeId) return;
        messageService.markRead(activeId).then(() => {
            qc.invalidateQueries({ queryKey: ['conversations'] });
        });
    }, [activeId, qc]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgsData]);

    return (
        // Full width/height, with only the message list scrolling
        <Card className="flex h-full w-full min-h-0 flex-col overflow-hidden">
            {!activeId ? (
                <div className="flex-1 grid place-items-center text-sm opacity-70">
                    Select a conversation
                </div>
            ) : (
                <>
                    {/* Scrollable messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth overscroll-contain">
                        {msgsData?.items?.map((m: any) => {
                            const isMine = myId ? String(m.senderId) === String(myId) : m.senderRole === 'teacher';

                            return (
                                <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={[
                                            'max-w-[70%] rounded-2xl px-3 py-2 shadow-sm break-words',
                                            isMine ? 'bg-blue-500 text-white' : 'bg-white border',
                                        ].join(' ')}
                                    >
                                        <div className="text-sm">{m.text}</div>
                                        <div className={`text-[10px] mt-1 ${isMine ? 'opacity-80' : 'opacity-60'}`}>
                                            {new Date(m.createdAt).toLocaleTimeString()} • {m.readBy?.length > 1 ? 'Read' : 'Sent'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={endRef} />
                    </div>

                    {/* Composer pinned at bottom */}
                    <div className="p-3 border-t flex gap-2 shrink-0 bg-white">
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message…"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && text.trim()) sendMut.mutate();
                            }}
                        />
                        <Button disabled={!text.trim()} onClick={() => sendMut.mutate()}>
                            Send
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
}
