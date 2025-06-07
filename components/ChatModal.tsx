"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Send, Moon, Sun } from "lucide-react"
import type { Message } from "@/types/chat"
import { motion, AnimatePresence } from "framer-motion"

interface ChatModalProps {
  onClose: () => void
}

export default function ChatModal({ onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const getInitialPosition = () => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0 }
    }
    const isMobile = window.innerWidth <= 640
    if (isMobile) {
      // Center horizontally on mobile, keep y at bottom
      return { 
      x: (window.innerWidth) / 2, 
      y: window.innerHeight - 512 - 24 // 24px from bottom
      }
    }
    // Bottom right on desktop
    return { 
      x: window.innerWidth - 460, 
      y: window.innerHeight - 512 - 100 
    }
  }

  const [position, setPosition] = useState(getInitialPosition)

  // Update position on resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setPosition(getInitialPosition())
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchMessages()
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light")
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/chat")
      if (response.ok) {
        const data = await response.json()
        if (data.messages.length === 0) {
          setMessages([
            {
              _id: "init",
              text: "How can I help you?",
              sender: "bot",
              timestamp: new Date(),
            },
          ])
        } else {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const newMessage: Omit<Message, "_id" | "timestamp"> = {
      text: inputValue.trim(),
      sender: "user",
    }

    setIsLoading(true)
    setInputValue("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data.userMessage, data.botMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Mouse event handlers
  const onDragStart = (e: React.MouseEvent) => {
    setDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    document.body.style.userSelect = "none"
  }

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    })
  }

  const onDragEnd = () => {
    setDragging(false)
    document.body.style.userSelect = "auto"
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDrag)
      window.addEventListener("mouseup", onDragEnd)
    } else {
      window.removeEventListener("mousemove", onDrag)
      window.removeEventListener("mouseup", onDragEnd)
    }
    return () => {
      window.removeEventListener("mousemove", onDrag)
      window.removeEventListener("mouseup", onDragEnd)
    }
  }, [dragging])


  const modalClasses = theme === "light" 
    ? "bg-white text-gray-900" 
    : "bg-gray-900 text-gray-100"
  
  const inputClasses = theme === "light"
    ? "border-gray-300 focus:ring-blue-500 focus:border-transparent"
    : "border-gray-700 bg-gray-800 focus:ring-blue-400 focus:border-transparent"
  
  const buttonClasses = theme === "light"
    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
    : "bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700"

  const messageClasses = (sender: string) => theme === "light"
    ? sender === "user"
      ? "bg-blue-600 text-white"
      : "bg-gray-200 text-gray-900 border-l-4 border-green-500"
    : sender === "user"
      ? "bg-blue-500 text-white"
      : "bg-gray-700 text-gray-100 border-l-4 border-green-400"

  return (
    <motion.div 
      style={{ position: "fixed", left: position.x, top: position.y, zIndex: 50, width: "100%", maxWidth: 448 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=" bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className={`rounded-xl shadow-2xl w-full max-w-md h-[32rem] flex flex-col overflow-hidden ${modalClasses}`}
      >
        {/* Header */}
        <div
          className={`chat-modal-header flex items-center bg-blue-600 justify-between p-4 border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}
          style={{ cursor: "move" }}
          onMouseDown={onDragStart}
        >
          <h2 className="text-lg text-white font-semibold">Chat Assistant</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === "light" ? "text-gray-700 hover:bg-gray-100" : "text-yellow-300 hover:bg-gray-700"}`}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose} 
              className={`p-2 rounded-full ${theme === "light" ? "text-white   hover:text-gray-600 hover:bg-gray-100" : "text-white hover:text-gray-200 hover:bg-gray-700"} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mt-8"
            >
              No messages yet. Start a conversation!
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-xl ${messageClasses(message.sender)} transition-all duration-200`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "opacity-80" : "opacity-60"}`}>
                      {message.sender === "bot" && "🤖 "}
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className={`max-w-xs px-4 py-3 rounded-xl ${messageClasses("bot")}`}>
                <motion.div 
                  className="flex items-center space-x-2"
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                >
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${theme === "light" ? "bg-gray-500" : "bg-gray-400"}`}></div>
                    <div className={`w-2 h-2 rounded-full ${theme === "light" ? "bg-gray-500" : "bg-gray-400"}`}></div>
                    <div className={`w-2 h-2 rounded-full ${theme === "light" ? "bg-gray-500" : "bg-gray-400"}`}></div>
                  </div>
                  <span className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>AI is thinking...</span>
                </motion.div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t bg-blue-600 ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
          <motion.div 
            className="flex gap-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${inputClasses} transition-all duration-200`}
              disabled={isLoading}
            />
            <motion.button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${buttonClasses}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}