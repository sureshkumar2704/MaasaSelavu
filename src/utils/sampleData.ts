import type { Member, Expense, Settlement, Room } from '../types';

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    name: 'You (Suresh)',
    avatar: 'bg-emerald-500 text-white',
    phone: '9876543210',
    code: '1001',
    isCurrentUser: true,
  },
  {
    id: 'mem-2',
    name: 'Person B',
    avatar: 'bg-indigo-500 text-white',
    phone: '9876543211',
    code: '1002',
    isCurrentUser: false,
  },
  {
    id: 'mem-3',
    name: 'Person C',
    avatar: 'bg-amber-500 text-white',
    phone: '9876543212',
    code: '1003',
    isCurrentUser: false,
  },
  {
    id: 'mem-4',
    name: 'Person D',
    avatar: 'bg-purple-500 text-white',
    phone: '9876543213',
    code: '1004',
    isCurrentUser: false,
  },
  {
    id: 'mem-5',
    name: 'Tamil',
    avatar: 'bg-teal-500 text-white',
    phone: '9876543214',
    code: '1005',
    isCurrentUser: false,
  },
];

export const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room-flat-302',
    name: 'Flat 302',
    code: 'FLAT302',
    members: DEFAULT_MEMBERS,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-goa-vacation',
    name: 'Goa Vacation',
    code: 'GOA2026',
    members: DEFAULT_MEMBERS.slice(0, 3),
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-seed-1',
    title: 'Monthly Electricity & Internet Bill',
    amount: 2400,
    type: 'SHARED',
    category: 'Electricity',
    paidBy: 'mem-1',
    date: new Date().toISOString().split('T')[0],
    description: 'Shared room utilities for 4 roommates',
    splits: [
      { memberId: 'mem-1', shareAmount: 600 },
      { memberId: 'mem-2', shareAmount: 600 },
      { memberId: 'mem-3', shareAmount: 600 },
      { memberId: 'mem-4', shareAmount: 600 },
    ],
    createdAt: new Date().toISOString(),
    roomId: 'room-flat-302',
  },
  {
    id: 'exp-seed-2',
    title: 'Suresh Personal Lunch & Coffee',
    amount: 350,
    type: 'PERSONAL',
    category: 'Food',
    paidBy: 'mem-1',
    date: new Date().toISOString().split('T')[0],
    description: 'Personal expense paid by Suresh',
    splits: [],
    createdAt: new Date().toISOString(),
    roomId: 'room-flat-302',
  },
];

export const DEFAULT_SETTLEMENTS: Settlement[] = [];
