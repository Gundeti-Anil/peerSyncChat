export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  interestedIn: string[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isOwn?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

}