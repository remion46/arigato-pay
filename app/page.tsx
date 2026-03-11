"use client";
import React, { useState, useEffect } from 'react';
import { Heart, LogOut, Copy, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ArigatoPay() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [actions, setActions] = useState<any[]>([]);
  const [receivedCoins, setReceivedCoins] = useState(0);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [inputPartnerId, setInputPartnerId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchInitialData(session.user.id);
      setLoading(false);
    });
  }, []);

  const fetchInitialData = async (userId: string) => {
    // 1. アクション一覧取得
    const { data: actData } = await supabase.from('couple_actions').select('*');
    if (actData) setActions(actData);

    // 2. パートナー紐付け確認
    const { data: cpData } = await supabase.from('couples')
      .select('*')
      .or(`user_1.eq.${userId},user_2.eq.${userId}`)
      .single();
    
    if (cpData) {
      const pId = cpData.user_1 === userId ? cpData.user_2 : cpData.user_1;
      setPartnerId(pId);
      // 3. パートナーから受け取ったコインの合計
      const { data: logs } = await supabase.from('activity_logs')
        .select('coins_earned')
        .eq('receiver_id', userId)
        .eq('sender_id', pId);
      
      if (logs) {
        setReceivedCoins(logs.reduce((acc, log) => acc + log.coins_earned, 0));
      }
    }
  };

  const handlePairing = async () => {
    if (!user || !inputPartnerId) return;
    const { error } = await supabase.from('couples').insert([
      { user_1: user.id, user_2: inputPartnerId }
    ]);
    if (error) alert("ペアリングに失敗しました。IDを確認してください。");
    else window.location.reload();
  };

  const handleSend = async (action: any) => {
    if (!user || !partnerId) return alert("まずはパートナーと紐付けしてください");
    
    const { error } = await supabase.from('activity_logs').insert([{
      sender_id: user.id,
      receiver_id: partnerId,
      action_name: action.name,
      coins_earned: action.coins,
    }]);

    if (!error) alert(`相手に ${action.coins} 枚贈りました！`);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) alert(signUpError.message);
      else alert("登録しました。もう一度ログインしてください。");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-primary">Loading...</div>;

  if (!user) {
    return (
      <main className="max-w-md mx-auto p-10 mt-20 space-y-6 text-center">
        <Heart className="mx-auto text-primary w-16 h-16 fill-current" />
        <h1 className="text-3xl font-black text-primary italic">arigato-pay</h1>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <label className="text-xs font-bold text-gray-400 ml-1">MAIL ADDRESS</label>
          <input type="email" placeholder="example@gmail.com" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary" value={email} onChange={e => setEmail(e.target.value)} />
          <label className="text-xs font-bold text-gray-400 ml-1">PASSWORD</label>
          <input type="password" placeholder="••••••" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-primary text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all">ログイン / 新規登録</button>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 min-h-screen pb-20">
      <header className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tighter">
          <Heart size={24} className="fill-current" /> arigato-pay
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-gray-300 hover:text-gray-500"><LogOut size={20} /></button>
      </header>

      <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-[2.5rem] p-10 shadow-2xl shadow-rose-200 text-white relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] mb-2">My Balance</p>
          <p className="text-7xl font-black">{receivedCoins.toLocaleString()}<span className="text-xl ml-2 font-medium">coins</span></p>
        </div>
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {!partnerId ? (
        <section className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
            <LinkIcon size={16} /> パートナーと紐付ける
          </div>
          <div className="p-4 bg-gray-50 rounded-xl break-all text-[10px] font-mono text-gray-500 relative">
            <p className="mb-1 text-gray-400">あなたのID:</p>
            {user.id}
            <button onClick={() => { navigator.clipboard.writeText(user.id); alert("コピーしました"); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"><Copy size={16}/></button>
          </div>
          <input 
            type="text" 
            placeholder="相手のIDを入力" 
            className="w-full p-4 border rounded-2xl text-sm"
            value={inputPartnerId}
            onChange={e => setInputPartnerId(e.target.value)}
          />
          <button onClick={handlePairing} className="w-full bg-gray-800 text-white p-4 rounded-2xl font-bold">連携する</button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <p className="font-black text-gray-300 text-[10px] tracking-[0.3em] uppercase ml-2">Send Thanks</p>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleSend(action)}
              className="group flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 active:scale-95 transition-all text-left hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl group-active:animate-bounce">{action.icon_emoji}</span>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{action.category}</p>
                  <p className="font-bold text-gray-700 text-lg">{action.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary font-black text-xl">+{action.coins}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
