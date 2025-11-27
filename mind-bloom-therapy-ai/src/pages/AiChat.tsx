
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ChevronDown, Info, Bot, Smile } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const AiChat = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      content: "Hello! I'm your AI therapy assistant. How are you feeling today?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      generateAiResponse(inputValue);
    }, 1000);
  };

  const generateAiResponse = (userInput: string) => {
    // Mock AI response logic
    let response = "";
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("anxious") || lowerInput.includes("anxiety")) {
      response = "It sounds like you're experiencing anxiety. That's completely normal and something many people face. Can you tell me more about what's making you feel anxious?";
    } else if (lowerInput.includes("sad") || lowerInput.includes("depressed") || lowerInput.includes("unhappy")) {
      response = "I'm sorry to hear you're feeling down. Would it help to talk about what's causing these feelings? Sometimes expressing our emotions is the first step toward feeling better.";
    } else if (lowerInput.includes("stressed") || lowerInput.includes("overwhelmed")) {
      response = "Being stressed and overwhelmed can be exhausting. Let's try to break down what's causing this feeling and think about small steps we can take to address each stressor.";
    } else if (lowerInput.includes("happy") || lowerInput.includes("good") || lowerInput.includes("great")) {
      response = "I'm glad to hear you're feeling positive! What's contributing to these good feelings? Recognizing what brings us joy can help us cultivate more positive experiences.";
    } else if (lowerInput.includes("help") || lowerInput.includes("therapist") || lowerInput.includes("professional")) {
      response = "While I'm here to support you, sometimes speaking with a licensed therapist can provide more personalized guidance. Would you like information about connecting with one of our human therapists?";
    } else {
      response = "Thank you for sharing that with me. Can you tell me more about how this is affecting you? The more I understand, the better I can support you.";
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: response,
      sender: "ai",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    // If user asks about professional help, show a toast with info
    if (lowerInput.includes("therapist") || lowerInput.includes("professional") || lowerInput.includes("human")) {
      toast({
        title: "Connect with a Therapist",
        description: "Upgrade to our Premium or Complete plan to connect with licensed therapists.",
        action: (
          <Button variant="default" size="sm" className="bg-therapy-purple">
            See Plans
          </Button>
        ),
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 pb-0 flex flex-col bg-therapy-light-purple">
        <div className="container mx-auto flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 pt-4">
            <h1 className="text-2xl font-bold">AI Therapy Session</h1>
            <Button variant="outline" size="sm" className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              How This Works
            </Button>
          </div>
          
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-therapy-purple p-3 text-white flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-white text-therapy-purple">AI</AvatarFallback>
                  <AvatarImage src="/placeholder.svg" />
                </Avatar>
                <span>MindBloom AI Assistant</span>
              </div>
              <Button variant="ghost" size="icon" className="text-white">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-therapy-purple text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-therapy-purple text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-therapy-blue text-therapy-deep-purple">
                        YOU
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarFallback className="bg-therapy-purple text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "100ms" }}></div>
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Smile className="h-5 w-5 text-gray-500" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  type="submit"
                  className="bg-therapy-purple hover:bg-therapy-deep-purple"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Free users have 5 AI sessions per month. <a href="/pricing" className="text-therapy-purple hover:underline">Upgrade</a> for unlimited sessions.
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AiChat;
