import type { Member, Expense, Settlement } from '../types';

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    name: 'You (Suresh)',
    avatar: 'bg-emerald-500 text-white',
    isCurrentUser: true,
  },
  {
    id: 'mem-2',
    name: 'Person B',
    avatar: 'bg-indigo-500 text-white',
    isCurrentUser: false,
  },
  {
    id: 'mem-3',
    name: 'Person C',
    avatar: 'bg-amber-500 text-white',
    isCurrentUser: false,
  },
  {
    id: 'mem-4',
    name: 'Person D',
    avatar: 'bg-purple-500 text-white',
    isCurrentUser: false,
  },
];

export const DEFAULT_EXPENSES: Expense[] = [];

export const DEFAULT_SETTLEMENTS: Settlement[] = [];
