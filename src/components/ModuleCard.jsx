
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, BookOpen, Heart, Palette, Star } from "lucide-react";
import { Link } from "react-router-dom";

const ModuleCard = ({ module }) => {
  const getCategoryIcon = () => {
    switch (module.category) {
      case "numbers":
        return <span className="text-3xl">123</span>;
      case "letters":
        return <Book className="h-8 w-8 text-happy-500" />;
      case "emotions":
        return <Heart className="h-8 w-8 text-destructive" />;
      case "colors":
        return <Palette className="h-8 w-8 text-nature-500" />;
      default:
        return <BookOpen className="h-8 w-8 text-happy-500" />;
    }
  };

  const getCategoryColor = () => {
    switch (module.category) {
      case "numbers":
        return "bg-happy-100 text-happy-800 border-happy-300";
      case "letters":
        return "bg-sunny-100 text-sunny-800 border-sunny-300";
      case "emotions":
        return "bg-red-100 text-red-800 border-red-300";
      case "colors":
        return "bg-nature-100 text-nature-800 border-nature-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Link to={`/modules/${module.id}`}>
      <Card className={`overflow-hidden card-hover ${getCategoryColor()}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              {getCategoryIcon()}
            </div>
            <Badge variant="outline" className="bg-white">
              {module.level}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-3">{module.title}</CardTitle>
          <CardDescription className="text-base opacity-90">
            {module.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{module.exercises.length} exercises</p>
        </CardContent>
        <CardFooter className="bg-white/50 pt-2">
          <div className="flex items-center text-sm gap-1 text-happy-700">
            <Star className="h-4 w-4 fill-sunny-400 text-sunny-400" />
            <Star className="h-4 w-4 fill-sunny-400 text-sunny-400" />
            <Star className="h-4 w-4 fill-sunny-400 text-sunny-400" />
            <Star className="h-4 w-4" />
            <Star className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ModuleCard;
