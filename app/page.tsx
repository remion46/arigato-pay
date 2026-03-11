"use client";
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ArigatoPay() {
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 起動時にアクション一覧と、これまでの合計コインを取得
  useEffect(() => {
    async function fetchData() {
      const { data: actionData } = await supabase.from('couple_actions').select('*');
      if (actionData) setActions(actionData);
      
      const { data: logs } = await supabase.from('activity_logs').select('coins_earned');
      if (logs) {
        const sum = logs.reduce((acc, log) => acc + log.coins_earned, 0);
        setTotal(sum);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. ボタンを押した時：データベースに履歴を保存し、合計を更新
  const handlePay = async (actionName: string, coins: number) => {
    // まず画面を更新（サクサク感を出すため）
    setTotal(prev => prev + coins);

    // データベースに保存
    const { error } = await supabase
      .from('activity_logs')
      .insert([{ action_name: actionName, coins_earned: coins }]);

    if (error) {
      console.error('Error saving log:', error);
      alert('保存に失敗しました');
    }
    
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-primary animate-pulse text-xl">Loading arigato...</div>;

  return (
    <main className="max-w-md mx-auto p-6 space-y-8 min-h-screen">
      <header className="text-center pt-8">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Heart className="fill-current" /> arigato-pay
        </h1>
        <div className="mt-4 bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border-2 border-primary/10">
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Total Thanks</p>
          <p className="text-6xl font-black text-primary mt-2 tracking-tighter">
            {total.toLocaleString()}<span className="text-xl ml-1">枚</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handlePay(action.name, action.coins)}
            className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 active:scale-95 active:bg-gray-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl transition-transform group-hover:scale-110">{action.icon_emoji}</span>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{action.category}</p>
                <p className="font-bold text-gray-800 text-lg leading-none">{action.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-primary font-black text-xl">+{action.coins}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] pt-4">
        Cloud Sync Enabled
      </p>
    </main>
  );
}
