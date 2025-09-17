export type Tab = 'chat' | 'image';

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

export interface PuterUser {
  username: string;
  // Add other user properties if needed
}

export interface PuterContextType {
  isLoggedIn: boolean;
  user: PuterUser | null;
  login: () => void;
  logout: () => void;
  puter: any; // Using 'any' for simplicity, can be typed more strictly
}


// Add Puter to the window object for TypeScript
declare global {
  interface Window {
    puter: any;
  }
}
