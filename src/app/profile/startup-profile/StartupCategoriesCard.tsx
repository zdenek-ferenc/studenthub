"use client";

type CategoryData = {
  Category: {
    id: string;
    name: string;
  }
};

export default function StartupCategoriesCard({ categories }: { categories: CategoryData[] }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xs">
      <h3 className="text-2xl font-light mb-4 text-[var(--barva-tmava)]">Kategorie</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => <span key={cat.Category.id} className="px-4 py-1 text-[var(--barva-primarni)] rounded-full font-light outline-2">{cat.Category.name}</span>)}
      </div>
    </div>
  );
}