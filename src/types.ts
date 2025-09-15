export interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

export interface ImageItem {
  id: string;
  status: 'pending' | 'done' | 'failed';
  prompt: string;
  uri?: string;
  error?: string;
}
