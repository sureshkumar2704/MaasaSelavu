import type { Member, Expense, MemberBalance, DebtTransaction, Settlement } from '../types';

/**
 * Calculates member balances and simplified debt graph ("Who Owes Whom?")
 */
export function calculateBalancesAndDebts(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[] = []
): {
  balances: MemberBalance[];
  debts: DebtTransaction[];
  totalCashPaidByCurrentUser: number;
  currentUserBurden: number;
  currentUserRecoverable: number;
} {
  // Initialize balance maps
  const memberMap = new Map<string, MemberBalance>();

  members.forEach((m) => {
    memberMap.set(m.id, {
      member: m,
      totalPaid: 0,
      sharedPaid: 0,
      sharedShare: 0,
      personalSpend: 0,
      actualBurden: 0,
      netBalance: 0,
    });
  });

  // Accumulate expense data
  expenses.forEach((exp) => {
    const payer = memberMap.get(exp.paidBy);
    if (payer) {
      payer.totalPaid += exp.amount;
      if (exp.type === 'SHARED') {
        payer.sharedPaid += exp.amount;
      } else {
        payer.personalSpend += exp.amount;
      }
    }

    if (exp.type === 'SHARED') {
      exp.splits.forEach((split) => {
        const beneficiary = memberMap.get(split.memberId);
        if (beneficiary) {
          beneficiary.sharedShare += split.shareAmount;
        }
      });
    }
  });

  // Account for settlements logged between members
  settlements.forEach((s) => {
    const payer = memberMap.get(s.fromMemberId);
    const receiver = memberMap.get(s.toMemberId);
    if (payer) {
      payer.sharedPaid += s.amount;
    }
    if (receiver) {
      receiver.sharedPaid -= s.amount;
    }
  });

  // Calculate actual burden and net balances
  const balances: MemberBalance[] = [];
  members.forEach((m) => {
    const b = memberMap.get(m.id)!;
    b.actualBurden = b.personalSpend + b.sharedShare;
    b.netBalance = b.sharedPaid - b.sharedShare;
    balances.push(b);
  });

  // Calculate simplified debt transactions
  const debts = simplifyDebts(balances);

  // Get current user stats
  const currentUser = members.find((m) => m.isCurrentUser) || members[0];
  const currentUserBalance = memberMap.get(currentUser.id)!;

  return {
    balances,
    debts,
    totalCashPaidByCurrentUser: currentUserBalance.totalPaid,
    currentUserBurden: currentUserBalance.actualBurden,
    currentUserRecoverable: currentUserBalance.netBalance,
  };
}

/**
 * Greedy algorithm to find minimal transactions to settle debts
 */
function simplifyDebts(balances: MemberBalance[]): DebtTransaction[] {
  const debtors: { memberId: string; amount: number }[] = [];
  const creditors: { memberId: string; amount: number }[] = [];

  balances.forEach((b) => {
    const rounded = Math.round(b.netBalance);
    if (rounded < -0.01) {
      debtors.push({ memberId: b.member.id, amount: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ memberId: b.member.id, amount: rounded });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: DebtTransaction[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);
    if (amount > 0.5) {
      transactions.push({
        id: `tx-${debtor.memberId}-${creditor.memberId}-${Date.now()}-${i}-${j}`,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: Math.round(amount),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.5) i++;
    if (creditor.amount < 0.5) j++;
  }

  return transactions;
}
