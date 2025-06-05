"use client"

import { MessageCircle } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-4 py-3 group"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium">Chat</span>
    </button>
  )
}
