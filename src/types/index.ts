export type ExpenseType = 'SHARED' | 'PERSONAL';

export type Category = 
  | 'Food' 
  | 'Electricity' 
  | 'Water' 
  | 'Groceries' 
  | 'Cleaning' 
  | 'Shopping' 
  | 'Travel' 
  | 'Entertainment' 
  | 'Rent' 
  | 'Other';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser: boolean;
}

export interface ExpenseSplit {
  memberId: string;
  shareAmount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  type: ExpenseType;
  category: Category;
  paidBy: string; // Member ID who actually swiped card / paid cash
  date: string; // YYYY-MM-DD
  description?: string;
  splits: ExpenseSplit[]; // For SHARED expenses
  createdAt: string;
}

export interface MemberBalance {
  member: Member;
  totalPaid: number; // Total cash physically paid by this member
  sharedPaid: number; // Cash paid for shared expenses
  sharedShare: number; // Calculated share of room expenses
  personalSpend: number; // Personal expenses paid for oneself
  actualBurden: number; // Total true expense burden (sharedShare + personalSpend)
  netBalance: number; // (sharedPaid - sharedShare). + means owed money; - means owes money.
}

export interface DebtTransaction {
  id: string;
  fromMemberId: string; // Member who owes
  toMemberId: string; // Member who is owed
  amount: number;
}

export interface Settlement {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface WeeklyComparison {
  thisWeek: {
    roomShare: number;
    personal: number;
    total: number;
  };
  lastWeek: {
    roomShare: number;
    personal: number;
    total: number;
  };
  difference: number;
}

export interface MonthlyStats {
  monthName: string;
  roomShareTotal: number;
  personalTotal: number;
  grandTotal: number;
  dailyAverage: number;
  weeklyAverage: number;
  categoryBreakdown: Record<Category, number>;
}
