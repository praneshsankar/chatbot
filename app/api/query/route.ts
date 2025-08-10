import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

export async function POST(req: Request) {
  const { query } = await req.json();

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
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  const index = pinecone.Index('my-index');
  const searchResults = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
  });

  const context = searchResults.matches.map((m) => m.metadata?.text).join('\n');

  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Answer based on context.' },
      { role: 'user', content: `${query}\n\nContext:\n${context}` },
    ],
  });

  return NextResponse.json({ answer: chatResponse.choices[0].message.content });
}
