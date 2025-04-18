
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Video, BookOpen, Download, ExternalLink, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock resources data
const RESOURCES = [
  {
    id: 1,
    title: 'Number Recognition Guide',
    type: 'document',
    category: 'numbers',
    format: 'PDF',
    description: 'A guide for parents to help children recognize and understand numbers.',
    url: '#',
    date: '2025-03-15',
    relatedModule: 'numbers-101'
  },
  {
    id: 2,
    title: 'Counting Songs Collection',
    type: 'audio',
    category: 'numbers',
    format: 'MP3',
    description: 'Fun songs to help children learn counting from 1 to 10.',
    url: '#',
    date: '2025-03-20',
    relatedModule: 'numbers-101'
  },
  {
    id: 3,
    title: 'ABC Recognition Activities',
    type: 'document',
    category: 'letters',
    format: 'PDF',
    description: 'Printable worksheets for practicing letter recognition.',
    url: '#',
    date: '2025-02-10',
    relatedModule: 'letters-101'
  },
  {
    id: 4,
    title: 'Colors in Our World',
    type: 'video',
    category: 'colors',
    format: 'MP4',
    description: 'An engaging video to help children identify colors in everyday objects.',
    url: '#',
    date: '2025-04-05',
    relatedModule: 'colors-101'
  },
  {
    id: 5,
    title: 'Understanding Emotions',
    type: 'document',
    category: 'emotions',
    format: 'PDF',
    description: 'A guide to help children recognize and name different emotions.',
    url: '#',
    date: '2025-03-25',
    relatedModule: 'emotions-101'
  },
  {
    id: 6,
    title: 'Shapes Around Us',
    type: 'video',
    category: 'shapes',
    format: 'MP4',
    description: 'Video content showing different shapes in everyday objects.',
    url: '#',
    date: '2025-04-10',
    relatedModule: 'shapes-101'
  },
  {
    id: 7,
    title: 'Alphabet Songs',
    type: 'audio',
    category: 'letters',
    format: 'MP3',
    description: 'Collection of songs to help learn the alphabet.',
    url: '#',
    date: '2025-03-18',
    relatedModule: 'letters-101'
  },
];

const ParentResources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // In a real app, this would fetch resources from an API
  const { data: resources = RESOURCES, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => Promise.resolve(RESOURCES),
  });
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'audio':
        return <Headphones className="h-5 w-5 text-purple-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Learning Resources</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="numbers">Numbers</TabsTrigger>
          <TabsTrigger value="letters">Letters</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="shapes">Shapes</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory}>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No resources found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery 
                  ? 'Try a different search term or category' 
                  : 'There are no resources available in this category yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="rounded-full bg-gray-100 p-2">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100">
                        {resource.format}
                      </div>
                    </div>
                    <CardTitle className="mt-3 text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Added: {new Date(resource.date).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {resource.type === 'document' && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentResources;
