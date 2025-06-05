"use client"

import { useState } from "react"
import FloatingActionButton from "@/components/FloatingActionButton"
import ChatModal from "@/components/ChatModal"

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Chat App</h1>
        <p className="text-lg text-gray-600 mb-8">
         This is assignment for position of Next.Js developer intern at CareerSecure
        </p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Floating Action Button with chat functionality</li>
            <li>• Modal-based chat interface</li>
            <li>• AI-powered responses using Google Gemini</li>
            <li>• MongoDB Atlas integration for message persistence</li>
            <li>• Real-time message sending and retrieval</li>
            <li>• Intelligent conversation flow</li>
            <li>• Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>

      <FloatingActionButton onClick={() => setIsChatOpen(true)} />
      <div className="absolute bottom-0 left-[45%]">&copy; Chinmay Kulkarni</div>
      {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
    </div>
  )
}
