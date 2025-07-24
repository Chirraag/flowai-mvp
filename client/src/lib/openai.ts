import { useState } from "react";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Note: In a real implementation, this would use the OpenAI npm package to make calls to the API
// This is a mock implementation for demonstration purposes

interface AIAgentResponse {
  message: string;
  audioUrl?: string;
}

export async function simulateAIAgentResponse(input: string, language: string = "en"): Promise<AIAgentResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock responses based on input and language
  if (language === "es") {
    if (input.toLowerCase().includes("cita")) {
      return {
        message: "Estaría encantado de ayudarle a programar una cita. ¿Podría compartir la fecha y hora preferidas, y qué médico le gustaría ver?",
      };
    } else {
      return {
        message: "¡Hola! Soy su asistente de Flow AI. ¿Cómo puedo ayudarle hoy? ¿Le gustaría programar una cita, verificar una cita existente o obtener información sobre nuestros servicios?",
      };
    }
  } else if (language === "zh") {
    if (input.toLowerCase().includes("预约")) {
      return {
        message: "我很乐意帮助您安排预约。您能否分享您的首选日期和时间，以及您想要看哪位医生？",
      };
    } else {
      return {
        message: "您好！我是您的Flow AI助手。今天我能为您做些什么？您想预约、查询现有预约还是了解我们的服务？",
      };
    }
  } else {
    // English responses
    if (input.toLowerCase().includes("appointment")) {
      return {
        message: "I'd be happy to help you schedule an appointment. Could you please share your preferred date and time, and which doctor you'd like to see?",
      };
    } 
    else if (input.toLowerCase().includes("doctor") || input.toLowerCase().includes("provider")) {
      return {
        message: "We have several providers available. Could you please specify what specialty you're looking for?",
      };
    }
    else if (input.toLowerCase().includes("cancel")) {
      return {
        message: "I understand you'd like to cancel an appointment. May I have your name and date of birth to locate your records?",
      };
    }
    else if (input.toLowerCase().includes("insurance")) {
      return {
        message: "I can help with insurance verification. Could you please provide your insurance provider name and policy number?",
      };
    }
    else {
      return {
        message: "Hello! I'm your Flow AI assistant. How can I help you today? Would you like to schedule an appointment, check an existing appointment, or get information about our services?",
      };
    }
  }
}

export function useVoiceAgent(language: string = "en") {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const getGreeting = () => {
    switch (language) {
      case "es":
        return "¡Hola! Soy su asistente de Flow AI. ¿Cómo puedo ayudarle hoy? ¿Le gustaría programar una cita, verificar una cita existente o obtener información sobre nuestros servicios?";
      case "zh":
        return "您好！我是您的Flow AI助手。今天我能为您做些什么？您想预约、查询现有预约还是了解我们的服务？";
      default:
        return "Hello! I'm your Flow AI assistant. How can I help you today? Would you like to schedule an appointment, check an existing appointment, or get information about our services?";
    }
  };
  
  const generateResponse = async (input: string) => {
    setIsProcessing(true);
    try {
      return await simulateAIAgentResponse(input, language);
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    getGreeting,
    generateResponse,
  };
}
