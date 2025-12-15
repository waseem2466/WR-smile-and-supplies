import { Product, Customer, Bill, MarginType, Loan, Payment } from '../types';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Cement Bag (50kg)', category: 'Construction', transportCost: 50, totalCost: 1850, marginType: MarginType.FIXED, marginValue: 150, sellingPrice: 2000, stock: 100 },
  { id: '2', name: 'PVC Pipe 4"', category: 'Plumbing', transportCost: 20, totalCost: 820, marginType: MarginType.PERCENTAGE, marginValue: 20, sellingPrice: 984, stock: 50 },
  { id: '3', name: 'Paint Bucket (10L)', category: 'Paints', transportCost: 100, totalCost: 4600, marginType: MarginType.FIXED, marginValue: 400, sellingPrice: 5000, stock: 25 },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Mohamed Nazeer', phone: '0771234567', totalLoan: 5000, totalPaid: 2000, balanceDue: 3000 },
  { id: '2', name: 'K. Perera', phone: '0719876543', totalLoan: 0, totalPaid: 0, balanceDue: 0 },
];

// LocalStorage Keys
const KEYS = {
  PRODUCTS: 'wr_products',
  CUSTOMERS: 'wr_customers',
  BILLS: 'wr_bills',
  LOANS: 'wr_loans',
  PAYMENTS: 'wr_payments'
};

// Generic Load/Save
const load = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  products: {
    getAll: async (): Promise<Product[]> => {
      await delay(200);
      return load(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    },
    add: async (product: Product) => {
      await delay(200);
      const items = load(KEYS.PRODUCTS, INITIAL_PRODUCTS);
      items.push(product);
      save(KEYS.PRODUCTS, items);
    },
    update: async (product: Product) => {
      const items = load<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const index = items.findIndex(i => i.id === product.id);
      if (index !== -1) items[index] = product;
      save(KEYS.PRODUCTS, items);
    },
    delete: async (id: string) => {
      const items = load<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
      save(KEYS.PRODUCTS, items.filter(i => i.id !== id));
    }
  },
  customers: {
    getAll: async (): Promise<Customer[]> => {
      await delay(200);
      return load(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    },
    add: async (customer: Customer) => {
      const items = load(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      items.push(customer);
      save(KEYS.CUSTOMERS, items);
    },
    update: async (customer: Customer) => {
        const items = load<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
        const index = items.findIndex(i => i.id === customer.id);
        if (index !== -1) items[index] = customer;
        save(KEYS.CUSTOMERS, items);
    }
  },
  bills: {
    getAll: async (): Promise<Bill[]> => {
      await delay(300);
      return load(KEYS.BILLS, []);
    },
    create: async (bill: Bill) => {
      // Save Bill
      const bills = load<Bill[]>(KEYS.BILLS, []);
      bills.unshift(bill); // Newest first
      save(KEYS.BILLS, bills);

      // Update Stock
      const products = load<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
      bill.items.forEach(item => {
        const p = products.find(x => x.id === item.productId);
        if (p) p.stock -= item.quantity;
      });
      save(KEYS.PRODUCTS, products);

      // Update Customer if Loan
      if (bill.paymentType === 'LOAN' && bill.customerId) {
        const customers = load<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
        const customer = customers.find(c => c.id === bill.customerId);
        if (customer) {
          customer.totalLoan += bill.finalAmount;
          customer.balanceDue += bill.finalAmount;
        }
        save(KEYS.CUSTOMERS, customers);
        
        // Create Loan Record
        const loans = load<Loan[]>(KEYS.LOANS, []);
        loans.push({
          id: uuid(),
            customerId: bill.customerId,
            billId: bill.id,
            amount: bill.finalAmount,
            date: bill.date
        });
        save(KEYS.LOANS, loans);
      }
    }
  },
  loans: {
    getByCustomerId: async (customerId: string): Promise<Loan[]> => {
      await delay(200);
      const loans = load<Loan[]>(KEYS.LOANS, []);
      return loans.filter(l => l.customerId === customerId);
    }
  },
  payments: {
    getByCustomerId: async (customerId: string): Promise<Payment[]> => {
       await delay(200);
       const payments = load<Payment[]>(KEYS.PAYMENTS, []);
       return payments.filter(p => p.customerId === customerId);
    },
    add: async (payment: Payment) => {
      await delay(200);
      const payments = load<Payment[]>(KEYS.PAYMENTS, []);
      payments.push(payment);
      save(KEYS.PAYMENTS, payments);

      // Update Customer Balance
      const customers = load<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      const customer = customers.find(c => c.id === payment.customerId);
      if (customer) {
        customer.totalPaid += payment.amount;
        customer.balanceDue -= payment.amount;
      }
      save(KEYS.CUSTOMERS, customers);
    }
  }
};