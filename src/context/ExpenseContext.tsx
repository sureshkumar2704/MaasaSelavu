import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DebtTransaction, Expense, Member, MemberBalance, Room, Settlement, Notification } from '../types';
import { calculateBalancesAndDebts } from '../utils/settlement';

import { createRoomApi, joinRoomApi } from '../utils/api';

interface ExpenseContextType {
  members: Member[]; expenses: Expense[]; allExpenses: Expense[]; settlements: Settlement[];
  rooms: Room[]; activeRoomId: string; activeRoom: Room; setActiveRoomId: (id: string) => void; refreshData: () => void;
  createRoom: (name: string, code?: string) => Result; joinRoom: (code: string) => Result;
  activeTab: string; setActiveTab: (tab: string) => void; searchQuery: string; setSearchQuery: (query: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'roomId'>) => void; deleteExpense: (id: string) => Result;
  addSettlement: (settlement: Omit<Settlement, 'id'>) => void; addMember: (name: string, phone: string) => Result; updateMember: (member: Member) => void; removeMember: (memberId: string) => Result;
  balances: MemberBalance[]; debts: DebtTransaction[]; totalCashPaid: number; currentUserBurden: number; currentUserRecoverable: number;
  isAddExpenseModalOpen: boolean; setIsAddExpenseModalOpen: (open: boolean) => void; currentUserId: string; currentUser: Member;
  notifications: Notification[]; unreadNotificationCount: number; markNotificationRead: (id: string) => void;
  isLoginModalOpen: boolean; setIsLoginModalOpen: (open: boolean) => void; isAuthenticated: boolean; isProfileModalOpen: boolean; setIsProfileModalOpen: (open: boolean) => void; login: (identifier: string, phone: string, roomCode?: string) => Result; register: (username: string, phone: string, roomCode?: string) => Result; updateMyPhone: (phone: string) => Result; switchUser: (id: string) => void; logout: () => void;
}
type Result = { success: boolean; message?: string; notRegistered?: boolean };
const STORAGE = { members: 'maasaselavu_members_v2', rooms: 'maasaselavu_rooms_v2', globalRooms: 'maasaselavu_global_rooms_v1', expenses: 'maasaselavu_expenses_v2', settlements: 'maasaselavu_settlements_v2', notifications: 'maasaselavu_notifications_v1', userRooms: 'maasaselavu_user_rooms_v1', user: 'maasaselavu_current_user_id_v2', room: 'maasaselavu_active_room_id_v2' };
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
const stored = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const roomCode = (value: string) => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

// Demo rows that very old versions of the app auto-seeded. They are stripped
// from storage on load so they never resurface as "default" values the user
// never added. No new defaults are ever injected anywhere in the app.
const LEGACY_DEMO_MEMBER_IDS = ['mem-2', 'mem-3', 'mem-4'];
const LEGACY_DEMO_ROOM_IDS = ['room-goa-vacation'];

const stripLegacyDemoData = (members: Member[], rooms: Room[]): { members: Member[]; rooms: Room[] } => ({
  members: members.filter((member) => !LEGACY_DEMO_MEMBER_IDS.includes(member.id)),
  rooms: rooms.filter((room) => !LEGACY_DEMO_ROOM_IDS.includes(room.id)).map((room) => ({ ...room, members: room.members.filter((member) => !LEGACY_DEMO_MEMBER_IDS.includes(member.id)) })),
});

const loadInitialData = (): { members: Member[]; rooms: Room[] } => {
  const localRooms = stored<Room[]>(STORAGE.rooms, []);
  const globalRooms = stored<Room[]>(STORAGE.globalRooms, []);
  const map = new Map<string, Room>();
  [...globalRooms, ...localRooms].forEach((room) => map.set(room.id, room));
  return stripLegacyDemoData(stored<Member[]>(STORAGE.members, []), Array.from(map.values()));
};

// Render-only placeholder so the UI can mount before the user creates/joins a
// room. It is never persisted to storage or the backend database.
const NO_ROOM: Room = { id: '', name: 'No room yet', code: '—', members: [], createdAt: '' };
// Render-only placeholder used before login. Never persisted.
const GUEST_USER: Member = { id: 'guest', name: 'Guest', avatar: 'bg-slate-600 text-white', phone: '', isCurrentUser: true };

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialData] = useState(loadInitialData);
  const [members, setMembers] = useState<Member[]>(initialData.members);
  const [rooms, setRooms] = useState<Room[]>(initialData.rooms);
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem(STORAGE.user) || '');
  const [activeRoomId, setActiveRoomId] = useState(() => localStorage.getItem(STORAGE.room) || '');
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => stored<Expense[]>(STORAGE.expenses, []));
  const [settlements, setSettlements] = useState<Settlement[]>(() => stored<Settlement[]>(STORAGE.settlements, []));
  const [notifications, setNotifications] = useState<Notification[]>(() => stored<Notification[]>(STORAGE.notifications, []));
  const [activeTab, setActiveTab] = useState('dashboard'); const [searchQuery, setSearchQuery] = useState('');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false); const [isLoginModalOpen, setIsLoginModalOpen] = useState(true); const [isAuthenticated, setIsAuthenticated] = useState(false); const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE.members, JSON.stringify(members)); }, [members]);
  useEffect(() => {
    localStorage.setItem(STORAGE.rooms, JSON.stringify(rooms));
    const currentGlobal = stored<Room[]>(STORAGE.globalRooms, []);
    const map = new Map<string, Room>();
    [...currentGlobal, ...rooms].forEach((r) => { if (!LEGACY_DEMO_ROOM_IDS.includes(r.id)) map.set(r.id, r); });
    localStorage.setItem(STORAGE.globalRooms, JSON.stringify(Array.from(map.values())));
  }, [rooms]);
  useEffect(() => { localStorage.setItem(STORAGE.expenses, JSON.stringify(allExpenses)); }, [allExpenses]);
  useEffect(() => { localStorage.setItem(STORAGE.settlements, JSON.stringify(settlements)); }, [settlements]);
  useEffect(() => { localStorage.setItem(STORAGE.user, currentUserId); }, [currentUserId]);
  useEffect(() => { localStorage.setItem(STORAGE.room, activeRoomId); }, [activeRoomId]);
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
  const currentUser = useMemo(() => members.find((m) => m.id === currentUserId) || members[0] || GUEST_USER, [members, currentUserId]);
  const userRooms = useMemo(() => rooms.filter((r) => r.members.some((m) => m.id === currentUser.id || (m.phone && m.phone === currentUser.phone))), [rooms, currentUser.id, currentUser.phone]);
  const activeRoom = useMemo(() => userRooms.find((r) => r.id === activeRoomId) || userRooms[0] || rooms[0] || NO_ROOM, [activeRoomId, rooms, userRooms]);
  useEffect(() => { if (activeRoom.id && activeRoom.id !== activeRoomId) setActiveRoomId(activeRoom.id); }, [activeRoom, activeRoomId]);
  const refreshData = () => {
    const fresh = loadInitialData();
    setMembers(fresh.members);
    setRooms(fresh.rooms);
    setAllExpenses(stored<Expense[]>(STORAGE.expenses, []));
    setSettlements(stored<Settlement[]>(STORAGE.settlements, []));
    setNotifications(stored<Notification[]>(STORAGE.notifications, []));
    setActiveRoomId(localStorage.getItem(STORAGE.room) || '');
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
  const login = (identifier: string, phone: string, inputRoomCode?: string): Result => {
    const id = identifier.trim().toLowerCase();
    const user = members.find((m) => (m.name.toLowerCase() === id || m.phone === identifier.trim()) && m.phone === phone.trim());
    if (!user) return { success: false, notRegistered: true, message: 'We could not find an account with those details.' };

    if (inputRoomCode && inputRoomCode.trim()) {
      const normInput = roomCode(inputRoomCode);
      const allSearchable = [...rooms, ...stored<Room[]>(STORAGE.globalRooms, [])];
      const targetRoom = allSearchable.find((r) => roomCode(r.code) === normInput || r.code?.trim().toLowerCase() === inputRoomCode.trim().toLowerCase());
      if (!targetRoom) {
        return { success: false, message: 'No such room exists with that room code.' };
      }
    }

    const aliases = new Set(members.filter((member) => member.phone === user.phone).map((member) => member.id));
    aliases.delete(user.id);
    const savedMembership = stored<Record<string, string[]>>(STORAGE.userRooms, {});
    const savedRoomIds = savedMembership[user.id] || [];
    setRooms((previous) => previous.map((room) => {
      const shouldRestore = savedRoomIds.includes(room.id);
      const cleaned = room.members.map((member) => member.phone === user.phone ? user : member).filter((member, index, list) => list.findIndex((item) => item.phone === member.phone) === index);
      return shouldRestore && !cleaned.some((member) => member.id === user.id) ? { ...room, members: [...cleaned, user] } : { ...room, members: cleaned };
    }));
    setAllExpenses((previous) => previous.map((expense) => {
      const merged = expense.splits.map((split) => aliases.has(split.memberId) ? { ...split, memberId: user.id } : split).reduce((result, split) => {
        const existing = result.find((item) => item.memberId === split.memberId);
        if (existing) existing.shareAmount += split.shareAmount; else result.push({ ...split });
        return result;
      }, [] as typeof expense.splits);
      return { ...expense, paidBy: aliases.has(expense.paidBy) ? user.id : expense.paidBy, splits: merged };
    }));
    setCurrentUserId(user.id);
    if (inputRoomCode && inputRoomCode.trim()) {
      joinRoom(inputRoomCode);
    } else {
      const firstRoom = rooms.find((r) => r.members.some((m) => m.id === user.id || m.phone === user.phone) || savedRoomIds.includes(r.id));
      if (firstRoom) setActiveRoomId(firstRoom.id);
    }
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    return { success: true };
  };

  const register = (username: string, phone: string, inputRoomCode?: string): Result => {
    const name = username.trim(); const number = phone.trim();
    if (!name || !number) return { success: false, message: 'Username and phone number are required.' };

    if (inputRoomCode && inputRoomCode.trim()) {
      const normInput = roomCode(inputRoomCode);
      const allSearchable = [...rooms, ...stored<Room[]>(STORAGE.globalRooms, [])];
      const targetRoom = allSearchable.find((r) => roomCode(r.code) === normInput || r.code?.trim().toLowerCase() === inputRoomCode.trim().toLowerCase());
      if (!targetRoom) {
        return { success: false, message: 'No such room exists with that room code.' };
      }
    }

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
    setCurrentUserId(user.id);
    if (inputRoomCode && inputRoomCode.trim()) {
      joinRoom(inputRoomCode);
    }
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    return { success: true };
  };

  const createRoom = (name: string, code?: string): Result => {
    const cleanedName = name.trim();
    const cleanedCode = roomCode(code || `${cleanedName.slice(0, 5)}${new Date().getFullYear()}`);
    if (!cleanedName || !cleanedCode) return { success: false, message: 'Room name and code are required.' };

    const allKnownRooms = [...rooms, ...stored<Room[]>(STORAGE.globalRooms, [])];
    if (allKnownRooms.some((r) => roomCode(r.code) === cleanedCode)) return { success: false, message: 'That room code is already in use.' };

    const room: Room = { id: `room-${Date.now()}`, name: cleanedName, code: cleanedCode, members: [currentUser], createdAt: new Date().toISOString() };
    setRooms((p) => [...p.filter((item) => item.id !== room.id), room]);

    const currentGlobal = stored<Room[]>(STORAGE.globalRooms, []);
    const map = new Map<string, Room>();
    [...currentGlobal, ...rooms, room].forEach((r) => map.set(r.id, r));
    localStorage.setItem(STORAGE.globalRooms, JSON.stringify(Array.from(map.values())));

    createRoomApi(currentUser.id, room.name, room.code).catch(() => {});

    setActiveRoomId(room.id);
    return { success: true };
  };

  const joinRoom = (code: string): Result => {
    const normalizedInput = roomCode(code);
    const globalR = stored<Room[]>(STORAGE.globalRooms, []);
    const allSearchable = [...rooms, ...globalR];

    const target = allSearchable.find((r) => roomCode(r.code) === normalizedInput || r.code?.trim().toLowerCase() === code.trim().toLowerCase());
    if (!target) return { success: false, message: 'No such room exists with that room code.' };

    const hasMember = target.members.some((m) => m.id === currentUser.id || (m.phone && m.phone === currentUser.phone));
    const updatedMembers = hasMember
      ? target.members.map((m) => (m.id === currentUser.id || (m.phone && m.phone === currentUser.phone)) ? currentUser : m)
      : [...target.members, currentUser];
    const updatedTargetRoom = { ...target, members: updatedMembers };

    setRooms((previous) => {
      const existsInPrev = previous.some((r) => r.id === target.id);
      if (existsInPrev) {
        return previous.map((r) => r.id === target.id ? updatedTargetRoom : r);
      }
      return [...previous, updatedTargetRoom];
    });

    const currentGlobal = stored<Room[]>(STORAGE.globalRooms, []);
    const map = new Map<string, Room>();
    [...currentGlobal, ...rooms, updatedTargetRoom].forEach((r) => map.set(r.id, r));
    localStorage.setItem(STORAGE.globalRooms, JSON.stringify(Array.from(map.values())));

    const savedMembership = stored<Record<string, string[]>>(STORAGE.userRooms, {});
    const userRoomList = new Set(savedMembership[currentUser.id] || []);
    userRoomList.add(target.id);
    savedMembership[currentUser.id] = Array.from(userRoomList);
    localStorage.setItem(STORAGE.userRooms, JSON.stringify(savedMembership));

    joinRoomApi(currentUser.id, code).catch(() => {});

    setActiveRoomId(target.id);
    return { success: true };
  };
  const addMember = (name: string, phone: string): Result => { if (!name.trim() || !phone.trim()) return { success: false, message: 'A roommate name and phone number are required.' }; const known = members.find((m) => m.phone === phone.trim()); const roommate = known || { id: `pending-${Date.now()}`, name: name.trim(), phone: phone.trim(), avatar: 'bg-teal-500 text-white', isCurrentUser: false }; if (!known) setMembers((p) => [...p, roommate]); setRooms((p) => p.map((r) => r.id === activeRoom.id && !r.members.some((m) => m.phone === roommate.phone) ? { ...r, members: [...r.members, roommate] } : r)); return { success: true }; };
  const updateMember = (member: Member) => { const clean = { ...member, isCurrentUser: false }; setMembers((p) => p.map((m) => m.id === clean.id ? clean : m)); setRooms((p) => p.map((r) => ({ ...r, members: r.members.map((m) => m.id === clean.id ? clean : m) }))); };
  const removeMember = (memberId: string): Result => { if (memberId === currentUser.id) return { success: false, message: 'You cannot remove yourself from this room.' }; if (activeRoom.members.length <= 1) return { success: false, message: 'A room must have at least one roommate.' }; setRooms((p) => p.map((r) => r.id === activeRoom.id ? { ...r, members: r.members.filter((m) => m.id !== memberId) } : r)); return { success: true }; };
  const updateMyPhone = (phone: string): Result => { const number = phone.trim(); if (!number) return { success: false, message: 'Phone number is required.' }; if (members.some((m) => m.id !== currentUser.id && m.phone === number)) return { success: false, message: 'That phone number is already in use.' }; updateMember({ ...currentUser, phone: number }); return { success: true }; };
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'roomId'>) => setAllExpenses((p) => [{ ...expense, id: `exp-${Date.now()}`, roomId: activeRoom.id, createdAt: new Date().toISOString() }, ...p]);
  const deleteExpense = (id: string): Result => { const expense = allExpenses.find((item) => item.id === id); if (!expense) return { success: false, message: 'Transaction not found.' }; if (expense.paidBy !== currentUser.id) return { success: false, message: 'You can only delete transactions that you made.' }; setAllExpenses((p) => p.filter((item) => item.id !== id)); const recipients = activeRoom.members.filter((member) => member.id !== currentUser.id); setNotifications((p) => [...recipients.map((member) => ({ id: `note-${Date.now()}-${member.id}`, recipientId: member.id, message: `${currentUser.name} deleted the transaction “${expense.title}” (₹${expense.amount.toLocaleString('en-IN')}) from ${activeRoom.name}.`, createdAt: new Date().toISOString(), read: false })), ...p]); return { success: true }; };
  const userNotifications = notifications.filter((notification) => notification.recipientId === currentUser.id);
  const markNotificationRead = (id: string) => setNotifications((p) => p.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  return <ExpenseContext.Provider value={{ members: visibleMembers, expenses, allExpenses, settlements, rooms: userRooms, activeRoomId: activeRoom.id, activeRoom, setActiveRoomId, refreshData, createRoom, joinRoom, activeTab, setActiveTab, searchQuery, setSearchQuery, addExpense, deleteExpense, addSettlement: (s) => setSettlements((p) => [{ ...s, id: `settle-${Date.now()}` }, ...p]), addMember, updateMember, removeMember, balances: calculated.balances, debts: calculated.debts, totalCashPaid: calculated.totalCashPaidByCurrentUser, currentUserBurden: calculated.currentUserBurden, currentUserRecoverable: calculated.currentUserRecoverable, isAddExpenseModalOpen, setIsAddExpenseModalOpen, currentUserId, currentUser, notifications: userNotifications, unreadNotificationCount: userNotifications.filter((n) => !n.read).length, markNotificationRead, isLoginModalOpen, setIsLoginModalOpen, isAuthenticated, isProfileModalOpen, setIsProfileModalOpen, login, register, updateMyPhone, switchUser: setCurrentUserId, logout: () => { setIsAuthenticated(false); setIsLoginModalOpen(true); } }}>{children}</ExpenseContext.Provider>;
};
export const useExpense = () => { const context = useContext(ExpenseContext); if (!context) throw new Error('useExpense must be used within ExpenseProvider'); return context; };