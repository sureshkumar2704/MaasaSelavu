from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import engine, get_db
from models import Base, User, Room, RoomMember, Expense, ExpenseSplit, Settlement as DBSettlement
from schemas import (
    ExpenseCreate, 
    ExpenseResponse, 
    MemberBalanceResponse, 
    DebtTransactionResponse, 
    SettlementCreate
)
from settlement import simplify_debts

# Create SQLite database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MaasaSelavu API",
    description="Backend API for Roommate Shared & Personal Expense Management with SQLite Persistence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed default members on startup if empty
@app.on_event("startup")
def startup_seed_members():
    db = next(get_db())
    if db.query(User).count() == 0:
        default_users = [
            User(id="mem-1", name="You (Suresh)"),
            User(id="mem-2", name="Person B"),
            User(id="mem-3", name="Person C"),
            User(id="mem-4", name="Person D"),
        ]
        db.add_all(default_users)
        db.commit()

@app.get("/")
def read_root():
    return {"message": "MaasaSelavu FastAPI Server Active with SQLite Database persistence"}

@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).order_by(Expense.date.desc()).all()

@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    new_id = f"exp-{uuid.uuid4().hex[:6]}"
    
    db_exp = Expense(
        id=new_id,
        title=expense.category,
        amount=expense.amount,
        category=expense.category,
        expense_type=expense.expense_type,
        paid_by=expense.paid_by,
        date=expense.date,
        description=expense.description,
    )
    db.add(db_exp)
    db.commit()

    users = db.query(User).all()
    if expense.expense_type == "SHARED":
        if expense.splits:
            for s in expense.splits:
                split = ExpenseSplit(
                    id=f"s-{uuid.uuid4().hex[:4]}",
                    expense_id=new_id,
                    user_id=s.user_id,
                    share_amount=s.share_amount
                )
                db.add(split)
        else:
            share = round(expense.amount / len(users), 2)
            for u in users:
                split = ExpenseSplit(
                    id=f"s-{uuid.uuid4().hex[:4]}",
                    expense_id=new_id,
                    user_id=u.id,
                    share_amount=share
                )
                db.add(split)
        db.commit()

    db.refresh(db_exp)
    return db_exp

@app.get("/api/balances", response_model=List[MemberBalanceResponse])
def get_balances(db: Session = Depends(get_db)):
    users = db.query(User).all()
    expenses = db.query(Expense).all()
    settlements = db.query(DBSettlement).all()

    balances = {
        u.id: {
            "user_id": u.id,
            "user_name": u.name,
            "total_paid": 0.0,
            "shared_paid": 0.0,
            "shared_share": 0.0,
            "personal_spend": 0.0,
            "actual_burden": 0.0,
            "net_balance": 0.0
        } for u in users
    }

    for exp in expenses:
        payer_id = exp.paid_by
        amt = exp.amount
        if payer_id in balances:
            balances[payer_id]["total_paid"] += amt
            if exp.expense_type == "SHARED":
                balances[payer_id]["shared_paid"] += amt
            else:
                balances[payer_id]["personal_spend"] += amt

        if exp.expense_type == "SHARED":
            for s in exp.splits:
                uid = s.user_id
                if uid in balances:
                    balances[uid]["shared_share"] += s.share_amount

    for s in settlements:
        if s.from_user_id in balances:
            balances[s.from_user_id]["shared_paid"] += s.amount
        if s.to_user_id in balances:
            balances[s.to_user_id]["shared_paid"] -= s.amount

    result = []
    for b in balances.values():
        b["actual_burden"] = b["personal_spend"] + b["shared_share"]
        b["net_balance"] = b["shared_paid"] - b["shared_share"]
        result.append(MemberBalanceResponse(**b))

    return result

@app.get("/api/debts", response_model=List[DebtTransactionResponse])
def get_debts(db: Session = Depends(get_db)):
    balances = get_balances(db)
    return simplify_debts(balances)

@app.post("/api/settlements")
def create_settlement(settlement: SettlementCreate, db: Session = Depends(get_db)):
    db_settlement = DBSettlement(
        id=f"settle-{uuid.uuid4().hex[:6]}",
        from_user_id=settlement.from_user_id,
        to_user_id=settlement.to_user_id,
        amount=settlement.amount,
        date=settlement.date,
        note=settlement.note
    )
    db.add(db_settlement)
    db.commit()
    return {"message": "Settlement recorded successfully", "id": db_settlement.id}
