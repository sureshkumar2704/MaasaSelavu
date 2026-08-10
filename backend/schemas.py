from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ExpenseType(str, Enum):
    SHARED = "SHARED"
    PERSONAL = "PERSONAL"

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
