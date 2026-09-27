const { HOUSE_DEMO_CATEGORIES } = require('./houseDemolitionCategories');

const HOUSE_DEMO_SCOPE = `Provide all labor, equipment, supervision, hauling, disposal, permitting coordination, utility coordination, erosion control, demolition, site cleanup, and grading necessary for the complete demolition and removal of the existing residential structure and associated improvements.`;

const CATEGORY_CONTENT = {
  utility_disconnects: {
    intro: 'Before structural demolition begins, required utilities will be located, disconnected, terminated, or capped as required by the applicable utility companies and municipality.',
    subtotalLabel: 'Utilities Subtotal',
    footnote: 'Utility company charges or unusually deep utility services that exceed these allowances will be billed only after owner approval.',
    tableType: 'standard',
  },
  pre_permit: {
    subtotalLabel: 'Pre-Permit Subtotal',
    tableType: 'standard',
  },
  erosion_control: {
    subtotalLabel: 'Erosion Control Subtotal',
    footnote: 'Erosion-control devices will be maintained during demolition and removed or left in place as required by the permit.',
    tableType: 'standard',
  },
  mobilization: {
    subtotalLabel: 'Mobilization Subtotal',
    tableType: 'standard',
  },
  structure_demolition: {
    subtotalLabel: 'Structure Demolition Subtotal',
    tableType: 'standard',
  },
  site_restoration: {
    subtotalLabel: 'Site Restoration Subtotal',
    tableType: 'standard',
  },
  tree_removal: {
    intro: 'Remove designated trees that interfere with the demolition or final site condition.',
    subtotalLabel: 'Tree Removal Subtotal',
    footnote: 'Price assumes trees are reasonably accessible to demolition equipment and do not require crane removal, utility-line work, or specialized climbing.',
    tableType: 'tree_removal',
  },
  concrete_driveway: {
    intro: 'Estimated allowance based upon approximately 1,000 sq. ft. of existing driveway concrete.',
    subtotalLabel: 'Estimated Driveway Subtotal',
    footnote: 'Final price will be adjusted based upon field-measured square footage.',
    tableType: 'concrete_driveway',
  },
};

const PAYMENT_SCHEDULE = [
  {
    label: 'Payment 1 — Pre-Permit Initiation',
    percent: 0.05,
    due: 'Due upon contract execution.',
    covers: 'Covers initial project setup, permit administration, utility coordination, project management, and other pre-construction expenses.',
  },
  {
    label: 'Payment 2 — Permit Approval / Pre-Mobilization',
    percent: 0.2,
    due: 'Due after required demolition permits have been approved and before equipment is scheduled for mobilization.',
    covers: 'Covers permit-related costs, erosion-control preparation, utility-disconnect coordination, disposal planning, equipment scheduling, and project setup.',
  },
  {
    label: 'Payment 3 — Mobilization',
    percent: 0.25,
    due: 'Due when equipment and demolition crew mobilize to the property.',
    covers: 'Covers equipment mobilization, erosion-control installation, tree removal, initial site preparation, and commencement of demolition.',
  },
  {
    label: 'Payment 4 — Structure Demolished',
    percent: 0.4,
    due: 'Due after the primary structure and major demolition debris have been removed from the property.',
  },
  {
    label: 'Payment 5 — Final Completion',
    percent: 0.1,
    due: 'Due after final grading, cleanup, stabilization, and completion of the contracted demolition work.',
  },
];

const DEFAULT_EXCLUSIONS = [
  'Underground storage tanks',
  'Contaminated soil',
  'Septic tank removal or abandonment',
  'Well abandonment',
  'Unexpected underground structures',
  'Excessively reinforced concrete',
  'Removal of buried construction debris not associated with the current demolition',
  'Utility-company fees exceeding stated allowances',
  'Traffic-control plans or police details',
  'Road or sidewalk closure permits',
  'Removal of trees requiring specialized climbing or crane service',
  'Rock excavation',
  'Imported structural fill beyond normal demolition backfill requirements',
];

function getCategoryContent(categoryId) {
  return CATEGORY_CONTENT[categoryId] || {
    subtotalLabel: 'Subtotal',
    tableType: 'standard',
  };
}

function summaryCategoryLabel(categoryId) {
  const full = HOUSE_DEMO_CATEGORIES.find((c) => c.id === categoryId)?.label || '';
  return full.replace(/^\d+\.\s*/, '');
}

function stripCategoryNotes(notes) {
  return (notes || []).filter((note) => note && !/^Category:\s*/i.test(String(note).trim()));
}

function parseTermsSections(notesText) {
  if (!notesText || typeof notesText !== 'string') {
    return [];
  }

  const cleaned = notesText
    .replace(/PAYMENT SCHEDULE[\s\S]*?(?=IMPORTANT EXCLUSIONS|OWNER RESPONSIBILITIES|CHANGE ORDERS|PERMIT AND UTILITY ALLOWANCES|$)/i, '')
    .trim();

  const sectionPattern = /(IMPORTANT EXCLUSIONS & CONDITIONS|OWNER RESPONSIBILITIES|CHANGE ORDERS|PERMIT AND UTILITY ALLOWANCES)/g;
  const matches = [...cleaned.matchAll(sectionPattern)];
  if (matches.length === 0) {
    return [];
  }

  const sections = [];
  matches.forEach((match, index) => {
    const title = match[1];
    const start = match.index + title.length;
    const end = matches[index + 1]?.index ?? cleaned.length;
    const body = cleaned.slice(start, end).trim();
    sections.push({ title, body });
  });

  sections.forEach((section) => {
    if (/PERMIT AND UTILITY/i.test(section.title)) {
      section.body = section.body.replace(
        /\s*The contract amount is based upon the assumptions and allowances stated above and is subject to final site verification\.?\s*$/i,
        ''
      ).trim();
    }
  });

  return sections;
}

function parseExclusionBullets(body) {
  const introMatch = body.match(/The following are excluded unless specifically included by written change order:\s*/i);
  const remainder = introMatch ? body.slice(introMatch.index + introMatch[0].length) : body;
  const closingMatch = remainder.match(/Any concealed or unforeseen condition/i);
  const listText = closingMatch ? remainder.slice(0, closingMatch.index).trim() : remainder.trim();
  const closing = closingMatch ? remainder.slice(closingMatch.index).trim() : '';

  let bullets = DEFAULT_EXCLUSIONS;
  if (listText.includes(';')) {
    bullets = listText
      .split(';')
      .map((item) => {
        const trimmed = item.trim().replace(/\.$/, '');
        if (!trimmed) return '';
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      })
      .filter(Boolean);
  }

  return { intro: introMatch ? introMatch[0].trim() : 'The following are excluded unless specifically included by written change order:', bullets, closing };
}

module.exports = {
  HOUSE_DEMO_SCOPE,
  CATEGORY_CONTENT,
  PAYMENT_SCHEDULE,
  DEFAULT_EXCLUSIONS,
  getCategoryContent,
  summaryCategoryLabel,
  stripCategoryNotes,
  parseTermsSections,
  parseExclusionBullets,
};
