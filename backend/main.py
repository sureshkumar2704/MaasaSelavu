from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid

from schemas import (
    ExpenseCreate, 
    ExpenseResponse, 
    MemberBalanceResponse, 
    DebtTransactionResponse, 
    SettlementCreate
)
from settlement import simplify_debts

app = FastAPI(
    title="MaasaSelavu API",
    description="Backend API for Roommate Shared & Personal Expense Management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS = [
    {"id": "mem-1", "name": "You (Suresh)", "upi_id": "suresh@upi"},
    {"id": "mem-2", "name": "Person B", "upi_id": "personb@upi"},
    {"id": "mem-3", "name": "Person C", "upi_id": "personc@upi"},
    {"id": "mem-4", "name": "Person D", "upi_id": "persond@upi"},
]

EXPENSES = []
SETTLEMENTS = []

@app.get("/")
def read_root():
    return {"message": "MaasaSelavu FastAPI Server Active"}

@app.get("/api/users")
def get_users():
    return USERS

@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses():
    return EXPENSES

@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate):
    new_id = f"exp-{uuid.uuid4().hex[:6]}"
    splits_data = []
    
    if expense.expense_type == "SHARED":
        if expense.splits:
            splits_data = [
                {"id": f"s-{uuid.uuid4().hex[:4]}", "user_id": s.user_id, "share_amount": s.share_amount}
                for s in expense.splits
            ]
        else:
            share = round(expense.amount / len(USERS), 2)
            splits_data = [
                {"id": f"s-{uuid.uuid4().hex[:4]}", "user_id": u["id"], "share_amount": share}
                for u in USERS
            ]

    exp_dict = {
        "id": new_id,
        "title": expense.category,
        "amount": expense.amount,
        "category": expense.category,
        "expense_type": expense.expense_type,
        "paid_by": expense.paid_by,
        "date": expense.date,
        "description": expense.description,
        "splits": splits_data
    }
    EXPENSES.insert(0, exp_dict)
    return exp_dict

@app.get("/api/balances", response_model=List[MemberBalanceResponse])
def get_balances():
    balances = {
        u["id"]: {
            "user_id": u["id"],
            "user_name": u["name"],
            "total_paid": 0.0,
            "shared_paid": 0.0,
            "shared_share": 0.0,
            "personal_spend": 0.0,
            "actual_burden": 0.0,
            "net_balance": 0.0
        } for u in USERS
    }

    for exp in EXPENSES:
        payer_id = exp["paid_by"]
        amt = exp["amount"]
        if payer_id in balances:
            balances[payer_id]["total_paid"] += amt
            if exp["expense_type"] == "SHARED":
                balances[payer_id]["shared_paid"] += amt
            else:
                balances[payer_id]["personal_spend"] += amt

        if exp["expense_type"] == "SHARED":
            for s in exp["splits"]:
                uid = s["user_id"]
                if uid in balances:
                    balances[uid]["shared_share"] += s["share_amount"]

    for s in SETTLEMENTS:
        if s["from_user_id"] in balances:
            balances[s["from_user_id"]]["shared_paid"] += s["amount"]
        if s["to_user_id"] in balances:
            balances[s["to_user_id"]]["shared_paid"] -= s["amount"]

    result = []
    for b in balances.values():
        b["actual_burden"] = b["personal_spend"] + b["shared_share"]
        b["net_balance"] = b["shared_paid"] - b["shared_share"]
        result.append(MemberBalanceResponse(**b))

    return result

@app.get("/api/debts", response_model=List[DebtTransactionResponse])
def get_debts():
    balances = get_balances()
    return simplify_debts(balances)
