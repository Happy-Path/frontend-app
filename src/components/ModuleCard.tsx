// src/components/…/ModuleCard.tsx
import { LearningModule } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, BookOpen, Heart, Palette, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
    module: LearningModule;
}

const ModuleCard = ({ module }: ModuleCardProps) => {
    // Some older data shapes may not have these fields – use safe fallbacks.
    const anyModule = module as any;

    const levelLabel: string =
        anyModule.level ??
        anyModule.difficulty ??
        "General";

    const exercisesCount: number =
        Array.isArray(anyModule.exercises)
            ? anyModule.exercises.length
            : typeof anyModule.lessonCount === "number"
                ? anyModule.lessonCount
                : 0;

    const getCategoryIcon = () => {
        switch (module.category) {
            case "numbers":
                return (
                    <span className="text-base font-semibold tracking-tight text-happy-700">
            123
          </span>
                );
            case "letters":
                return <Book className="h-5 w-5 text-happy-700" />;
            case "emotions":
                return <Heart className="h-5 w-5 text-red-500" />;
            case "colors":
                return <Palette className="h-5 w-5 text-emerald-600" />;
            default:
                return <BookOpen className="h-5 w-5 text-happy-700" />;
        }
    };

    const getAccentClasses = () => {
        switch (module.category) {
            case "numbers":
                return {
                    pill: "bg-happy-100 text-happy-800",
                    border: "border-happy-200",
                    pillRing: "ring-happy-200",
                };
            case "letters":
                return {
                    pill: "bg-sunny-100 text-sunny-800",
                    border: "border-sunny-200",
                    pillRing: "ring-sunny-200",
                };
            case "emotions":
                return {
                    pill: "bg-rose-100 text-rose-800",
                    border: "border-rose-200",
                    pillRing: "ring-rose-200",
                };
            case "colors":
                return {
                    pill: "bg-emerald-100 text-emerald-800",
                    border: "border-emerald-200",
                    pillRing: "ring-emerald-200",
                };
            default:
                return {
                    pill: "bg-slate-100 text-slate-800",
                    border: "border-slate-200",
                    pillRing: "ring-slate-200",
                };
        }
    };

    const accent = getAccentClasses();

    return (
        <Link to={`/modules/${module.id}`}>
            <Card
                className={`group relative overflow-hidden rounded-2xl border ${accent.border} bg-white transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
                {/* subtle top accent bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-happy-300 via-sky-300 to-emerald-300 opacity-70" />

                <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-3">
                        <div
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent.pill} ring-2 ${accent.pillRing} ring-offset-2 ring-offset-white shadow-sm`}
                        >
                            {getCategoryIcon()}
                        </div>

                        <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-xs font-medium"
                        >
                            {levelLabel}
                        </Badge>
                    </div>

                    <CardTitle className="mt-3 text-lg font-semibold text-slate-900">
                        {module.title}
                    </CardTitle>
                    {module.description && (
                        <CardDescription className="mt-1 text-sm text-slate-600">
                            {module.description}
                        </CardDescription>
                    )}
                </CardHeader>

                <CardContent className="pt-0 pb-2">
                    <p className="text-xs font-medium text-slate-500">
                        {exercisesCount > 0
                            ? `${exercisesCount} activity${
                                exercisesCount === 1 ? "" : " activities"
                            }`
                            : "Interactive activities included"}
                    </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t bg-slate-50/60 px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-happy-700">
                        <Star className="h-4 w-4 fill-sunny-400 text-sunny-400" />
                        <Star className="h-4 w-4 fill-sunny-400 text-sunny-400" />
                        <Star className="h-4 w-4 fill-sunny-400 text-sunny-400" />
                        <Star className="h-4 w-4 text-slate-300" />
                        <Star className="h-4 w-4 text-slate-300" />
                    </div>
                    <span className="text-xs font-medium text-happy-700 group-hover:underline">
            Open module
          </span>
                </CardFooter>
            </Card>
        </Link>
    );
};

export default ModuleCard;
