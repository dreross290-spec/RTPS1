/**
 * Agreement / e-sign types
 */
export interface Agreement {
  id: string;
  token: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  taxYear: number;
  preparerName: string;
  firmName: string;
  agreementText: string;
  status: "PENDING" | "SIGNED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
  otpCode?: string;
  otpVerified?: boolean;
  signatureDataUrl?: string;
  signedAt?: string;
  ipAddress?: string;
  retentionUrl?: string;
}

/**
 * Refund record types
 */
export type RefundStatus = "FUNDED" | "DUE_SOON" | "IN_PIPELINE";

export interface RefundRecord {
  id: string;
  clientName: string;
  ssn: string; // last 4 digits only for display
  taxYear: number;
  filingStatus: string;
  refundAmount: number;
  status: RefundStatus;
  irsStatus?: string;
  federalStatus?: string;
  bankProductType?: string;
  etin?: string;
  submittedAt: string;
  expectedDate?: string;
  fundedAt?: string;
  updatedAt: string;
}

/**
 * Bank product types (Langley FCU simulation)
 */
export interface BankProductApplication {
  id: string;
  clientName: string;
  ssn: string;
  taxYear: number;
  refundAmount: number;
  eroFee: number;
  preparerFee: number;
  bankFee: number;
  netToClient: number;
  routingNumber: string;
  accountNumber: string;
  productType: "RAL" | "RAC" | "ERC";
  status: "PENDING" | "APPROVED" | "FUNDED" | "DECLINED";
  settlementInstructions?: string;
  kycPassed?: boolean;
  amlPassed?: boolean;
  consentObtained?: boolean;
  complianceFlags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * TaxSlayer / IRS integration types
 */
export interface TaxSlayerCredentials {
  username: string;
  officeId: string;
  apiBaseUrl: string;
  connected: boolean;
  lastChecked?: string;
}

export interface IrsApplicationSummary {
  firmName: string;
  ein: string;
  tcc: string;
  etin: string;
  apiKey: string; // masked
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  submissionsToday: number;
  acceptedToday: number;
  rejectedToday: number;
  lastUpdated: string;
}
