import React, { useState } from 'react';
import { UserPlus, Check, Edit2, Sparkles } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const MemberManagement: React.FC = () => {
  const { members, addMember, updateMember } = useExpense();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMember(newName.trim());
    setNewName('');
  };

  const handleStartEdit = (memberId: string, currentName: string) => {
    setEditingId(memberId);
    setEditName(currentName);
  };

  const handleSaveEdit = (memberId: string) => {
    const m = members.find((item) => item.id === memberId);
    if (m && editName.trim()) {
      updateMember({ ...m, name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Room Member Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Roommates Ledger ({members.length} Members)</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
            Customize roommate profiles for automatic equal/custom split calculations and debt simplification.
          </p>
        </div>
      </div>

      {/* Member List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) => {
          const isEditing = editingId === m.id;

          return (
            <div
              key={m.id}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/80 flex items-center justify-between space-x-4 shadow-xl"
            >
              <div className="flex items-center space-x-3.5 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md shrink-0 border border-slate-700/60 ${m.avatar}`}>
                  {m.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 flex-1">
                  {!isEditing ? (
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-white">{m.name}</h3>
                      {m.isCurrentUser && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                          You
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Edit Form for Name */
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Edit Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => handleStartEdit(m.id, m.name)}
                  title="Edit Roommate Name"
                  className="p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Roommate Form */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4 shadow-xl">
        <h3 className="text-base font-black text-white flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-emerald-400" />
          <span>Add New Roommate</span>
        </h3>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Roommate Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Person E"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-xs font-bold focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            Add Roommate
          </button>
        </form>
      </div>

    </div>
  );
};

