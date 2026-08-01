"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  CalendarCheck,
  FileText,
  Languages,
  MapPinned,
  MessageCircle,
  Mic,
  Paperclip,
  PhoneCall,
  Send,
  Sparkles,
  Stethoscope,
  Volume2,
  X
} from "lucide-react";
import type { AssistantLanguage, AssistantMessage } from "@/lib/ai-assistant-shared";

type ApiResult = {
  ok: boolean;
  conversationId?: string;
  message?: AssistantMessage;
  language?: Exclude<AssistantLanguage, "auto">;
  escalationSuggested?: boolean;
  errors?: unknown;
  messageText?: string;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onend: () => void;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  start: () => void;
};

const suggestions = [
  "I have back pain. Which department should I choose?",
  "Explain the patient agreement documents.",
  "Check appointment availability.",
  "Show me your doctors.",
  "Where is your hospital?",
  "What are your timings?"
];

const assistantLanguageKey = "npn-ai-preferred-language";
const assistantVisitKey = "npn-ai-returning-visitor";

function createWelcome(returning = false): AssistantMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: returning
      ? "Welcome back. I can help you continue quickly: book an appointment, review treatment paths, open the patient agreement, or contact the care desk."
      : "Namaste. I am your AI care concierge for hospital-approved guidance on doctors, treatments, appointments, agreement documents, careers, FAQs, and contact details.",
    at: new Date().toISOString(),
    links: [
      { label: "Book Appointment", href: "/#appointment" },
      { label: "Digital Agreement", href: "/agreement" },
      { label: "Contact", href: "/contact" }
    ]
  };
}

const quickActions = [
  {
    title: "Symptom Navigator",
    description: "Find the right care path without diagnosis.",
    prompt: "I have back pain. Which department should I choose?",
    icon: Stethoscope
  },
  {
    title: "Documents",
    description: "Agreement, reports, forms, and uploads.",
    prompt: "Explain the patient agreement documents.",
    icon: FileText
  },
  {
    title: "Appointment",
    description: "Request a visit and confirm next steps.",
    prompt: "Check appointment availability.",
    icon: CalendarCheck
  },
  {
    title: "Navigation",
    description: "Open doctors, contact, gallery, or blog.",
    prompt: "Show me your doctors.",
    icon: MapPinned
  }
];

export function HealthAssistant() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<AssistantLanguage>("auto");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<AssistantMessage[]>([createWelcome()]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    department: "",
    preferredDoctor: "",
    preferredDate: "",
    preferredTime: "Morning"
  });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedLanguage = window.sessionStorage.getItem(assistantLanguageKey) as AssistantLanguage | null;
    const returning = window.localStorage.getItem(assistantVisitKey) === "true";

    if (savedLanguage && ["auto", "en", "hi", "pa"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    if (returning) {
      setMessages([createWelcome(true)]);
    } else {
      window.localStorage.setItem(assistantVisitKey, "true");
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(assistantLanguageKey, language);
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, " "));
    utterance.lang = language === "hi" ? "hi-IN" : language === "pa" ? "pa-IN" : "en-IN";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function startVoice() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInput("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "pa" ? "pa-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      setInput(event.results[0]?.[0]?.transcript ?? "");
    };
    recognition.start();
  }

  async function sendMessage(messageText = input) {
    const trimmed = messageText.trim();
    if (!trimmed && !file) return;

    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: file ? `${trimmed || "Please review this uploaded report."}\nUploaded: ${file.name}` : trimmed,
      at: new Date().toISOString()
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setTyping(true);

    const formData = new FormData();
    formData.set("message", trimmed || "Please review this uploaded medical file.");
    formData.set("language", language);
    if (conversationId) formData.set("conversationId", conversationId);
    if (file) formData.set("attachment", file);
    if (bookingOpen && booking.name && booking.phone && booking.department && booking.preferredDate) {
      formData.set("appointment", JSON.stringify(booking));
    }

    const response = await fetch("/api/ai-assistant", {
      method: "POST",
      body: formData
    });
    const result = (await response.json()) as ApiResult;
    setTyping(false);
    setFile(null);

    if (!response.ok || !result.message) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I could not answer safely right now. Please contact the hospital care desk.",
          at: new Date().toISOString(),
          links: [{ label: "Contact", href: "/contact" }]
        }
      ]);
      return;
    }

    setConversationId(result.conversationId);
    if (result.language) setLanguage(result.language);
    setMessages((current) => [...current, result.message as AssistantMessage]);
  }

  return (
    <>
      <motion.button
        className="ai-float-button"
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, scale: 1.02 }}
        aria-label="Open AI health assistant"
      >
        <Sparkles size={18} />
        <span>AI Care</span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            className="ai-assistant-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="AI Health Assistant"
          >
            <header className="ai-assistant-header">
              <span className="ai-orb">
                <Bot size={22} />
              </span>
              <div>
                <strong>N.P.N. AI Care</strong>
                <small>Hospital-approved guidance only</small>
              </div>
              <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
                <X size={19} />
              </button>
            </header>

            <div className="ai-language-row">
              <Languages size={16} />
              <select value={language} onChange={(event) => setLanguage(event.target.value as AssistantLanguage)} aria-label="Assistant language">
                <option value="auto">Auto detect</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="pa">Punjabi</option>
              </select>
              <button className="chip-button" type="button" onClick={() => setBookingOpen((current) => !current)}>
                <CalendarCheck size={15} />
                Appointment
              </button>
            </div>

            {bookingOpen ? (
              <div className="ai-booking-card">
                <input placeholder="Name" value={booking.name} onChange={(event) => setBooking({ ...booking, name: event.target.value })} />
                <input placeholder="Phone" value={booking.phone} onChange={(event) => setBooking({ ...booking, phone: event.target.value })} />
                <input placeholder="Department / concern" value={booking.department} onChange={(event) => setBooking({ ...booking, department: event.target.value })} />
                <input placeholder="Preferred doctor" value={booking.preferredDoctor} onChange={(event) => setBooking({ ...booking, preferredDoctor: event.target.value })} />
                <input type="date" value={booking.preferredDate} onChange={(event) => setBooking({ ...booking, preferredDate: event.target.value })} />
                <select value={booking.preferredTime} onChange={(event) => setBooking({ ...booking, preferredTime: event.target.value })}>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </div>
            ) : null}

            <section className="ai-concierge-grid" aria-label="AI concierge quick actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button type="button" key={action.title} onClick={() => void sendMessage(action.prompt)}>
                    <span>
                      <Icon size={16} />
                    </span>
                    <strong>{action.title}</strong>
                    <small>{action.description}</small>
                  </button>
                );
              })}
            </section>

            <div className="ai-suggestions" aria-label="Suggested questions">
              {suggestions.slice(0, 4).map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => void sendMessage(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="ai-message-list" ref={scrollRef}>
              {messages.map((message) => (
                <article className={`ai-message ${message.role}`} key={message.id}>
                  <p>{message.content}</p>
                  {message.disclaimer ? <small>{message.disclaimer}</small> : null}
                  {message.links?.length ? (
                    <div className="ai-links">
                      {message.links.map((link) => (
                        <a href={link.href} key={`${message.id}-${link.href}`}>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  {message.role === "assistant" ? (
                    <button className="ai-speak" type="button" onClick={() => speak(message.content)}>
                      <Volume2 size={14} />
                      {speaking ? "Speaking" : "Listen"}
                    </button>
                  ) : null}
                </article>
              ))}
              {typing ? (
                <div className="ai-typing">
                  <span />
                  <span />
                  <span />
                </div>
              ) : null}
            </div>

            <div className="ai-assistant-footer">
              <form className="ai-input-row" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
                <label className="ai-file-button" aria-label="Attach document">
                  <Paperclip size={17} />
                  <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                </label>
                <button className={listening ? "ai-mic active" : "ai-mic"} type="button" onClick={startVoice} aria-label="Voice input">
                  <Mic size={17} />
                </button>
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={file ? `Attached: ${file.name}` : "Ask about doctors, treatments, timings..."} />
                <button className="ai-send-button" type="submit" aria-label="Send message">
                  <Send size={17} />
                </button>
              </form>
              <div className="ai-care-actions" aria-label="Care desk quick actions">
                <a href="/contact">
                  <MessageCircle size={14} />
                  WhatsApp Support
                </a>
                <a href="tel:+919119744783">
                  <PhoneCall size={14} />
                  Emergency Call
                </a>
              </div>
              <p className="ai-safety-note">
                AI guidance is not a diagnosis. For treatment decisions, speak with a qualified doctor.
              </p>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
