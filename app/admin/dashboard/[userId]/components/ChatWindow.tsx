import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message]);
      console.log('送信されたメッセージ:', message);
      setMessage(''); // メッセージを送信後にクリア
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-3 border-b">
        <h4 className="font-semibold text-gray-800">チャット</h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-64 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded-lg">
              <p className="text-sm">{msg}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="メッセージを入力..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};