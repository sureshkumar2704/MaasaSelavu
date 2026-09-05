import React, { useState } from 'react';
import { AlertCircle, DoorOpen, KeyRound, LogIn, Phone, UserPlus, UserRoundX } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, login, register } = useExpense();
  const [mode, setMode] = useState<'login' | 'register'>('login'); 
  const [username, setUsername] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [roomCode, setRoomCode] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [showNotRegistered, setShowNotRegistered] = useState(false);
  
  if (!isLoginModalOpen) return null;

  const submit = (event: React.FormEvent) => { 
    event.preventDefault(); 
    setMessage(''); 
    const result = mode === 'login' ? login(username, phone, roomCode) : register(username, phone, roomCode); 
    if (!result.success) { 
      setMessage(result.message || 'Please check your details.'); 
      setShowNotRegistered(Boolean(result.notRegistered)); 
    } 
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl">
    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-5 sm:p-7 border-b border-slate-800 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-indigo-500/10 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"><KeyRound /></div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">MaasaSelavu</p>
          <h2 className="font-black text-xl text-white">Your home, in sync.</h2>
          <p className="text-xs text-slate-400">Sign in to access your rooms and expenses.</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <button onClick={() => { setMode('login'); setMessage(''); }} className={`py-2 rounded-lg text-xs font-bold ${mode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Log In</button>
          <button onClick={() => { setMode('register'); setMessage(''); }} className={`py-2 rounded-lg text-xs font-bold ${mode === 'register' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Register</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300">{mode === 'login' ? 'Username or phone number' : 'Username'} *</label>
            <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder={mode === 'login' ? 'e.g. Suresh or Tamil' : 'Choose a username'} className="mt-1.5 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300">Phone number *</label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210 or 9876543214" className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Room Code (Optional)</span>
              <span className="text-[10px] text-slate-500 font-mono">e.g. FLAT302</span>
            </label>
            <div className="relative mt-1.5">
              <DoorOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
              <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} placeholder="Enter room code to join directly (e.g. FLAT302)" className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono uppercase" />
            </div>
          </div>

          {message && <p className="flex gap-2 text-xs text-rose-400"><AlertCircle className="w-4 h-4 shrink-0" />{message}</p>}

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-black text-sm flex justify-center gap-2">
            {mode === 'login' ? <LogIn className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}
            {mode === 'login' ? 'Unlock my rooms' : 'Create my account'}
          </button>
        </form>

        <p className="mt-5 text-[11px] text-slate-500">Entering a room code automatically unlocks and connects you to that room on login.</p>
        <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          Demo: Suresh (9876543210) · Tamil (9876543214) | Room: FLAT302
        </div>
      </div>
    </div>

    {showNotRegistered && <div onClick={() => setShowNotRegistered(false)} className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm">
      <div onClick={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl border border-amber-500/30 bg-slate-900 p-5 sm:p-7 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center"><UserRoundX className="w-6 h-6" /></div>
        <h3 className="mt-4 text-lg font-black text-white">Account not registered</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">We don’t have an account matching these details yet. Create one to start managing rooms and expenses.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={() => setShowNotRegistered(false)} className="order-2 sm:order-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold">Try again</button>
          <button onClick={() => { setShowNotRegistered(false); setMode('register'); setMessage(''); }} className="order-1 sm:order-2 py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">Create account</button>
        </div>
      </div>
    </div>}
  </div>;
};
