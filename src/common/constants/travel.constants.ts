export const Climate = {
  TROPICAL: 'TROPICAL',
  COLD: 'COLD',
  DRY: 'DRY',
  MODERATE: 'MODERATE',
} as const;
export type Climate = (typeof Climate)[keyof typeof Climate];

export const TravelStyle = {
  ADVENTURE: 'ADVENTURE',
  RELAXATION: 'RELAXATION',
  CULTURAL: 'CULTURAL',
  BUSINESS: 'BUSINESS',
  NIGHTLIFE: 'NIGHTLIFE',
} as const;
export type TravelStyle = (typeof TravelStyle)[keyof typeof TravelStyle];

export const BudgetRange = {
  BUDGET: 'BUDGET',
  MID_RANGE: 'MID_RANGE',
  LUXURY: 'LUXURY',
} as const;
export type BudgetRange = (typeof BudgetRange)[keyof typeof BudgetRange];
