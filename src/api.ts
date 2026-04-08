import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface Candidate {
  id: string;
  category_id: string;
  name: string;
  image_url: string;
  bio: string;
  vote_count: number;
  is_active: boolean;
}

export interface Vote {
  id: string;
  user_id: string;
  candidate_id: string;
  category_id: string;
  voted_at: string;
}

export interface VoteResult {
  success: boolean;
  error?: string;
  next_vote_at?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data ?? [];
}

export async function fetchCandidates(categoryId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('vote_count', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchUserVoteForCategory(categoryId: string): Promise<Vote | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('category_id', categoryId)
    .order('voted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function castVote(candidateId: string, categoryId: string): Promise<VoteResult> {
  const { data, error } = await supabase.rpc('cast_vote', {
    p_candidate_id: candidateId,
    p_category_id: categoryId,
  });

  if (error) throw error;
  return data as VoteResult;
}

export async function fetchLeaderboard(): Promise<(Candidate & { category_name: string })[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, categories(name)')
    .eq('is_active', true)
    .order('vote_count', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    ...c,
    category_name: c.categories?.name ?? 'Unknown',
  }));
}
