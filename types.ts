export enum MarginType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  transportCost: number;
  totalCost: number;
  marginType: MarginType;
  marginValue: number;
  sellingPrice: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalLoan: number;
  totalPaid: number;
  balanceDue: number;
}

export interface BillItem {
  productId: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  profit: number;
  warranty: boolean;
}

export interface Bill {
  id: string;
  number: string;
  date: string; // ISO string
  customerId: string | null;
  customerName: string;
  items: BillItem[];
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  discount: number;
  finalAmount: number;
  paymentType: 'CASH' | 'LOAN';
}

export interface Loan {
  id: string;
  customerId: string;
  billId: string;
  amount: number;
  date: string;
}

export interface Payment {
  id: string;
  loanId?: string;
  customerId: string;
  amount: number;
  date: string;
  note?: string;
=======
export enum MarginType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  transportCost: number;
  totalCost: number;
  marginType: MarginType;
  marginValue: number;
  sellingPrice: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalLoan: number;
  totalPaid: number;
  balanceDue: number;
}

export interface BillItem {
  productId: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  profit: number;
  warranty: boolean;
}

export interface Bill {
  id: string;
  number: string;
  date: string; // ISO string
  customerId: string | null;
  customerName: string;
  items: BillItem[];
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  discount: number;
  finalAmount: number;
  paymentType: 'CASH' | 'LOAN';
}

export interface Loan {
  id: string;
  customerId: string;
  billId: string;
  amount: number;
  date: string;
}

export interface Payment {
  id: string;
  loanId?: string;
  customerId: string;
  amount: number;
  date: string;
  note?: string;
>>>>>>> 3f74523 (Initial billing system)
}