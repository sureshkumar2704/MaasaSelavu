import React, { useState } from 'react';
import { UserPlus, Check, Edit2, Sparkles, Phone, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import type { Member } from '../types';
import { useExpense } from '../context/ExpenseContext';

export const MemberManagement: React.FC = () => {
  const { members, addMember, updateMember, removeMember, activeRoom } = useExpense();

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeError, setRemoveError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    addMember(newName.trim(), newPhone.trim());
    setNewName('');
    setNewPhone('');
  };

  const handleStartEdit = (memberId: string, currentName: string, currentPhone?: string) => {
    setEditingId(memberId);
    setEditName(currentName);
    setEditPhone(currentPhone || '');
  };

  const handleSaveEdit = (memberId: string) => {
    const m = members.find((item) => item.id === memberId);
    if (m && editName.trim()) {
      updateMember({ 
        ...m, 
        name: editName.trim(),
        phone: editPhone.trim() || m.phone
      });
    }
    setEditingId(null);
  };

  const confirmRemoval = () => {
    if (!memberToRemove) return;
    const result = removeMember(memberToRemove.id);
    if (result.success) {
      setMemberToRemove(null);
      setRemoveError('');
    } else {
      setRemoveError(result.message || 'Unable to remove roommate.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Roommate Authentication & Profiles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Roommates Directory ({members.length} Members)</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Room code: <strong className="font-mono text-emerald-400">🔑 {activeRoom.code}</strong> — share it so roommates can join {activeRoom.name}.</p>
        </div>
      </div>

      {/* Member List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) => {
          const isEditing = editingId === m.id;

          return (
            <div
              key={m.id}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/80 flex items-start justify-between space-x-4 shadow-xl"
            >
              <div className="flex items-start space-x-3.5 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md shrink-0 border border-slate-700/60 mt-0.5 ${m.avatar}`}>
                  {m.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1.5 flex-1">
                  {!isEditing ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-black text-white">{m.name}</h3>
                        {m.isCurrentUser && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Logged In</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 space-y-0.5 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>Phone: <strong className="text-slate-200">{m.phone || 'N/A'}</strong></span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Edit Form for Name, Phone, Code */
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Roommate Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                        />
                      </div>

                      <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Phone</label>
                          <input required
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                          />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
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

              {!isEditing && <div className="flex items-center gap-1">
                <button onClick={() => handleStartEdit(m.id, m.name, m.phone)} title="Edit Roommate Profile" className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                {!m.isCurrentUser && <button onClick={() => { setMemberToRemove(m); setRemoveError(''); }} title={`Remove ${m.name} from ${activeRoom.name}`} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>}
              </div>}
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

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
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

          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number *
            </label>
            <input
              type="text" required
              placeholder="e.g. 9876543214"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-xs font-mono focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Add Roommate
            </button>
          </div>
        </form>
      </div>

      {memberToRemove && (
        <div onClick={() => setMemberToRemove(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div onClick={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
            <h3 className="mt-4 text-lg font-black text-white">Remove roommate?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Remove <strong className="text-slate-200">{memberToRemove.name}</strong> from <strong className="text-slate-200">{activeRoom.name}</strong>? They will no longer see this room or its shared expenses. Their account and other rooms are unchanged.</p>
            {removeError && <p className="mt-3 text-xs font-bold text-rose-400">{removeError}</p>}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button onClick={() => setMemberToRemove(null)} className="order-2 sm:order-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={confirmRemoval} className="order-1 sm:order-2 py-3 rounded-xl bg-rose-500 text-white text-xs font-black">Remove roommate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
