//src/components/messages/ConversationsPanel.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/messageService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge.tsx';
import { UserPlus } from 'lucide-react';
import NewConversationDialog from './NewConversationDialog';

type Props = {
    myId: string;
    activeId: string | null;
    onSelect: (conversationId: string) => void;
    title?: string;
};

export default function ConversationsPanel({
                                               myId,
                                               activeId,
                                               onSelect,
                                               title = 'Conversations',
                                           }: Props) {
    const qc = useQueryClient();
    const [openNew, setOpenNew] = useState(false);

    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.listConversations,
        refetchInterval: 10000,
    });

    const createMut = useMutation({
        mutationFn: (peerUserId: string) => messageService.createConversation(peerUserId),
        onSuccess: (convo) => {
            setOpenNew(false);
            onSelect(convo._id);
            qc.invalidateQueries({ queryKey: ['conversations'] });
            qc.invalidateQueries({ queryKey: ['messages', convo._id] });
        },
    });

    return (
        <Card className="overflow-y-auto">
            <div className="p-4 flex items-center justify-between">
                <div className="font-semibold">{title}</div>
                <Button size="sm" variant="default" className="gap-1" onClick={() => setOpenNew(true)}>
                    <UserPlus className="h-4 w-4" /> New
                </Button>
            </div>

            {/* New conversation dialog */}
            <NewConversationDialog
                open={openNew}
                onOpenChange={setOpenNew}
                onCreate={(peerUserId) => createMut.mutate(peerUserId)}
                defaultBrowseRole="parent"
            />

            <div className="divide-y">
                {conversations?.map((c: any) => {
                    // find peer (the other participant)
                    const peer = (c.participants || []).find((p: any) => {
                        const pid = (p.userId?._id || p.userId || '').toString();
                        return pid !== myId.toString();
                    });

                    const peerName =
                        peer?.userId?.name ||
                        peer?.userId?.email ||
                        (peer?.role ? peer.role.toUpperCase() : 'User');

                    const peerRole = (peer?.role || peer?.userId?.role || '').toString();
                    const unread = Number(c.unreadCount || 0);

                    return (
                        <button
                            key={c._id}
                            className={`w-full text-left p-3 hover:bg-muted ${activeId === c._id ? 'bg-muted' : ''}`}
                            onClick={() => onSelect(c._id)}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium truncate">{peerName}</div>
                                        {peerRole && (
                                            <Badge variant="secondary" className="capitalize">
                                                {peerRole}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className={`text-sm line-clamp-1 ${unread > 0 ? 'font-semibold' : 'opacity-80'}`}>
                                        {c.lastMessagePreview || '—'}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end shrink-0">
                                    <div className="text-xs opacity-60">
                                        {new Date(c.lastMessageAt).toLocaleString()}
                                    </div>
                                    {unread > 0 && (
                                        <span className="mt-1 inline-flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
                      {unread > 99 ? '99+' : unread}
                    </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
