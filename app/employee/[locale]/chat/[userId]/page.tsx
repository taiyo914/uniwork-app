// "use client"
// import { useParams } from "next/navigation";
// import { useState } from "react";

// export default function PrivateChatPage() {
//   const { userId} =  useParams()

//   const [messages, setMessages] = useState([
//     { id: 1, user: userId, content: 'こんにちは、田中さん！', createdAt: '2023/06/19 19:05:00' },
//     { id: 2, user: '自分', content: 'こんにちは、' + userId + 'さん！', createdAt: '2023/06/19 19:10:00' },
//   ]);

//   const [newMessage, setNewMessage] = useState('');

//   const handleSendMessage = () => {
//     if (newMessage.trim() === '') return;

//     // メッセージを追加する（仮のデータで追加）
//     setMessages([...messages, { id: Date.now(), user: '自分', content: newMessage, createdAt: new Date().toLocaleString() }]);
//     setNewMessage('');
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <h2 className="text-xl font-bold mb-4">{userId}さんとのチャット</h2>

//       {/* メッセージ一覧 */}
//       <div className="flex-1 overflow-y-auto space-y-4 mb-4">
//         {messages.map((message) => (
//           <div key={message.id} className="p-4 bg-white border rounded shadow">
//             <div className="font-semibold">{message.user} <span className="text-gray-500 text-sm">{message.createdAt}</span></div>
//             <p>{message.content}</p>
//           </div>
//         ))}
//       </div>

//       {/* メッセージ入力フォーム */}
//       <div className="flex items-center border-t p-4">
//         <input
//           type="text"
//           placeholder="メッセージを入力..."
//           className="flex-1 border border-gray-300 rounded p-2 mr-2"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//         />
//         <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
//           送信
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";
import React from "react";
import { useParams } from "next/navigation";
import VerticalChatNav from "../VerticalChatNav";
import DirectChat from "../DirectChat";

export default function ChatUserPage() {
  const { userId } = useParams(); // userIdを取得

  return (
    // <div className="flex h-screen">
      
    //   <div className="sm:max-w-52 md:max-w-64 w-full hidden sm:block ">
    //     <VerticalChatNav />
    //   </div>

      
    //   <div className=" w-full h-full p-4 overflow-auto">
    //     <DirectChat userId={userId as string} />
    //   </div>
    // </div>
    <DirectChat userId={userId as string} />
  );
}
