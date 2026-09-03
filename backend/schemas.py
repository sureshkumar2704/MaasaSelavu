from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ExpenseType(str, Enum):
    SHARED = "SHARED"
    PERSONAL = "PERSONAL"

class RegisterRequest(BaseModel):
    username: str
    phone: str

class ProfileUpdate(BaseModel):
    phone: str

class LoginRequest(BaseModel):
    username_or_phone: str
    phone: str

class RoomCreate(BaseModel):
    name: str
    code: str

class RoomJoin(BaseModel):
    code: str

class RoommateAdd(BaseModel):
    name: str
    phone: str

class RoomResponse(BaseModel):
    id: str
    name: str
    code: str
    created_at: str
    members: List["UserResponse"] = []

class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    code: Optional[str] = None
    upi_id: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class ExpenseSplitBase(BaseModel):
    user_id: str
    share_amount: float

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplitResponse(ExpenseSplitBase):
    id: str
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    title: str
    amount: float
    category: str
    expense_type: ExpenseType
    paid_by: str
    date: str
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    splits: Optional[List[ExpenseSplitCreate]] = []

class ExpenseResponse(ExpenseBase):
    id: str
    splits: List[ExpenseSplitResponse] = []
    class Config:
        from_attributes = True

class MemberBalanceResponse(BaseModel):
    user_id: str
    user_name: str
    total_paid: float
    shared_paid: float
    shared_share: float
    personal_spend: float
    actual_burden: float
    net_balance: float

class DebtTransactionResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    amount: float

class SettlementCreate(BaseModel):
    from_user_id: str
    to_user_id: str
    amount: float
    date: str
    note: Optional[str] = None
