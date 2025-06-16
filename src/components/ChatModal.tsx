'use client'
import { X } from 'lucide-react'; // or use any close icon
import ChatBox from './ChatBox';

export type Message = {sender:'user'|'assistant'; text:string;}

export default function ChatModal({ path, content, onClose, visible, messages, setMessages }: {
  path: string;
  content?: string;
  onClose: () => void;
  visible: boolean;
  messages:Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
      if (!visible) return null;
  return (
    
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="fixed bottom-5 right-5 w-full max-w-2xl z-60">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 border-b">
            <h2 className="text-lg font-semibold">Ask a question about this file</h2>
            <button onClick={onClose}>
                <X className="w-5 h-5 cursor-pointer" />
            </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-y-auto">
            <ChatBox 
            path={path} 
            content={content}
            messages={messages}
            setMessages={setMessages} />
            </div>
        </div>
      </div>
    </div>
  );
}
