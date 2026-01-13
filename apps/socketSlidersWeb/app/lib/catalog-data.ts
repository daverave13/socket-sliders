export interface CatalogItem {
  id: string;
  name: string;
  category: "rail" | "slider";
  description: string;
  stlPath: string;
  downloadUrl: string;
}

export const catalogItems: CatalogItem[] = [
  {
    id: "rail-1x1",
    name: "Gridfinity Rail 1x1",
    category: "rail",
    description: "Single-unit Gridfinity rail for socket sliders. Perfect for small toolboxes or tight spaces.",
    stlPath: "/STL/gridfinity - rail 1x1.stl",
    downloadUrl: "#",
  },
  {
    id: "rail-1x2",
    name: "Gridfinity Rail 1x2",
    category: "rail",
    description: "Two-unit Gridfinity rail for socket sliders. Ideal for compact socket sets.",
    stlPath: "/STL/gridfinity - rail 1x2.stl",
    downloadUrl: "#",
  },
  {
    id: "rail-1x3",
    name: "Gridfinity Rail 1x3",
    category: "rail",
    description: "Three-unit Gridfinity rail for socket sliders. Great for medium socket collections.",
    stlPath: "/STL/gridfinity - rail 1x3.stl",
    downloadUrl: "#",
  },
  {
    id: "rail-1x4",
    name: "Gridfinity Rail 1x4",
    category: "rail",
    description: "Four-unit Gridfinity rail for socket sliders. Popular choice for standard socket sets.",
    stlPath: "/STL/gridfinity - rail 1x4.stl",
    downloadUrl: "#",
  },
  {
    id: "rail-1x5",
    name: "Gridfinity Rail 1x5",
    category: "rail",
    description: "Five-unit Gridfinity rail for socket sliders. Extended length for larger collections.",
    stlPath: "/STL/gridfinity - rail 1x5.stl",
    downloadUrl: "#",
  },
  {
    id: "rail-1x6",
    name: "Gridfinity Rail 1x6",
    category: "rail",
    description: "Six-unit Gridfinity rail for socket sliders. Maximum length for comprehensive socket organization.",
    stlPath: "/STL/gridfinity - rail 1x6.stl",
    downloadUrl: "#",
  },
];
