import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, Lightbulb, BarChart3, Clock, Users, Heart, AlertCircle, CheckCircle, TrendingUp, MessageSquare } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'analytics' | 'basic' | 'operational';
  confidence?: number;
}

interface SuggestedQuestion {
  id: string;
  question: string;
  category: 'analytics' | 'basic' | 'operational';
  icon: any;
}

export default function AskEva() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Eva, your AI healthcare assistant. I can help you with analytics, operational questions, and general information. How can I assist you today?",
      timestamp: new Date(),
      category: 'basic',
      confidence: 100
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const suggestedQuestions: SuggestedQuestion[] = [
    {
      id: '1',
      question: "How many human agents do I have in queue?",
      category: 'operational',
      icon: Users
    },
    {
      id: '2',
      question: "How is patient check-in time trending?",
      category: 'analytics',
      icon: TrendingUp
    },
    {
      id: '3',
      question: "Show me patient satisfaction scores",
      category: 'analytics',
      icon: Heart
    },
    {
      id: '4',
      question: "What are the clinic's operating hours?",
      category: 'basic',
      icon: Clock
    },
    {
      id: '5',
      question: "What is the average wait time for appointments?",
      category: 'operational',
      icon: BarChart3
    },
    {
      id: '6',
      question: "How do I schedule an appointment?",
      category: 'basic',
      icon: MessageSquare
    }
  ];

  const askEvaMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch("/api/v1/ask-eva/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, context: messages.slice(-5) })
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        category: data.category || 'basic',
        confidence: data.confidence || 95
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error("Error asking Eva:", error);
      toast({
        title: "Error",
        description: "Failed to get response from Eva. Please try again.",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  });

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    askEvaMutation.mutate(message);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'analytics': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return BarChart3;
      case 'operational': return Users;
      case 'basic': return Lightbulb;
      default: return MessageSquare;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ask Eva</h1>
            <p className="text-sm sm:text-base text-gray-600">Your AI healthcare assistant and copilot</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] sm:h-[600px] flex flex-col">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span>Conversation</span>
                {isTyping && (
                  <Badge variant="secondary" className="animate-pulse text-xs">
                    Eva is typing...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-start space-x-2">
                          {message.type === 'assistant' && (
                            <div className="p-1.5 bg-purple-100 rounded-full mt-1">
                              <Bot className="h-4 w-4 text-purple-600" />
                            </div>
                          )}
                          <div className={`rounded-lg px-4 py-2 ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.type === 'assistant' && (
                                <div className="flex items-center space-x-2">
                                  {message.category && (
                                    <Badge className={`text-xs ${getCategoryColor(message.category)}`}>
                                      {message.category}
                                    </Badge>
                                  )}
                                  {message.confidence && message.confidence > 90 && (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {message.type === 'user' && (
                            <div className="p-1.5 bg-blue-100 rounded-full mt-1">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <Separator />
              
              <div className="p-6">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Eva anything about analytics, operations, or general questions..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={() => handleSendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eva's Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                  <TabsTrigger value="operational" className="text-xs">Operations</TabsTrigger>
                  <TabsTrigger value="basic" className="text-xs">General</TabsTrigger>
                </TabsList>
                <TabsContent value="analytics" className="space-y-2 mt-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Analytics Questions:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Patient satisfaction trends</li>
                      <li>Check-in time analysis</li>
                      <li>Queue performance metrics</li>
                      <li>Comparative data analysis</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="operational" className="space-y-2 mt-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Operational Questions:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Current queue status</li>
                      <li>Agent availability</li>
                      <li>Wait time monitoring</li>
                      <li>Real-time metrics</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="basic" className="space-y-2 mt-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">General Questions:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Clinic information</li>
                      <li>Procedures & policies</li>
                      <li>Appointment scheduling</li>
                      <li>Insurance information</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eva Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online & Ready</span>
              </div>
              <div className="text-xs text-gray-500">
                <p>HIPAA Compliant • Secure • 24/7 Available</p>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedQuestions.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => handleSuggestedQuestion(item.question)}
                  disabled={isTyping}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <item.icon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 leading-relaxed break-words whitespace-normal flex-1">{item.question}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}