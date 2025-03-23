export type ModelType = 'text' | 'image' | 'audio' | 'video';

export interface Model {
  id: string;
  created_at: string;
  name: string;
  type: ModelType;
  description?: string;
  user_id: string;
  token_name?: string;
  token_symbol?: string;
  token_address?: string;
  tokens_per_prompt?: number;
  apt_per_token?: number;
} 
