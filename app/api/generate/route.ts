import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

// GoogleGenAIの初期化 (.env.localから自動でAPIキーを取得する)
const ai = new GoogleGenAI();

// DynamoDBクライアントの初期化（リージョンを東京に指定）
const ddbClient = new DynamoDBClient({
  region: "ap-southeast-2",
  // 認証情報は環境変数から自動で読み込まれます
});

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
    const planId = randomUUID();
    const createdAt = new Date().toISOString();

    // DynamoDBへ保存するパラメータの定義
    const params = {
      TableName: "TravelPlans",
      Item: {
        id: { S: planId },
        destination: { S: destination },
        days: { S: days },
        plan: { S: plan || "" },
        createdAt: { S: createdAt },
      },
    };

    // DynamoDBへ書き込み実行
    await ddbClient.send(new PutItemCommand(params));

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error generating or saving travel plan: ", error);
    return NextResponse.json(
      { error: "プランの生成または保存に失敗しました" },
      { status: 500 },
    );
  }
}
