"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api";

interface ChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Chatbot({ isOpen: controlledIsOpen, onOpenChange }: ChatbotProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Quantra AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const exampleQuestions = [
    "What's the current fraud detection rate?",
    "Show me pending KYC verifications",
    "Summarize AML case AML-2024-001",
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;
    
    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Get userId from localStorage
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      let userId: string | null = null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id || null;
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      const response = await apiClient.sendChatMessage(textToSend, userId);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message || "I'm processing your request...",
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-transform"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] z-50"
          >
            <Card className="w-full h-full shadow-2xl flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="rounded-2xl px-4 py-3 max-w-[80%] bg-secondary">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">AI is thinking</span>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="block w-full text-left text-sm p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button onClick={() => handleSend()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
