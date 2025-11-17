// src/components/parent/ParentReports.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parentService } from "@/services/parentService";
import TeacherLessonCompletion from "@/components/teacher/TeacherLessonCompletion";
import TeacherEmotionSummary from "@/components/teacher/TeacherEmotionSummary";
import TeacherAttentionSummary from "@/components/teacher/TeacherAttentionSummary";

export default function ParentReports() {
    const { data: children = [], isLoading } = useQuery({
        queryKey: ["parent-children"],
        queryFn: parentService.myChildren,
    });

    const today = useMemo(
        () => new Date().toISOString().slice(0, 10),
        []
    );
    const weekAgo = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().slice(0, 10);
    }, []);

    const [selectedChildId, setSelectedChildId] = useState<string | null>(
        null
    );
    const [from, setFrom] = useState<string>(weekAgo);
    const [to, setTo] = useState<string>(today);
    const [timezone, setTimezone] = useState<string>("+05:30");

    // Auto-select first child once loaded
    useEffect(() => {
        if (!selectedChildId && children.length > 0) {
            setSelectedChildId(children[0].studentId);
        }
    }, [children, selectedChildId]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">
                Reports & Insights
            </h2>
            <p className="text-sm text-gray-600">
                Select your child and the time range to view their
                learning progress, attention, and emotions.
            </p>

            {/* Filters */}
            <Card className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Child selector */}
                    <div className="space-y-1">
                        <Label>Child</Label>
                        {isLoading ? (
                            <div className="text-sm text-gray-500">
                                Loading children…
                            </div>
                        ) : children.length === 0 ? (
                            <div className="text-sm text-gray-500">
                                No children assigned to your account yet. Please
                                contact the administrator.
                            </div>
                        ) : (
                            <Select
                                value={selectedChildId ?? undefined}
                                onValueChange={(v) => setSelectedChildId(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a child" />
                                </SelectTrigger>
                                <SelectContent>
                                    {children.map((c) => (
                                        <SelectItem
                                            key={c.studentId}
                                            value={c.studentId}
                                        >
                                            {c.name} ({c.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* From */}
                    <div className="space-y-1">
                        <Label>From</Label>
                        <Input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>

                    {/* To */}
                    <div className="space-y-1">
                        <Label>To</Label>
                        <Input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-1">
                        <Label>Timezone</Label>
                        <Select
                            value={timezone}
                            onValueChange={setTimezone}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="+05:30">
                                    Asia/Colombo (+05:30)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* If no child, stop here */}
            {!selectedChildId ? null : (
                <div className="space-y-6">
                    <TeacherLessonCompletion
                        studentId={selectedChildId}
                    />
                    <TeacherAttentionSummary
                        studentId={selectedChildId}
                        from={from}
                        to={to}
                        timezone={timezone}
                    />
                    <TeacherEmotionSummary
                        studentId={selectedChildId}
                        from={from}
                        to={to}
                        timezone={timezone}
                    />
                </div>
            )}
        </div>
    );
}
