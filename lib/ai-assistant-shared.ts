export const assistantLanguages = ["auto", "en", "hi", "pa"] as const;
export type AssistantLanguage = (typeof assistantLanguages)[number];

export type AssistantRole = "user" | "assistant" | "system";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  at: string;
  links?: Array<{ label: string; href: string }>;
  disclaimer?: string;
};

export type AssistantConversation = {
  id: string;
  language: Exclude<AssistantLanguage, "auto">;
  messages: AssistantMessage[];
  feedback?: "helpful" | "not-helpful";
  escalationRequested: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssistantDocument = {
  id: string;
  title: string;
  source: string;
  text: string;
  fileName?: string;
  mimeType?: string;
  storageName?: string;
  uploadedAt: string;
};

export type AssistantAnalytics = {
  conversationCount: number;
  mostAskedQuestions: Array<{ question: string; count: number }>;
  popularDepartments: Array<{ department: string; count: number }>;
  averageResponseTimeMs: number;
  satisfaction: {
    helpful: number;
    notHelpful: number;
  };
};
