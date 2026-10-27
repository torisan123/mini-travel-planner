import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// GoogleGenAIの初期化 (.env.localから自動でAPIキーを取得する)
const ai = new GoogleGenAI();

export async function POST(request: Request) {
  try {
    const { destination, days } = await request.json();

    if (!destination || !days) {
      return NextResponse.json(
        { error: "行き先と日数を入力してください" },
        { status: 400 },
      );
    }

    // Geminiプロンプトを作成
    const prompt = `${destination}へ${days}の旅行に行きます。おすすめの観光スポット、グルメ、簡単なモデルコース（1日目、2日目...）を日本語でわかりやすく提案してください。`;

    // Geimini APIの呼び出し
    const reponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const plan = reponse.text;

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error generating travel plan: ", error);
    return NextResponse.json(
      { error: "プランの生成に失敗しました" },
      { status: 500 },
    );
  }
}
