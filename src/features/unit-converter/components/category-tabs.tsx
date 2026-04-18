"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "../lib/units";
import type { Category } from "../lib/types";

type CategoryTabsProps = {
  category: Category;
  onCategoryChange: (category: Category) => void;
};

export function CategoryTabs({
  category,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <Tabs
      value={category}
      onValueChange={(v) => onCategoryChange(v as Category)}
    >
      <TabsList className="flex flex-wrap h-auto gap-1">
        {CATEGORIES.map((cat) => (
          <TabsTrigger key={cat.id} value={cat.id}>
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
