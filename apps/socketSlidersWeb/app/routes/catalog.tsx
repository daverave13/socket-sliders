import { useState, useMemo } from "react";
import type { Route } from "./+types/catalog";
import { Input } from "~/components/ui/input";
import { FolderOpen, Search } from "lucide-react";
import { CatalogCard } from "~/components/CatalogCard";
import { catalogItems } from "~/lib/catalog-data";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "STL Catalog - SocketSliders" },
    {
      name: "description",
      content: "Browse and download ready-to-print STL files for Gridfinity socket organizers",
    },
  ];
}

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return catalogItems;

    const query = searchQuery.toLowerCase();
    return catalogItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <FolderOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-3">STL Catalog</h1>
          <p className="text-muted-foreground text-xl">
            Browse and download ready-to-print STL files
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Results count */}
        <p className="text-muted-foreground text-sm mb-6">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
        </p>

        {/* Grid of cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <CatalogCard key={item.id} item={item} />
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No items found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
