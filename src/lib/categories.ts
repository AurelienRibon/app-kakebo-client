import categories from '../meta/categories.json';

const categoriesMap = indexCategoryDefsByName();

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface CategoryDef {
  name: string;
  icon: string;
  infrequent?: boolean;
}

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

export function getCategoryDefs(): CategoryDef[] {
  return categories as CategoryDef[];
}

export function getCategoryDef(name: string): CategoryDef {
  return categoriesMap.get(name) ?? { name, icon: 'mdi-help-circle' };
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function indexCategoryDefsByName(): Map<string, CategoryDef> {
  return new Map(categories.map((it) => [it.name, it]));
}
