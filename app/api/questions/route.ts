import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const TIMEOUT_MS = 5000;

type QuestionRow = {
  id: string;
  category: string;
  prompt: string;
  options: string[] | null;
};

type Question = {
  id: string;
  category: string;
  prompt: string;
  options: string[];
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const categoryParam = searchParams.get('category');

    const limit = limitParam ? Number.parseInt(limitParam, 10) : DEFAULT_LIMIT;
    if (!Number.isFinite(limit) || limit <= 0 || limit > MAX_LIMIT) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const query = supabase
      .from('questions')
      .select('id, category, prompt, options')
      .eq('is_active', true);

    if (categoryParam) {
    query.eq('category', categoryParam);
  }

    const responsePromise = query.order('random').limit(limit);

    const { data, error } = await withTimeout(responsePromise, TIMEOUT_MS);

    if (error) {
      throw error;
    }

    const sanitized = (data ?? []).map<Question>((row: QuestionRow) => ({
      id: row.id,
      category: row.category,
      prompt: row.prompt,
      options: Array.isArray(row.options) ? row.options : []
    }));

    return NextResponse.json({ items: sanitized });
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json({ error: error.message }, { status: 504 });
    }

    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
