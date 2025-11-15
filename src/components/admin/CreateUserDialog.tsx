// src/components/admin/CreateUserDialog.tsx
import { useEffect, useMemo, useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

type Role = 'student' | 'parent' | 'teacher' | 'admin';

export default function CreateUserDialog({
                                             open,
                                             onOpenChange,
                                             onCreate,
                                             isSubmitting,
                                         }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onCreate: (payload: { name: string; email: string; password: string; role: Role }) => void;
    isSubmitting: boolean;
}) {
    const initialForm = useMemo(
        () => ({ name: '', email: '', password: '', role: 'student' as Role }),
        []
    );

    const [form, setForm] = useState<{ name: string; email: string; password: string; role: Role }>(
        initialForm
    );
    const [showPw, setShowPw] = useState(false);

    // ✅ Clear the form every time the dialog opens
    useEffect(() => {
        if (open) {
            setForm(initialForm);
            setShowPw(false);
        }
    }, [open, initialForm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(form);
        // ✅ Also clear immediately after submit so if parent keeps it open momentarily, fields are blank
        setForm(initialForm);
        setShowPw(false);
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Create an User</DialogTitle>
            </DialogHeader>

            <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                    <Label>Name</Label>
                    <Input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                    />
                </div>

                <div>
                    <Label>Password</Label>
                    <div className="relative">
                        <Input
                            type={showPw ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            required
                            className="pr-10"
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPw((s) => !s)}
                            aria-label="Toggle password visibility"
                        >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <Label>Role</Label>
                    <Select
                        value={form.role}
                        onValueChange={(val: Role) => setForm((f) => ({ ...f, role: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Creating…' : 'Create'}
                </Button>
            </form>
        </DialogContent>
    );
}
