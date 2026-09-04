import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DebtTransaction, Expense, Member, MemberBalance, Room, Settlement, Notification } from '../types';
import { DEFAULT_EXPENSES, DEFAULT_MEMBERS, DEFAULT_ROOMS, DEFAULT_SETTLEMENTS } from '../utils/sampleData';
import { calculateBalancesAndDebts } from '../utils/settlement';

interface ExpenseContextType {
  members: Member[]; expenses: Expense[]; allExpenses: Expense[]; settlements: Settlement[];
  rooms: Room[]; activeRoomId: string; activeRoom: Room; setActiveRoomId: (id: string) => void; refreshData: () => void;
  createRoom: (name: string, code?: string) => Result; joinRoom: (code: string) => Result;
  activeTab: string; setActiveTab: (tab: string) => void; searchQuery: string; setSearchQuery: (query: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'roomId'>) => void; deleteExpense: (id: string) => Result;
  addSettlement: (settlement: Omit<Settlement, 'id'>) => void; addMember: (name: string, phone: string) => Result; updateMember: (member: Member) => void; removeMember: (memberId: string) => Result; resetToDemoData: () => void;
  balances: MemberBalance[]; debts: DebtTransaction[]; totalCashPaid: number; currentUserBurden: number; currentUserRecoverable: number;
  isAddExpenseModalOpen: boolean; setIsAddExpenseModalOpen: (open: boolean) => void; currentUserId: string; currentUser: Member;
  notifications: Notification[]; unreadNotificationCount: number; markNotificationRead: (id: string) => void;
  isLoginModalOpen: boolean; setIsLoginModalOpen: (open: boolean) => void; isAuthenticated: boolean; isProfileModalOpen: boolean; setIsProfileModalOpen: (open: boolean) => void; login: (identifier: string, phone: string) => Result; register: (username: string, phone: string) => Result; updateMyPhone: (phone: string) => Result; switchUser: (id: string) => void; logout: () => void;
}
type Result = { success: boolean; message?: string; notRegistered?: boolean };
const STORAGE = { members: 'maasaselavu_members_v2', rooms: 'maasaselavu_rooms_v2', expenses: 'maasaselavu_expenses_v2', settlements: 'maasaselavu_settlements_v2', notifications: 'maasaselavu_notifications_v1', userRooms: 'maasaselavu_user_rooms_v1', user: 'maasaselavu_current_user_id_v2', room: 'maasaselavu_active_room_id_v2' };
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const stored = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const roomCode = (value: string) => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => stored(STORAGE.members, DEFAULT_MEMBERS));
  const [rooms, setRooms] = useState<Room[]>(() => stored(STORAGE.rooms, DEFAULT_ROOMS));
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem(STORAGE.user) || DEFAULT_MEMBERS[0].id);
  const [activeRoomId, setActiveRoomId] = useState(() => localStorage.getItem(STORAGE.room) || DEFAULT_ROOMS[0].id);
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => stored(STORAGE.expenses, DEFAULT_EXPENSES));
  const [settlements, setSettlements] = useState<Settlement[]>(() => stored(STORAGE.settlements, DEFAULT_SETTLEMENTS));
  const [notifications, setNotifications] = useState<Notification[]>(() => stored(STORAGE.notifications, []));
  const [activeTab, setActiveTab] = useState('dashboard'); const [searchQuery, setSearchQuery] = useState('');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false); const [isLoginModalOpen, setIsLoginModalOpen] = useState(true); const [isAuthenticated, setIsAuthenticated] = useState(false); const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  useEffect(() => { localStorage.setItem(STORAGE.members, JSON.stringify(members)); }, [members]); useEffect(() => { localStorage.setItem(STORAGE.rooms, JSON.stringify(rooms)); }, [rooms]); useEffect(() => { localStorage.setItem(STORAGE.expenses, JSON.stringify(allExpenses)); }, [allExpenses]); useEffect(() => { localStorage.setItem(STORAGE.settlements, JSON.stringify(settlements)); }, [settlements]); useEffect(() => { localStorage.setItem(STORAGE.user, currentUserId); }, [currentUserId]); useEffect(() => { localStorage.setItem(STORAGE.room, activeRoomId); }, [activeRoomId]);
  useEffect(() => { localStorage.setItem(STORAGE.notifications, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => {
    const membership: Record<string, string[]> = {};
    rooms.forEach((room) => room.members.forEach((member) => { (membership[member.id] ||= []).push(room.id); }));
    localStorage.setItem(STORAGE.userRooms, JSON.stringify(membership));
  }, [rooms]);
  useEffect(() => {
    setRooms((previous) => previous.map((room) => {
      const seen = new Set<string>();
      const unique = room.members.filter((member) => {
        const key = member.phone.replace(/\D/g, '') || member.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
      return unique.length === room.members.length ? room : { ...room, members: unique };
    }));
  }, [members.length]);
  const currentUser = useMemo(() => members.find((m) => m.id === currentUserId) || members[0], [members, currentUserId]);
  const userRooms = useMemo(() => rooms.filter((r) => r.members.some((m) => m.id === currentUser.id)), [rooms, currentUser.id]);
  const activeRoom = useMemo(() => userRooms.find((r) => r.id === activeRoomId) || userRooms[0] || rooms[0], [activeRoomId, rooms, userRooms]);
  useEffect(() => { if (activeRoom && activeRoom.id !== activeRoomId) setActiveRoomId(activeRoom.id); }, [activeRoom, activeRoomId]);
  const refreshData = () => {
    setMembers(stored(STORAGE.members, DEFAULT_MEMBERS));
    setRooms(stored(STORAGE.rooms, DEFAULT_ROOMS));
    setAllExpenses(stored(STORAGE.expenses, DEFAULT_EXPENSES));
    setSettlements(stored(STORAGE.settlements, DEFAULT_SETTLEMENTS));
    setNotifications(stored(STORAGE.notifications, []));
    setActiveRoomId(localStorage.getItem(STORAGE.room) || DEFAULT_ROOMS[0].id);
  };
  const visibleMembers = useMemo(() => {
    const canonicalByPhone = new Map<string, Member>();
    members.forEach((member) => { const key = member.phone.replace(/\D/g, '') || member.name.trim().toLowerCase(); const existing = canonicalByPhone.get(key); if (!existing || (existing.id.startsWith('pending-') && !member.id.startsWith('pending-'))) canonicalByPhone.set(key, member); });
    const ordered = [...activeRoom.members].map((member) => canonicalByPhone.get(member.phone.replace(/\D/g, '') || member.name.trim().toLowerCase()) || member).sort((a, b) => (a.id === currentUser.id ? -1 : b.id === currentUser.id ? 1 : 0));
    const seen = new Set<string>();
    return ordered.filter((member) => {
      const key = member.phone.replace(/\D/g, '') || member.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).map((m) => ({ ...m, isCurrentUser: m.id === currentUser.id }));
  }, [activeRoom, currentUser.id]);
  const canonicalMemberIds = useMemo(() => { const map = new Map<string, string>(); activeRoom.members.forEach((member) => { const canonical = visibleMembers.find((item) => item.phone.replace(/\D/g, '') === member.phone.replace(/\D/g, '')); if (canonical) map.set(member.id, canonical.id); }); return map; }, [activeRoom.members, visibleMembers]);
  const expenses = useMemo(() => allExpenses.filter((e) => e.roomId === activeRoom.id && (e.type === 'SHARED' || e.paidBy === currentUser.id)).map((expense) => ({ ...expense, paidBy: canonicalMemberIds.get(expense.paidBy) || expense.paidBy, splits: expense.splits.map((split) => ({ ...split, memberId: canonicalMemberIds.get(split.memberId) || split.memberId })) })), [allExpenses, activeRoom.id, currentUser.id, canonicalMemberIds]);
  const calculated = useMemo(() => calculateBalancesAndDebts(visibleMembers, expenses, settlements), [visibleMembers, expenses, settlements]);
  const login = (identifier: string, phone: string): Result => { const id = identifier.trim().toLowerCase(); const user = members.find((m) => (m.name.toLowerCase() === id || m.phone === identifier.trim()) && m.phone === phone.trim()); if (!user) return { success: false, notRegistered: true, message: 'We could not find an account with those details.' }; const aliases = new Set(members.filter((member) => member.phone === user.phone).map((member) => member.id)); aliases.delete(user.id); const savedMembership = stored<Record<string, string[]>>(STORAGE.userRooms, {}); const savedRoomIds = savedMembership[user.id] || []; setRooms((previous) => previous.map((room) => { const shouldRestore = savedRoomIds.includes(room.id); const cleaned = room.members.map((member) => member.phone === user.phone ? user : member).filter((member, index, list) => list.findIndex((item) => item.phone === member.phone) === index); return shouldRestore && !cleaned.some((member) => member.id === user.id) ? { ...room, members: [...cleaned, user] } : { ...room, members: cleaned }; })); setAllExpenses((previous) => previous.map((expense) => { const merged = expense.splits.map((split) => aliases.has(split.memberId) ? { ...split, memberId: user.id } : split).reduce((result, split) => { const existing = result.find((item) => item.memberId === split.memberId); if (existing) existing.shareAmount += split.shareAmount; else result.push({ ...split }); return result; }, [] as typeof expense.splits); return { ...expense, paidBy: aliases.has(expense.paidBy) ? user.id : expense.paidBy, splits: merged }; })); setCurrentUserId(user.id); const firstRoom = rooms.find((r) => r.members.some((m) => m.id === user.id || m.phone === user.phone) || savedRoomIds.includes(r.id)); if (firstRoom) setActiveRoomId(firstRoom.id); setIsAuthenticated(true); setIsLoginModalOpen(false); return { success: true }; };
  const register = (username: string, phone: string): Result => {
    const name = username.trim(); const number = phone.trim();
    if (!name || !number) return { success: false, message: 'Username and phone number are required.' };
    const sameName = members.find((m) => m.name.toLowerCase() === name.toLowerCase());
    const samePhone = members.find((m) => m.phone === number);
    const pending = samePhone?.id.startsWith('pending-') ? samePhone : sameName?.id.startsWith('pending-') ? sameName : undefined;
    if ((sameName && !sameName.id.startsWith('pending-')) || (samePhone && !samePhone.id.startsWith('pending-'))) return { success: false, message: 'That username or phone number is already registered.' };
    const user: Member = { id: pending?.id || `mem-${Date.now()}`, name, phone: number, avatar: pending?.avatar || 'bg-blue-500 text-white', isCurrentUser: false };
    setMembers((p) => pending ? p.map((m) => m.id === pending.id ? user : m) : [...p, user]);
    setRooms((p) => p.map((r) => {
      if (!r.members.some((m) => m.id === pending?.id || m.phone === number)) return r;
      const replaced = r.members.map((m) => m.id === pending?.id || m.phone === number ? user : m);
      const unique = replaced.filter((member, index, list) => list.findIndex((item) => item.id === member.id || item.phone === member.phone) === index);
      return { ...r, members: unique };
    }));
    const aliases = new Set(members.filter((member) => member.phone === number).map((member) => member.id));
    if (pending) aliases.add(pending.id);
    setAllExpenses((p) => p.map((expense) => {
      const merged = expense.splits.map((split) => aliases.has(split.memberId) ? { ...split, memberId: user.id } : split).reduce((result, split) => {
        const existing = result.find((item) => item.memberId === split.memberId);
        if (existing) existing.shareAmount += split.shareAmount; else result.push({ ...split });
        return result;
      }, [] as typeof expense.splits);
      return { ...expense, paidBy: aliases.has(expense.paidBy) ? user.id : expense.paidBy, splits: merged };
    }));
    setCurrentUserId(user.id); setIsAuthenticated(true); setIsLoginModalOpen(false); return { success: true };
  };
  const createRoom = (name: string, code?: string): Result => { const cleanedName = name.trim(); const cleanedCode = roomCode(code || `${cleanedName.slice(0, 5)}${new Date().getFullYear()}`); if (!cleanedName || !cleanedCode) return { success: false, message: 'Room name and code are required.' }; if (rooms.some((r) => r.code === cleanedCode)) return { success: false, message: 'That room code is already in use.' }; const room: Room = { id: `room-${Date.now()}`, name: cleanedName, code: cleanedCode, members: [currentUser], createdAt: new Date().toISOString() }; setRooms((p) => [...p, room]); setActiveRoomId(room.id); return { success: true }; };
  const joinRoom = (code: string): Result => { const target = rooms.find((r) => r.code === roomCode(code)); if (!target) return { success: false, message: 'No room matches that code.' }; if (!target.members.some((m) => m.id === currentUser.id)) setRooms((p) => p.map((r) => r.id === target.id ? { ...r, members: [...r.members, currentUser] } : r)); setActiveRoomId(target.id); return { success: true }; };
  const addMember = (name: string, phone: string): Result => { if (!name.trim() || !phone.trim()) return { success: false, message: 'A roommate name and phone number are required.' }; const known = members.find((m) => m.phone === phone.trim()); const roommate = known || { id: `pending-${Date.now()}`, name: name.trim(), phone: phone.trim(), avatar: 'bg-teal-500 text-white', isCurrentUser: false }; if (!known) setMembers((p) => [...p, roommate]); setRooms((p) => p.map((r) => r.id === activeRoom.id && !r.members.some((m) => m.phone === roommate.phone) ? { ...r, members: [...r.members, roommate] } : r)); return { success: true }; };
  const updateMember = (member: Member) => { const clean = { ...member, isCurrentUser: false }; setMembers((p) => p.map((m) => m.id === clean.id ? clean : m)); setRooms((p) => p.map((r) => ({ ...r, members: r.members.map((m) => m.id === clean.id ? clean : m) }))); };
  const removeMember = (memberId: string): Result => { if (memberId === currentUser.id) return { success: false, message: 'You cannot remove yourself from this room.' }; if (activeRoom.members.length <= 1) return { success: false, message: 'A room must have at least one roommate.' }; setRooms((p) => p.map((r) => r.id === activeRoom.id ? { ...r, members: r.members.filter((m) => m.id !== memberId) } : r)); return { success: true }; };
  const updateMyPhone = (phone: string): Result => { const number = phone.trim(); if (!number) return { success: false, message: 'Phone number is required.' }; if (members.some((m) => m.id !== currentUser.id && m.phone === number)) return { success: false, message: 'That phone number is already in use.' }; updateMember({ ...currentUser, phone: number }); return { success: true }; };
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'roomId'>) => setAllExpenses((p) => [{ ...expense, id: `exp-${Date.now()}`, roomId: activeRoom.id, createdAt: new Date().toISOString() }, ...p]);
  const deleteExpense = (id: string): Result => { const expense = allExpenses.find((item) => item.id === id); if (!expense) return { success: false, message: 'Transaction not found.' }; if (expense.paidBy !== currentUser.id) return { success: false, message: 'You can only delete transactions that you made.' }; setAllExpenses((p) => p.filter((item) => item.id !== id)); const recipients = activeRoom.members.filter((member) => member.id !== currentUser.id); setNotifications((p) => [...recipients.map((member) => ({ id: `note-${Date.now()}-${member.id}`, recipientId: member.id, message: `${currentUser.name} deleted the transaction “${expense.title}” (₹${expense.amount.toLocaleString('en-IN')}) from ${activeRoom.name}.`, createdAt: new Date().toISOString(), read: false })), ...p]); return { success: true }; };
  const userNotifications = notifications.filter((notification) => notification.recipientId === currentUser.id);
  const markNotificationRead = (id: string) => setNotifications((p) => p.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  const resetToDemoData = () => { setMembers(DEFAULT_MEMBERS); setRooms(DEFAULT_ROOMS); setAllExpenses(DEFAULT_EXPENSES); setSettlements(DEFAULT_SETTLEMENTS); setCurrentUserId(DEFAULT_MEMBERS[0].id); setActiveRoomId(DEFAULT_ROOMS[0].id); Object.values(STORAGE).forEach((key) => localStorage.removeItem(key)); };
  return <ExpenseContext.Provider value={{ members: visibleMembers, expenses, allExpenses, settlements, rooms: userRooms, activeRoomId: activeRoom.id, activeRoom, setActiveRoomId, refreshData, createRoom, joinRoom, activeTab, setActiveTab, searchQuery, setSearchQuery, addExpense, deleteExpense, addSettlement: (s) => setSettlements((p) => [{ ...s, id: `settle-${Date.now()}` }, ...p]), addMember, updateMember, removeMember, resetToDemoData, balances: calculated.balances, debts: calculated.debts, totalCashPaid: calculated.totalCashPaidByCurrentUser, currentUserBurden: calculated.currentUserBurden, currentUserRecoverable: calculated.currentUserRecoverable, isAddExpenseModalOpen, setIsAddExpenseModalOpen, currentUserId, currentUser, notifications: userNotifications, unreadNotificationCount: userNotifications.filter((n) => !n.read).length, markNotificationRead, isLoginModalOpen, setIsLoginModalOpen, isAuthenticated, isProfileModalOpen, setIsProfileModalOpen, login, register, updateMyPhone, switchUser: setCurrentUserId, logout: () => { setIsAuthenticated(false); setIsLoginModalOpen(true); } }}>{children}</ExpenseContext.Provider>;
};
export const useExpense = () => { const context = useContext(ExpenseContext); if (!context) throw new Error('useExpense must be used within ExpenseProvider'); return context; };
