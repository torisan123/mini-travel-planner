'use client';

import { useState } from 'react';

export default function Home() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !days) {
      alert('行き先と日数を入力してください');
      return;
    }

    setLoading(true);
    setPlan('');

    try {
      // API（/api/generate）へ画面からリクエスト
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days }),
      });

      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
      } else {
        alert(data.error || 'エラーが発生しました');
      }
    } catch (error) {
      console.error(error);
      alert('通信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          ✈️ Mini Travel Planner
        </h1>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              行き先（例: 沖縄、札幌）
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例: 沖縄"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日数（例: 2泊3日、1週間）
            </label>
            <input
              type="text"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="例: 2泊3日"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'AIがプランを考え中...' : '旅行プランを生成する'}
          </button>
        </form>

        {plan && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-3">🌟 おすすめ旅行プラン</h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {plan}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
