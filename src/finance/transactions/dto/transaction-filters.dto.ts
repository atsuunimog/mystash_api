export enum CurrencyFilter {
  USD = 'USD',
  NGN = 'NGN',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum EntryFilter {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum SourceTypeFilter {
  CARD = 'Card',
  WALLET = 'Wallet',
  BANK = 'Bank',
  TRANSFER = 'Transfer',
  PAYMENT = 'Payment',
  EXTERNAL = 'External',
  MYSTASH = 'MyStash',
}

export enum StatusFilter {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface TransactionFiltersDto {
  page?: number;
  limit?: number;
  currency?: CurrencyFilter;
  entry?: EntryFilter;
  sourceType?: SourceTypeFilter;
  status?: StatusFilter;
  authId?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  reference?: string;
  destinationType?: string;
}
