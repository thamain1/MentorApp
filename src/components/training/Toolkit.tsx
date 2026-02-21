import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Play,
  Lightbulb,
  Download,
  ChevronRight,
  Search,
  Folder,
} from 'lucide-react';
import { AppShell, Header } from '../layout';
import { Card, Input } from '../ui';
import { mockToolkitResources, type ToolkitResource } from '../../data/mockData';

type ResourceFilter = 'all' | 'guide' | 'template' | 'activity' | 'video';

export function Toolkit() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ResourceFilter>('all');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(
    new Set(mockToolkitResources.map((r) => r.category))
  ).sort();

  const filteredResources = mockToolkitResources.filter((resource) => {
    const matchesSearch =
      searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' || resource.type === filter;

    return matchesSearch && matchesFilter;
  });

  // Group by category
  const resourcesByCategory = categories.reduce((acc, category) => {
    const resources = filteredResources.filter((r) => r.category === category);
    if (resources.length > 0) {
      acc[category] = resources;
    }
    return acc;
  }, {} as Record<string, ToolkitResource[]>);

  const getTypeIcon = (type: ToolkitResource['type']) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="w-5 h-5" />;
      case 'template':
        return <FileText className="w-5 h-5" />;
      case 'activity':
        return <Lightbulb className="w-5 h-5" />;
      case 'video':
        return <Play className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ToolkitResource['type']) => {
    switch (type) {
      case 'guide':
        return 'bg-blue-100 text-blue-600';
      case 'template':
        return 'bg-green-100 text-green-600';
      case 'activity':
        return 'bg-amber-100 text-amber-600';
      case 'video':
        return 'bg-red-100 text-red-600';
    }
  };

  return (
    <AppShell>
      <Header title="Facilitation Toolkit" showBack />

      <div className="p-4 space-y-4">
        {/* Intro */}
        <Card className="bg-gradient-to-br from-brand-500 to-brand-600 border-none text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">Mentor Resources</h2>
              <p className="text-sm text-white/80">
                Templates, guides, and activities to help you facilitate effective mentoring sessions.
              </p>
            </div>
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-iron-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'All' },
            { value: 'guide', label: 'Guides' },
            { value: 'template', label: 'Templates' },
            { value: 'activity', label: 'Activities' },
            { value: 'video', label: 'Videos' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as ResourceFilter)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resources by Category */}
        {Object.keys(resourcesByCategory).length === 0 ? (
          <Card className="p-6 text-center">
            <Folder className="w-10 h-10 text-iron-300 mx-auto mb-2" />
            <p className="text-iron-600 font-medium mb-1">No resources found</p>
            <p className="text-sm text-iron-500">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          Object.entries(resourcesByCategory).map(([category, resources]) => (
            <section key={category}>
              <h3 className="text-sm font-medium text-iron-500 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isExpanded={expandedResource === resource.id}
                    onToggle={() =>
                      setExpandedResource(
                        expandedResource === resource.id ? null : resource.id
                      )
                    }
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}

interface ResourceCardProps {
  resource: ToolkitResource;
  isExpanded: boolean;
  onToggle: () => void;
  getTypeIcon: (type: ToolkitResource['type']) => React.ReactNode;
  getTypeColor: (type: ToolkitResource['type']) => string;
}

function ResourceCard({
  resource,
  isExpanded,
  onToggle,
  getTypeIcon,
  getTypeColor,
}: ResourceCardProps) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(resource.type)}`}>
          {getTypeIcon(resource.type)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-iron-900 truncate">{resource.title}</h4>
          <p className="text-sm text-iron-500 truncate">{resource.description}</p>
        </div>

        <ChevronRight
          className={`w-5 h-5 text-iron-400 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {isExpanded && resource.content && (
        <div className="px-4 pb-4 pt-0">
          <div className="p-4 bg-iron-50 rounded-lg">
            <pre className="text-sm text-iron-700 whitespace-pre-wrap font-sans">
              {resource.content}
            </pre>
          </div>
          {resource.downloadUrl && (
            <button className="mt-3 flex items-center gap-2 text-sm text-brand-600 font-medium">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>
      )}

      {isExpanded && !resource.content && (
        <div className="px-4 pb-4 pt-0">
          <div className="p-4 bg-iron-50 rounded-lg text-center">
            <p className="text-sm text-iron-500">Full content available in the app.</p>
            <button className="mt-2 text-sm text-brand-600 font-medium">
              Open Resource
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
