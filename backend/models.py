from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum as SQLEnum, Integer
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()

class ExpenseTypeEnum(str, enum.Enum):
    SHARED = "SHARED"
    PERSONAL = "PERSONAL"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    upi_id = Column(String, nullable=True)
    avatar = Column(String, nullable=True)

    expenses_paid = relationship("Expense", back_populates="payer")
    splits = relationship("ExpenseSplit", back_populates="user")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RoomMember(Base):
    __tablename__ = "room_members"

    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    paid_by = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    expense_type = Column(SQLEnum(ExpenseTypeEnum), default=ExpenseTypeEnum.SHARED)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    payer = relationship("User", back_populates="expenses_paid")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(String, primary_key=True, index=True)
    expense_id = Column(String, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    share_amount = Column(Float, nullable=False)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="splits")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, index=True)
    from_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    note = Column(String, nullable=True)
