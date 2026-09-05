from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text, func
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
    SettlementCreate,
    LoginRequest, UserResponse, RegisterRequest, ProfileUpdate, RoomCreate, RoomJoin, RoommateAdd, RoomResponse
)
from settlement import simplify_debts
from typing import Optional

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

# Automatically create tables on startup (non-destructive).
# NOTE: No default/demo data is ever inserted here — Render cold-starts and
# redeploys must never overwrite or re-seed data saved in the database (Aiven).
@app.on_event("startup")
def startup_db_init():
    try:
        Base.metadata.create_all(bind=engine)
        if engine.name == "sqlite":
            with engine.connect() as connection:
                columns = [row[1] for row in connection.execute(text("PRAGMA table_info(rooms)"))]
                if "code" not in columns:
                    connection.execute(text("ALTER TABLE rooms ADD COLUMN code VARCHAR"))
                    connection.commit()
        print("Database schema check completed. Existing data is preserved.")
    except Exception as e:
        print(f"Automatic database table creation note: {e}")

@app.get("/")
def read_root():
    return {"message": "MaasaSelavu FastAPI Server Active with SQLite Database persistence"}

@app.post("/api/auth/register", response_model=UserResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    username, phone = req.username.strip(), req.phone.strip()
    if not username or not phone:
        raise HTTPException(status_code=400, detail="Username and phone are required")
    same_name = db.query(User).filter(User.name == username).first()
    existing_phone = db.query(User).filter(User.phone == phone).first()
    if same_name or (existing_phone and not existing_phone.id.startswith("pending-")):
        raise HTTPException(status_code=409, detail="Username or phone already registered")
    # A roommate can be pre-added by phone before they have an account. Promote that
    # placeholder in place, so its RoomMember links and shared expenses stay intact.
    user = existing_phone or User(id=f"user-{uuid.uuid4().hex[:8]}", name=username, phone=phone, avatar="bg-blue-500 text-white")
    user.name = username
    if not existing_phone:
        db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=UserResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    val = req.username_or_phone.strip()
    user = db.query(User).filter(((User.name == val) | (User.phone == val)) & (User.phone == req.phone.strip())).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/phone combination")
    return user

@app.patch("/api/auth/profile", response_model=UserResponse)
def update_profile(data: ProfileUpdate, user_id: str, db: Session = Depends(get_db)):
    phone = data.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    duplicate = db.query(User).filter(User.phone == phone, User.id != user_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Phone number already in use")
    user.phone = phone
    db.commit()
    db.refresh(user)
    return user

def room_response(room: Room, db: Session) -> RoomResponse:
    members = [db.query(User).filter(User.id == membership.user_id).first() for membership in db.query(RoomMember).filter(RoomMember.room_id == room.id).all()]
    return RoomResponse(id=room.id, name=room.name, code=room.code, created_at=room.created_at.isoformat(), members=[member for member in members if member])

@app.get("/api/rooms", response_model=List[RoomResponse])
def get_rooms(user_id: str, db: Session = Depends(get_db)):
    rooms = db.query(Room).join(RoomMember, RoomMember.room_id == Room.id).filter(RoomMember.user_id == user_id).all()
    return [room_response(room, db) for room in rooms]

@app.post("/api/rooms", response_model=RoomResponse)
def create_room(data: RoomCreate, user_id: str, db: Session = Depends(get_db)):
    code = data.code.strip().upper()
    if db.query(Room).filter(func.upper(Room.code) == code).first(): raise HTTPException(status_code=409, detail="Room code already exists")
    if not db.query(User).filter(User.id == user_id).first(): raise HTTPException(status_code=404, detail="User not found")
    room = Room(id=f"room-{uuid.uuid4().hex[:8]}", name=data.name.strip(), code=code)
    db.add(room); db.flush(); db.add(RoomMember(id=f"rm-{uuid.uuid4().hex[:8]}", room_id=room.id, user_id=user_id)); db.commit()
    return room_response(room, db)

@app.post("/api/rooms/join", response_model=RoomResponse)
def join_room(data: RoomJoin, user_id: str, db: Session = Depends(get_db)):
    code = data.code.strip().upper()
    room = db.query(Room).filter(func.upper(Room.code) == code).first()
    if not room: raise HTTPException(status_code=404, detail="No such room exists with that room code")
    if not db.query(User).filter(User.id == user_id).first(): raise HTTPException(status_code=404, detail="User not found")
    if not db.query(RoomMember).filter(RoomMember.room_id == room.id, RoomMember.user_id == user_id).first(): db.add(RoomMember(id=f"rm-{uuid.uuid4().hex[:8]}", room_id=room.id, user_id=user_id)); db.commit()
    return room_response(room, db)

@app.post("/api/rooms/{room_id}/members", response_model=UserResponse)
def add_roommate(room_id: str, data: RoommateAdd, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")
    user = db.query(User).filter(User.phone == data.phone.strip()).first()
    if not user:
        user = User(id=f"pending-{uuid.uuid4().hex[:8]}", name=data.name.strip(), phone=data.phone.strip(), avatar="bg-teal-500 text-white")
        db.add(user); db.flush()
    if not db.query(RoomMember).filter(RoomMember.room_id == room_id, RoomMember.user_id == user.id).first(): db.add(RoomMember(id=f"rm-{uuid.uuid4().hex[:8]}", room_id=room_id, user_id=user.id))
    db.commit(); return user

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(user_id: Optional[str] = None, room_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Expense)
    if user_id:
        # Return SHARED expenses (for all) + PERSONAL expenses paid by this specific user
        query = query.filter(
            (Expense.expense_type == "SHARED") | 
            ((Expense.expense_type == "PERSONAL") & (Expense.paid_by == user_id))
        )
    if room_id:
        query = query.filter(Expense.room_id == room_id)
    return query.order_by(Expense.date.desc()).all()

@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, room_id: Optional[str] = None, db: Session = Depends(get_db)):
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
        room_id=room_id,
    )
    if expense.line_items:
        calculated_total = round(sum(item.amount for item in expense.line_items), 2)
        if abs(calculated_total - expense.amount) > 0.01:
            raise HTTPException(status_code=400, detail="Expense amount must equal the itemized gross total")
    db.add(db_exp)
    db.commit()

    users = db.query(User).join(RoomMember, RoomMember.user_id == User.id).filter(RoomMember.room_id == room_id).all() if room_id else db.query(User).all()
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
