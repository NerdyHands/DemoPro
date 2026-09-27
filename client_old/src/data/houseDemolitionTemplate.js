/**
 * Complete house demolition proposal template
 * based on the House Demolition Proposal scope document.
 * Amounts are editable defaults for new estimates.
 */

export const HOUSE_DEMO_TEMPLATE_TYPE = 'house_demolition';

export const COMPANY = {
  legalName: 'Castleton Real Estate, LLC dba Mr Demo Pro',
  brandName: 'Mr Demo Pro',
  license: 'Class A - Residential Building Contractor, DPOR License #2705161677',
  address: '24922 Castleton Dr Chantilly VA 20152',
  phone: '757-848-4559',
};

export const HOUSE_DEMO_SCOPE = `Provide all labor, equipment, supervision, hauling, disposal, permitting coordination, utility coordination, erosion control, demolition, site cleanup, and grading necessary for the complete demolition and removal of the existing residential structure and associated improvements.`;

export const HOUSE_DEMO_CATEGORIES = [
  { id: 'utility_disconnects', label: '1. Utility Disconnects and Coordination' },
  { id: 'pre_permit', label: '2. Pre-Permit / Pre-Construction' },
  { id: 'erosion_control', label: '3. Erosion & Sediment Control' },
  { id: 'mobilization', label: '4. Mobilization' },
  { id: 'structure_demolition', label: '5. Structure Demolition' },
  { id: 'site_restoration', label: '6. Site Restoration' },
  { id: 'tree_removal', label: '7. Tree Removal' },
  { id: 'concrete_driveway', label: '8. Concrete Driveway Removal' },
];

export function getCategoryLabel(categoryId) {
  return HOUSE_DEMO_CATEGORIES.find((c) => c.id === categoryId)?.label || '';
}

export function categoryIdFromLegacyNote(notes) {
  const categoryNote = (notes || []).find((note) => /^Category:\s*/i.test(String(note || '').trim()));
  if (!categoryNote) return '';
  const text = String(categoryNote).replace(/^Category:\s*/i, '').trim();
  const match = HOUSE_DEMO_CATEGORIES.find((c) => c.label === text);
  return match?.id || '';
}

export function stripCategoryNotes(notes) {
  return (notes || []).filter((note) => note && !/^Category:\s*/i.test(String(note).trim()));
}

export const HOUSE_DEMO_LINE_ITEMS = [
  {
    category: 'utility_disconnects',
    description: 'Miss Utility / Utility Location Coordination',
    quantity: 1,
    unitPrice: 150,
    notes: [
      'Coordinate utility marking and verify known underground utility locations prior to demolition.',
    ],
  },
  {
    category: 'utility_disconnects',
    description: 'Pre-Demolition Site Review',
    quantity: 1,
    unitPrice: 500,
    notes: [
      'Initial site inspection, demolition planning, access review, equipment planning, and project coordination.',
    ],
  },
  {
    category: 'utility_disconnects',
    description: 'Electrical/Gas/Water/Sewer Disconnect Allowance',
    quantity: 1,
    unitPrice: 300,
    notes: [
      'Coordination and allowance for permanent electrical service disconnect/removal.',
    ],
  },
  {
    category: 'utility_disconnects',
    description: 'Water / Sewer Disconnect & Cap Allowance',
    quantity: 1,
    unitPrice: 1500,
    notes: [
      'Disconnect/cap water and sanitary sewer services as required. Includes basic excavation and capping allowance.',
    ],
  },
  {
    category: 'pre_permit',
    description: 'Permit Preparation & Administration',
    quantity: 1,
    unitPrice: 750,
    notes: [
      'Preparation and submission of required demolition permit documentation and coordination with the applicable municipality. Includes contractor administrative time.',
    ],
  },
  {
    category: 'pre_permit',
    description: 'Demolition Permit Allowance',
    quantity: 1,
    unitPrice: 750,
    notes: [
      'Allowance for local demolition/building permit fees. Actual governmental fees above allowance will be handled by change order.',
    ],
  },
  {
    category: 'erosion_control',
    description: 'Erosion Control Permit / Plan Allowance',
    quantity: 1,
    unitPrice: 750,
    notes: [
      'Allowance for erosion and sediment control documentation, plan review, or related permit fees where required.',
    ],
  },
  {
    category: 'erosion_control',
    description: 'Erosion Control Installation',
    quantity: 1,
    unitPrice: 1750,
    notes: [
      'Furnish and install required silt fence, construction entrance, inlet protection, stabilization materials, and related temporary controls, if needed.',
      'Erosion-control devices will be maintained during demolition and removed or left in place as required by the permit.',
    ],
  },
  {
    category: 'mobilization',
    description: 'Equipment & Crew Mobilization',
    quantity: 1,
    unitPrice: 2500,
    notes: [
      'Mobilization of excavator, skid steer, trucks, attachments, safety equipment, dumpsters/containers, and demolition crew to the project.',
    ],
  },
  {
    category: 'structure_demolition',
    description: 'Residential Structure Demolition',
    quantity: 1,
    unitPrice: 14000,
    notes: [
      'Mechanical demolition of existing residence including walls, roof structure, floors, interior finishes, framing, fixtures, cabinetry, and other normal residential building components.',
    ],
  },
  {
    category: 'structure_demolition',
    description: 'Debris Loading, Hauling & Disposal',
    quantity: 1,
    unitPrice: 7500,
    notes: [
      'Load, transport, and legally dispose of normal demolition debris at approved disposal/recycling facilities. Includes estimated standard tipping fees.',
    ],
  },
  {
    category: 'site_restoration',
    description: 'Backfill & Rough Grading',
    quantity: 1,
    unitPrice: 2000,
    notes: [
      'Backfill foundation voids as required and rough-grade demolition area to provide positive drainage and a generally level site.',
    ],
  },
  {
    category: 'site_restoration',
    description: 'Topsoil / Seed / Straw Allowance',
    quantity: 1,
    unitPrice: 1500,
    notes: [
      'Provide basic disturbed-area stabilization including topsoil where required, seed, and straw.',
    ],
  },
  {
    category: 'site_restoration',
    description: 'Final Cleanup',
    quantity: 1,
    unitPrice: 750,
    notes: [
      'Final collection of visible demolition debris and construction-related materials from immediate work area.',
    ],
  },
  {
    category: 'tree_removal',
    description: 'Tree Removal',
    quantity: 2,
    unitPrice: 500,
    notes: [
      'Tree removal, including cutting, equipment handling, loading, and disposal.',
      'Price assumes trees are reasonably accessible to demolition equipment and do not require crane removal, utility-line work, or specialized climbing.',
    ],
  },
  {
    category: 'concrete_driveway',
    description: 'Concrete Driveway Removal',
    quantity: 1000,
    unitPrice: 4.5,
    notes: [
      'Break, remove, load, haul, and dispose of existing concrete driveway.',
    ],
  },
];

export const HOUSE_DEMO_NOTES = `PAYMENT SCHEDULE
Payment 1 — Pre-Permit Initiation: 5% due upon contract execution. Covers initial project setup, permit administration, utility coordination, project management, and other pre-construction expenses.
Payment 2 — Permit Approval / Pre-Mobilization: 20% due after required demolition permits have been approved and before equipment is scheduled for mobilization.
Payment 3 — Mobilization: 25% due when equipment and demolition crew mobilize to the property.
Payment 4 — Structure Demolished: 40% due after the primary structure and major demolition debris have been removed from the property.
Payment 5 — Final Completion: 10% due after final grading, cleanup, stabilization, and completion of the contracted demolition work.

IMPORTANT EXCLUSIONS & CONDITIONS
The following are excluded unless specifically included by written change order: underground storage tanks; contaminated soil; septic tank removal or abandonment; well abandonment; unexpected underground structures; excessively reinforced concrete; removal of buried construction debris not associated with the current demolition; utility-company fees exceeding stated allowances; traffic-control plans or police details; road or sidewalk closure permits; removal of trees requiring specialized climbing or crane service; rock excavation; imported structural fill beyond normal demolition backfill requirements.
Any concealed or unforeseen condition will be documented and presented to the owner before additional work is performed.

OWNER RESPONSIBILITIES
Owner shall provide legal access to the property and disclose any underground tanks, septic systems, wells, easements, private utilities, or other unusual site conditions.

CHANGE ORDERS
Work outside the stated scope will require a written change order identifying the additional work and price before proceeding, except where immediate action is required to protect life, property, or public safety.

PERMIT AND UTILITY ALLOWANCES
Permit, inspection, erosion-control, and utility-disconnection costs listed in this proposal are allowances. If actual third-party or governmental charges are less than the allowance, the contract may be credited accordingly. If actual charges exceed the allowance, the difference will be documented and submitted for approval.

The contract amount is based upon the assumptions and allowances stated above and is subject to final site verification.`;

export const PAYMENT_SCHEDULE = [
  { label: 'Payment 1 — Pre-Permit Initiation', percent: 0.05, due: 'Due upon contract execution.' },
  { label: 'Payment 2 — Permit Approval / Pre-Mobilization', percent: 0.2, due: 'Due after required demolition permits have been approved and before equipment is scheduled for mobilization.' },
  { label: 'Payment 3 — Mobilization', percent: 0.25, due: 'Due when equipment and demolition crew mobilize to the property.' },
  { label: 'Payment 4 — Structure Demolished', percent: 0.4, due: 'Due after the primary structure and major demolition debris have been removed from the property.' },
  { label: 'Payment 5 — Final Completion', percent: 0.1, due: 'Due after final grading, cleanup, stabilization, and completion of the contracted demolition work.' },
];

export function buildHouseDemoLineItems() {
  return HOUSE_DEMO_LINE_ITEMS.map((item, index) => ({
    id: index + 1,
    category: item.category,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
    notes: [...(item.notes || [])],
  }));
}

export function getHouseDemoTemplateDefaults() {
  return {
    title: 'House Demolition Proposal',
    description: HOUSE_DEMO_SCOPE,
    notes: HOUSE_DEMO_NOTES,
    templateType: HOUSE_DEMO_TEMPLATE_TYPE,
    lineItems: buildHouseDemoLineItems(),
  };
}
