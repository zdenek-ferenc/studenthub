"use client";

type CategoryData = {
  Category: {
    id: string;
    name: string;
  }
};

export default function StartupCategoriesCard({ categories }: { categories: CategoryData[] }) {
  return (
    <div className="bg-white p-8 rounded-2xl mt-3 shadow-xs">
      <h3 className="text-2xl mb-4 text-[var(--barva-tmava)] font-semibold">Kategorie</h3>
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => <span key={cat.Category.id} className="px-4 py-1 bg-[var(--barva-svetle-pozadi)] border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full outline-2 transition-colors duration-200 font-semibold">{cat.Category.name}</span>)}
      </div>
    </div>
  );
}