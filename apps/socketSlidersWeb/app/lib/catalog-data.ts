import catalogJson from "./catalog.json";

export interface CatalogItem {
  id: string;
  name: string;
  category: "rail" | "slider";
  description: string;
  stlPath: string;
  downloadUrl: string;
}

export const catalogItems: CatalogItem[] = catalogJson as CatalogItem[];
