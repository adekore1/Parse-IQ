'use client';
import { X } from 'lucide-react';
import ChatBox from './ChatBox';

export type Message = { sender: 'user' | 'assistant'; text: string; };

export default function ChatModal({
  path,
  content,
  onClose,
  visible,
  messages,
  setMessages
}: {
  path: string;
  content?: string;
  onClose: () => void;
  visible: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="fixed bottom-5 right-5 w-full max-w-2xl z-60">
        <div className="bg-[#242428] text-gray-200 w-full rounded-lg shadow-xl overflow-hidden border border-[#141414]">
          <div className="flex justify-between items-center px-4 py-2 border-b border-[#373737]">
            <h2 className="text-sm font-semibold text-gray-300">Ask a question about this file</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
            </button>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto bg-[#1f1f24]">
            <ChatBox
              path={path}
              content={content}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
