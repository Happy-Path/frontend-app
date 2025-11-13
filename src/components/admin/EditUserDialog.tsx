import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function EditUserDialog({
                                           open,
                                           onOpenChange,
                                           user,
                                           isSubmitting,
                                           onResetPassword,
                                           onUpdate,
                                       }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    user: any;
    isSubmitting: boolean;
    onResetPassword: () => void;
    onUpdate: (payload: { name?: string; email?: string; isActive?: boolean }) => void;
}) {
    const [name, setName] = useState<string>(user.name || '');
    const [email, setEmail] = useState<string>(user.email || '');
    const [isActive, setIsActive] = useState<boolean>(user.isActive !== false);

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>

            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    onUpdate({ name, email, isActive });
                }}
            >
                {/* Editable name & email */}
                <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                {/* Inline role & status */}
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <span className="font-medium">Role:</span>{' '}
                        <Badge variant="secondary" className="capitalize">
                            {user.role}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Status:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{isActive ? 'Active' : 'Disabled'}</span>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={onResetPassword}
                        disabled={isSubmitting}
                    >
                        Reset Password
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating…' : 'Update'}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
