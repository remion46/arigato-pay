"use client";
import React, { useState } from 'react';
import { Heart, Home, MapPin, MessageCircle } from 'lucide-react';

const ACTIONS = [
  { id: 1, cat: '同棲', name: '汚れ仕事', coins: 500, emoji: '🧼' },
  { id: 2, cat: '同棲', name: '献立・在庫', coins: 300, emoji: '🍳' },
  { id: 3, cat: '同棲', name: 'フォロー', coins: 100, emoji: '💡' },
  { id: 4, cat: 'デート', name: '店・ルート', coins: 400, emoji: '📍' },
  { id: 5, cat: 'デート', name: '写真撮影', coins: 200, emoji: '📸' },
  { id: 6, cat: 'デート', name: '決断', coins: 300, emoji: '🗺️' },
  { id: 7, cat: 'リモート', name: '愚痴鑑賞', coins: 400, emoji: '👂' },
  { id: 8, cat: 'リモート', name: '気遣い', coins: 100, emoji: '💌' },
  { id: 9, cat: 'リモート', name: 'シェア', coins: 50, emoji: '💬' },
];

export default function ArigatoPay() {
  const [total, setTotal] = useState(0);

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
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => setTotal(t => t + action.coins)}
            className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{action.emoji}</span>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{action.cat}</p>
                <p className="font-bold text-gray-700">{action.name}</p>
              </div>
            </div>
            <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
              +{action.coins}
            </span>
          </button>
        ))}
      </section>

      <footer className="text-center text-gray-400 text-xs pb-10">
        ボタンを押して感謝を貯めよう
      </footer>
    </main>
  );
}
