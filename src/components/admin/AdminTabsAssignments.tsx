// src/components/admin/AdminTabsAssignments.tsx
import { useState, useEffect, useMemo } from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { adminService, AdminUser, ParentStudentAssignment } from "@/services/adminService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type SimpleUser = AdminUser;

export default function AdminTabsAssignments() {
    const qc = useQueryClient();

    const [parentSearch, setParentSearch] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedParent, setSelectedParent] =
        useState<SimpleUser | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
        []
    );

    // ---------- Queries ----------

    const {
        data: parents = [],
        isLoading: parentsLoading,
    } = useQuery({
        queryKey: ["admin-parent-search", parentSearch],
        queryFn: () => adminService.searchParents(parentSearch),
    });

    const {
        data: students = [],
        isLoading: studentsLoading,
    } = useQuery({
        queryKey: ["admin-student-search", studentSearch],
        queryFn: () => adminService.searchStudents(studentSearch),
    });

    const {
        data: assignments = [],
        isLoading: assignmentsLoading,
    } = useQuery({
        queryKey: ["admin-assignments", selectedParent?._id],
        queryFn: () =>
            adminService.listAssignments({
                parentId: selectedParent?._id,
            }),
        enabled: !!selectedParent,
    });

    // When parent changes, clear selected students
    useEffect(() => {
        setSelectedStudentIds([]);
    }, [selectedParent?._id]);

    const assignedStudentIds = useMemo(
        () =>
            new Set(
                assignments.map(
                    (a: ParentStudentAssignment) => a.studentId._id
                )
            ),
        [assignments]
    );

    // ---------- Mutations ----------

    const assignMutation = useMutation({
        mutationFn: (input: {
            parentId: string;
            studentIds: string[];
        }) =>
            adminService.assignStudentsToParent({
                parentId: input.parentId,
                studentIds: input.studentIds,
            }),
        onSuccess: (res) => {
            toast.success(
                `Assigned ${res.inserted} student(s) to parent.`
            );
            setSelectedStudentIds([]);
            qc.invalidateQueries({
                queryKey: ["admin-assignments"],
            });
        },
        onError: (err: any) => {
            const msg =
                err?.message ||
                err?.response?.data?.message ||
                "Failed to assign students";
            toast.error(msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteAssignment(id),
        onSuccess: () => {
            toast.success("Assignment removed");
            qc.invalidateQueries({
                queryKey: ["admin-assignments"],
            });
        },
        onError: (err: any) => {
            const msg =
                err?.message ||
                err?.response?.data?.message ||
                "Failed to remove assignment";
            toast.error(msg);
        },
    });

    // ---------- Handlers ----------

    const toggleStudentSelection = (id: string) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const handleSelectAllStudents = () => {
        const availableIds = students
            .filter((s) => !assignedStudentIds.has(s._id))
            .map((s) => s._id);
        const allSelected =
            availableIds.length > 0 &&
            availableIds.every((id) =>
                selectedStudentIds.includes(id)
            );
        setSelectedStudentIds(allSelected ? [] : availableIds);
    };

    const handleAssign = () => {
        if (!selectedParent) {
            toast.error("Select a parent first");
            return;
        }
        const candidates = selectedStudentIds.filter(
            (id) => !assignedStudentIds.has(id)
        );
        if (candidates.length === 0) {
            toast.error(
                "Select at least one unassigned student to assign"
            );
            return;
        }
        assignMutation.mutate({
            parentId: selectedParent._id,
            studentIds: candidates,
        });
    };

    // ---------- UI ----------

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">
                    Parent–Student Assignments
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Choose a parent on the left, then select one or more
                    students on the right to assign. Each student can have
                    only one parent in the system.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* LEFT: Select Parent */}
                <Card className="p-4 flex flex-col gap-4">
                    <div>
                        <Label className="text-xs uppercase tracking-wide text-gray-500">
                            1. Select a Parent
                        </Label>
                        <Input
                            className="mt-1"
                            placeholder="Search parents by name or email…"
                            value={parentSearch}
                            onChange={(e) => setParentSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 min-h-[260px]">
                        {parentsLoading ? (
                            <div className="text-sm text-gray-500">
                                Loading parents…
                            </div>
                        ) : parents.length === 0 ? (
                            <div className="text-sm text-gray-500">
                                No parents found. Try adjusting your search.
                            </div>
                        ) : (
                            <ScrollArea className="h-[260px] rounded-md border">
                                <div className="divide-y">
                                    {parents.map((p) => {
                                        const active =
                                            selectedParent?._id === p._id;
                                        return (
                                            <button
                                                key={p._id}
                                                type="button"
                                                onClick={() => setSelectedParent(p)}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-happy-50/60 transition ${
                                                    active ? "bg-happy-100" : ""
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-semibold">
                                                        {p.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {p.email}
                                                    </div>
                                                </div>
                                                {active && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Selected
                                                    </Badge>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {selectedParent && (
                        <div className="text-xs text-gray-600">
                            Selected parent:{" "}
                            <span className="font-semibold">
                {selectedParent.name}
              </span>{" "}
                            ({selectedParent.email})
                        </div>
                    )}
                </Card>

                {/* RIGHT: Select Students + Assignments */}
                <Card className="p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                            <Label className="text-xs uppercase tracking-wide text-gray-500">
                                2. Select Students
                            </Label>
                            <Input
                                className="mt-1"
                                placeholder="Search students by name or email…"
                                value={studentSearch}
                                onChange={(e) =>
                                    setStudentSearch(e.target.value)
                                }
                            />
                        </div>
                        <Button
                            className="mt-6"
                            variant="outline"
                            size="sm"
                            onClick={handleAssign}
                            disabled={
                                !selectedParent ||
                                selectedStudentIds.length === 0 ||
                                assignMutation.isPending
                            }
                        >
                            {assignMutation.isPending
                                ? "Assigning…"
                                : "Assign Students"}
                        </Button>
                    </div>

                    <div className="flex-1 grid grid-rows-[minmax(220px,1fr)_auto] gap-4">
                        {/* Student list */}
                        <div className="border rounded-md overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all-students"
                                        checked={
                                            students.length > 0 &&
                                            students
                                                .filter(
                                                    (s) =>
                                                        !assignedStudentIds.has(s._id)
                                                )
                                                .every((s) =>
                                                    selectedStudentIds.includes(s._id)
                                                )
                                        }
                                        onCheckedChange={handleSelectAllStudents}
                                    />
                                    <label
                                        htmlFor="select-all-students"
                                        className="cursor-pointer"
                                    >
                                        Select All
                                    </label>
                                </div>
                                <div>
                                    {selectedStudentIds.length} selected
                                </div>
                            </div>

                            <ScrollArea className="h-[220px]">
                                {studentsLoading ? (
                                    <div className="text-sm text-gray-500 px-3 py-2">
                                        Loading students…
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="text-sm text-gray-500 px-3 py-2">
                                        No students found. Try adjusting your
                                        search.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {students.map((s) => {
                                            const isAssigned =
                                                assignedStudentIds.has(s._id);
                                            const checked =
                                                selectedStudentIds.includes(s._id);
                                            return (
                                                <div
                                                    key={s._id}
                                                    className={`flex items-center justify-between px-3 py-2 text-sm ${
                                                        isAssigned
                                                            ? "bg-gray-50 text-gray-400"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            disabled={isAssigned}
                                                            checked={checked}
                                                            onCheckedChange={() =>
                                                                toggleStudentSelection(s._id)
                                                            }
                                                        />
                                                        <div>
                                                            <div className="font-medium">
                                                                {s.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {s.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isAssigned && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px]"
                                                        >
                                                            Already assigned
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Current assignments for parent */}
                        <div className="border rounded-md p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-sm">
                                    Current Assignments
                                </div>
                                {assignmentsLoading && (
                                    <div className="text-xs text-gray-500">
                                        Loading…
                                    </div>
                                )}
                            </div>
                            {(!selectedParent || assignments.length === 0) && (
                                <div className="text-xs text-gray-500">
                                    {selectedParent
                                        ? "No students assigned to this parent yet."
                                        : "Select a parent to view their assignments."}
                                </div>
                            )}
                            {selectedParent && assignments.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {assignments.map((a) => (
                                        <div
                                            key={a._id}
                                            className="flex items-center justify-between bg-white rounded-md px-2 py-1 text-xs"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {a.studentId.name}
                                                </div>
                                                <div className="text-gray-500">
                                                    {a.studentId.email}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    deleteMutation.mutate(a._id)
                                                }
                                            >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
