from typing import List, Dict
from schemas import MemberBalanceResponse, DebtTransactionResponse

def simplify_debts(balances: List[MemberBalanceResponse]) -> List[DebtTransactionResponse]:
    """
    Greedy algorithm to calculate minimal transactions between roommates.
    """
    debtors = []
    creditors = []

    for b in balances:
        net = round(b.net_balance, 2)
        if net < -0.01:
            debtors.append({"user_id": b.user_id, "amount": abs(net)})
        elif net > 0.01:
            creditors.append({"user_id": b.user_id, "amount": net})

    debtors.sort(key=lambda x: x["amount"], reverse=True)
    creditors.sort(key=lambda x: x["amount"], reverse=True)

    transactions = []
    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]

        amount = round(min(debtor["amount"], creditor["amount"]), 2)
        if amount > 0.5:
            transactions.append(
                DebtTransactionResponse(
                    id=f"tx-{debtor['user_id']}-{creditor['user_id']}",
                    from_user_id=debtor["user_id"],
                    to_user_id=creditor["user_id"],
                    amount=amount
                )
            )

        debtor["amount"] -= amount
        creditor["amount"] -= amount

        if debtor["amount"] < 0.5:
            i += 1
        if creditor["amount"] < 0.5:
            j += 1

    return transactions
