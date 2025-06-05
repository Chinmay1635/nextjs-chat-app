export interface Message {
  _id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}
