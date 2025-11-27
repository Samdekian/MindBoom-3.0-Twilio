
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  thread_id?: string;
  subject?: string;
  content: string;
  message_type: 'direct' | 'session_prep' | 'progress_update' | 'system';
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface MessageThread {
  id: string;
  messages: Message[];
  participants: string[];
  last_message: Message;
  unread_count: number;
}
