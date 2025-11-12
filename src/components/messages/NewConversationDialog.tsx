//src/components/messages/NewConversationDialog.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService, UserLite } from '@/services/userService.ts';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Search } from 'lucide-react';

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    defaultBrowseRole?: 'teacher' | 'parent';
    onCreate: (peerUserId: string) => Promise<void> | void;
};

export default function NewConversationDialog({
                                                  open,
                                                  onOpenChange,
                                                  defaultBrowseRole = 'parent',
                                                  onCreate,
                                              }: Props) {
    const [browseRole, setBrowseRole] = useState<'teacher' | 'parent'>(defaultBrowseRole);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
        return () => clearTimeout(t);
    }, [q]);

    const { data: users, isFetching } = useQuery({
        queryKey: ['users', browseRole, debouncedQ],
        queryFn: () => userService.list({ role: browseRole, q: debouncedQ, limit: 30 }),
        enabled: open,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Start a new conversation</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3">
                    <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm opacity-70 col-span-1">Browse role</div>
                        <div className="col-span-2">
                            <Select value={browseRole} onValueChange={(v: any) => setBrowseRole(v)}>
                                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="parent">Parents</SelectItem>
                                    <SelectItem value="teacher">Teachers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                        <Input
                            className="pl-8"
                            placeholder="Search by name or email…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <div className="text-xs opacity-60">
                        {isFetching ? 'Loading…' : `Found ${users?.length ?? 0} ${browseRole}s`}
                    </div>

                    <ScrollArea className="h-72 rounded border">
                        <div className="divide-y">
                            {users?.map((u: UserLite) => (
                                <button
                                    key={u._id}
                                    onClick={() => onCreate(u._id)}
                                    className="w-full text-left p-3 hover:bg-muted focus:bg-muted"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium">{u.name || u.email}</div>
                                            <div className="text-xs opacity-70">{u.email}</div>
                                        </div>
                                        <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                                    </div>
                                </button>
                            ))}
                            {!isFetching && (!users || users.length === 0) && (
                                <div className="p-6 text-center text-sm opacity-70">No users found.</div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
