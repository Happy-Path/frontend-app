// src/components/teacher/TeacherStudents.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import StudentDetailDialog from "./StudentDetailDialog";
import {
    reportsService,
    TeacherStudentSummary,
} from "@/services/reportsService";

type TeacherStudentRow = {
    id: string;
    name: string;
    email: string;
    progress: number;
    lastActive: string;
    completedModules: number;
    totalModules: number;
    attentionScore?: number | null; // reserved for future attention metric
};

const TeacherStudents = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<TeacherStudentRow | null>(null);

    const {
        data: apiStudents = [],
        isLoading,
        isError,
    } = useQuery<TeacherStudentSummary[]>({
        queryKey: ["teacher", "students"],
        queryFn: reportsService.teacherStudents,
    });

    // Map backend data -> UI row model
    const students: TeacherStudentRow[] = apiStudents.map((s) => ({
        id: s.userId,
        name: s.name || s.email || "Unknown student",
        email: s.email || "",
        progress: s.progressPercent ?? 0,
        lastActive: s.lastActive
            ? new Date(s.lastActive).toISOString()
            : new Date().toISOString(),
        completedModules: s.completedModules ?? 0,
        totalModules: s.totalModules ?? 0,
        attentionScore: null, // we will wire this later from attention analytics
    }));

    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendNotification = (studentId: string) => {
        console.log(`Send notification for student ${studentId}`);
        // In future: open NewNotificationDialog with this student's parent pre-selected
    };

    const handleViewStudent = (student: TeacherStudentRow) => {
        setSelectedStudent(student);
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 75) return "bg-green-500";
        if (progress >= 40) return "bg-amber-500";
        return "bg-red-500";
    };

    const getAttentionBadge = (score?: number | null) => {
        if (score == null) {
            return (
                <Badge className="bg-gray-300 text-gray-900">
                    N/A
                </Badge>
            );
        }
        if (score >= 0.8) return <Badge className="bg-green-500">High</Badge>;
        if (score >= 0.6) return <Badge className="bg-amber-500">Medium</Badge>;
        return <Badge className="bg-red-500">Low</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Students</h2>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-12 w-12 text-red-500 mb-4" />
                            <p className="text-lg font-medium">
                                Failed to load students
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Please try again later.
                            </p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No students found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchQuery
                                    ? "Try a different search term"
                                    : "No active students were found in the selected timeframe."}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Completed</TableHead>
                                    <TableHead>Attention Level</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar>
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback className="bg-happy-100 text-happy-700">
                                                        {student.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{student.name}</div>
                                                    {student.email && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {student.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={student.progress}
                                                    className={getProgressColor(student.progress)}
                                                />
                                                <span className="text-sm">
                          {student.progress}%
                        </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {student.completedModules}/{student.totalModules} modules
                                        </TableCell>
                                        <TableCell>{getAttentionBadge(student.attentionScore)}</TableCell>
                                        <TableCell>
                                            {student.lastActive
                                                ? new Date(student.lastActive).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleSendNotification(student.id)}
                                                    title="Send notification"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleViewStudent(student)}
                                                    title="View details"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedStudent && (
                <StudentDetailDialog
                    student={selectedStudent}
                    open={!!selectedStudent}
                    onOpenChange={(open) => !open && setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default TeacherStudents;
