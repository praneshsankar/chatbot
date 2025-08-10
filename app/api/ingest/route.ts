import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
  }

  if (!process.env.PINECONE_API_KEY) {
    return NextResponse.json({ error: 'PINECONE_API_KEY is not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = embeddingResponse.data[0].embedding;

  const index = pinecone.Index('my-index');
  await index.upsert([
    {
      id: `id-${Date.now()}`,
      values: embedding,
      metadata: { text },
    },
  ]);

  return NextResponse.json({ success: true });
}
