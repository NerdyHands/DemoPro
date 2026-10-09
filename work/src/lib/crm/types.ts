export const CUSTOMER_STATUSES = ['Lead', 'Active', 'Inactive'] as const;
export const ESTIMATE_STATUSES = ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'] as const;
export const CONTRACT_STATUSES = [
  'Draft',
  'Sent',
  'Signed',
  'Active',
  'Completed',
  'Cancelled'
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  notes: string[];
};

export type Customer = {
  id: string;
  mongoId: string;
  name: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: CustomerStatus;
  createdTime: string;
};

export type Estimate = {
  id: string;
  mongoId: string;
  estimateNumber: string;
  title: string;
  description: string;
  propertyAddress: string;
  customerId: string;
  customerName: string;
  status: EstimateStatus;
  lineItems: LineItem[];
  subtotal: number;
  total: number;
  validUntil: string;
  notes: string;
  createdTime: string;
};

export type Contract = {
  id: string;
  mongoId: string;
  contractNumber: string;
  title: string;
  description: string;
  propertyAddress: string;
  customerId: string;
  customerName: string;
  estimateId: string;
  status: ContractStatus;
  lineItems: LineItem[];
  total: number;
  deposit: number;
  startDate: string;
  endDate: string;
  terms: string;
  notes: string;
  createdTime: string;
};

export type CustomerInput = {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: CustomerStatus;
  mongoId?: string;
};

export type EstimateInput = {
  estimateNumber?: string;
  title: string;
  description?: string;
  propertyAddress?: string;
  customerId: string;
  status?: EstimateStatus;
  lineItems?: LineItem[];
  validUntil?: string;
  notes?: string;
  mongoId?: string;
};

export type ContractInput = {
  contractNumber?: string;
  title: string;
  description?: string;
  propertyAddress?: string;
  customerId: string;
  estimateId?: string;
  status?: ContractStatus;
  lineItems?: LineItem[];
  deposit?: number;
  startDate?: string;
  endDate?: string;
  terms?: string;
  notes?: string;
  mongoId?: string;
};

export const CUSTOMER_LIST_FIELDS = [
  'Name',
  'First Name',
  'Last Name',
  'Business Name',
  'Email',
  'Phone',
  'Address',
  'Notes',
  'Status',
  'MongoId'
];

export const ESTIMATE_LIST_FIELDS = [
  'Estimate Number',
  'Title',
  'Property Address',
  'Customer',
  'Status',
  'Subtotal',
  'Total',
  'Valid Until',
  'Notes',
  'MongoId'
];

export const CONTRACT_LIST_FIELDS = [
  'Contract Number',
  'Title',
  'Property Address',
  'Customer',
  'Estimate',
  'Status',
  'Total',
  'Deposit',
  'Start Date',
  'End Date',
  'Notes',
  'MongoId'
];
