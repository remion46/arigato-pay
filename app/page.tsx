"use client";
import React, { useState, useEffect } from 'react';
import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ArigatoPay() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [actions, setActions] = useState<any[]>([]);
  const [receivedCoins, setReceivedCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログイン状態の監視
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAppData(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAppData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAppData = async (userId: string) => {
    // アクション一覧取得
    const { data: actionData } = await supabase.from('couple_actions').select('*');
    if (actionData) setActions(actionData);

    // 自分が「受け取った」コインの合計を計算
    const { data: logs } = await supabase.from('activity_logs')
      .select('coins_earned')
      .eq('receiver_id', userId);
    
    if (logs) {
      const sum = logs.reduce((acc, log) => acc + log.coins_earned, 0);
      setReceivedCoins(sum);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) await supabase.auth.signUp({ email, password }); // アカウントがなければ作成
  };

  const handleSend = async (action: any) => {
    if (!user) return;
    
    // パートナーのID（本来は紐付けテーブルから取得しますが、テスト用に「自分以外」の全ログを表示するロジックにします）
    // 暫定的に：自分が送った履歴を保存
    const { error } = await supabase.from('activity_logs').insert([{
      sender_id: user.id,
      action_name: action.name,
      coins_earned: action.coins,
      // 本来はここに receiver_id (相手のID) を入れます
    }]);

    if (!error) alert(`${action.name}を贈りました！`);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (loading) return <div className="p-10 text-center font-bold text-primary">Loading...</div>;

  // 未ログイン時の画面
  if (!user) {
    return (
      <main className="max-w-md mx-auto p-10 mt-20 space-y-6 text-center">
        <Heart className="mx-auto text-primary w-16 h-16 fill-current" />
        <h1 className="text-3xl font-black text-primary">arigato-pay</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="メールアドレス" className="w-full p-4 border rounded-2xl" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="パスワード" className="w-full p-4 border rounded-2xl" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-primary text-white p-4 rounded-2xl font-bold">ログイン / 新規登録</button>
        </form>
      </main>
    );
  }

  // ログイン後のメイン画面
  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Heart size={20} className="fill-current" /> arigato-pay
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-gray-400"><LogOut size={20} /></button>
      </header>

      <div className="bg-gradient-to-br from-primary to-rose-400 rounded-3xl p-8 shadow-xl text-white">
        <p className="text-xs font-bold opacity-80 uppercase tracking-widest text-center">受け取った感謝の総額</p>
        <p className="text-6xl font-black text-center mt-2">{receivedCoins.toLocaleString()}<span className="text-xl ml-1">枚</span></p>
      </div>

      <p className="font-bold text-gray-400 text-xs px-2 tracking-widest uppercase">パートナーに感謝を贈る</p>
      
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleSend(action)}
            className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{action.icon_emoji}</span>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{action.category}</p>
                <p className="font-bold text-gray-700">{action.name}</p>
              </div>
            </div>
            <span className="text-primary font-bold">+{action.coins}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
