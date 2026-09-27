const HOUSE_DEMO_CATEGORIES = [
  { id: 'utility_disconnects', label: '1. Utility Disconnects and Coordination' },
  { id: 'pre_permit', label: '2. Pre-Permit / Pre-Construction' },
  { id: 'erosion_control', label: '3. Erosion & Sediment Control' },
  { id: 'mobilization', label: '4. Mobilization' },
  { id: 'structure_demolition', label: '5. Structure Demolition' },
  { id: 'site_restoration', label: '6. Site Restoration' },
  { id: 'tree_removal', label: '7. Tree Removal' },
  { id: 'concrete_driveway', label: '8. Concrete Driveway Removal' },
];

function categoryIdFromLegacyNote(notes) {
  const categoryNote = (notes || []).find((note) => /^Category:\s*/i.test(String(note || '').trim()));
  if (!categoryNote) return '';
  const text = String(categoryNote).replace(/^Category:\s*/i, '').trim();
  const match = HOUSE_DEMO_CATEGORIES.find((c) => c.label === text);
  return match?.id || '';
}

function resolveItemCategory(item) {
  return item?.category || categoryIdFromLegacyNote(item?.notes);
}

function groupLineItemsByCategory(lineItems) {
  const items = Array.isArray(lineItems) ? lineItems : [];
  const groups = HOUSE_DEMO_CATEGORIES.map((category) => ({
    ...category,
    items: items.filter((item) => resolveItemCategory(item) === category.id),
  })).filter((group) => group.items.length > 0);

  const uncategorized = items.filter((item) => {
    const categoryId = resolveItemCategory(item);
    return !categoryId || !HOUSE_DEMO_CATEGORIES.some((c) => c.id === categoryId);
  });

  if (uncategorized.length > 0) {
    groups.push({ id: 'uncategorized', label: 'Other', items: uncategorized });
  }

  return groups;
}

function stripCategoryNotes(notes) {
  return (notes || []).filter((note) => note && !/^Category:\s*/i.test(String(note).trim()));
}

module.exports = {
  HOUSE_DEMO_CATEGORIES,
  groupLineItemsByCategory,
  stripCategoryNotes,
};
