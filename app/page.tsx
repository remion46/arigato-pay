"use client";
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ArigatoPay() {
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 起動時にデータベースからデータを取得
  useEffect(() => {
    async function fetchData() {
      // アクション一覧を取得
      const { data: actionData } = await supabase.from('couple_actions').select('*');
      if (actionData) setActions(actionData);
      
      // 仮のユーザー（IDは後でペアリング機能時に動的にします）としてデータを取得
      // 今回はプロトタイプとして全ログの合計を表示
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. ボタンを押した時の処理
  const handlePay = async (actionName: string, coins: number) => {
    // 画面上の数字を即座に更新（バイブス優先）
    setTotal(prev => prev + coins);

    // 実際の運用ではここに activity_logs への保存処理を追加します
    console.log(`${actionName}で${coins}枚獲得！`);
    
    // スマホのバイブ機能を呼び出し（対応端末のみ）
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-primary">Loading arigato...</div>;

  return (
    <main className="max-w-md mx-auto p-6 space-y-8">
      <header className="text-center pt-8">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Heart className="fill-current" /> arigato-pay
        </h1>
        <div className="mt-4 bg-white rounded-3xl p-6 shadow-sm border-2 border-primary/10">
          <p className="text-sm text-gray-500 font-medium">現在の感謝コイン</p>
          <p className="text-5xl font-black text-primary mt-1">{total.toLocaleString()}<span className="text-xl ml-1">枚</span></p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handlePay(action.name, action.coins)}
            className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:border-primary/30 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{action.icon_emoji}</span>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{action.category}</p>
                <p className="font-bold text-gray-700 leading-tight">{action.name}</p>
              </div>
            </div>
            <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
              +{action.coins}
            </span>
          </button>
        ))}
      </section>

      <footer className="text-center text-gray-300 text-[10px] pb-10 uppercase tracking-tighter">
        Connected to Supabase Database
      </footer>
    </main>
  );
}
