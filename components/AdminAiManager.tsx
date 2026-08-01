"use client";

import { useMemo, useState } from "react";
import { BarChart3, FileText, MessageCircle, ShieldCheck, UploadCloud } from "lucide-react";
import type { AssistantAnalytics, AssistantConversation, AssistantDocument } from "@/lib/ai-assistant-shared";

type AdminAiManagerProps = {
  conversations: AssistantConversation[];
  documents: AssistantDocument[];
  analytics: AssistantAnalytics;
};

export function AdminAiManager({ conversations, documents: initialDocuments, analytics }: AdminAiManagerProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [message, setMessage] = useState("AI assistant is restricted to hospital-approved knowledge.");
  const [query, setQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conversation) => conversation.messages.some((item) => item.content.toLowerCase().includes(normalized)));
  }, [conversations, query]);

  async function uploadDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch("/api/ai-assistant/documents", {
      method: "POST",
      body: new FormData(form)
    });
    const result = (await response.json()) as { ok: boolean; document?: AssistantDocument; message?: string };
    if (!response.ok || !result.document) {
      setMessage(result.message ?? "Could not upload AI document.");
      return;
    }
    setDocuments((current) => [result.document as AssistantDocument, ...current]);
    setMessage("AI knowledge document uploaded. The assistant can now retrieve this approved text.");
    form.reset();
  }

  return (
    <div className="ai-admin">
      <p className="success-note">
        <ShieldCheck size={17} />
        {message}
      </p>

      <div className="grid grid-4">
        <article className="dashboard-card">
          <span className="module-icon"><MessageCircle size={22} /></span>
          <strong>{analytics.conversationCount}</strong>
          <p>Conversations</p>
        </article>
        <article className="dashboard-card">
          <span className="module-icon"><BarChart3 size={22} /></span>
          <strong>{analytics.averageResponseTimeMs}ms</strong>
          <p>Avg Response</p>
        </article>
        <article className="dashboard-card">
          <span className="module-icon"><ShieldCheck size={22} /></span>
          <strong>{analytics.satisfaction.helpful}</strong>
          <p>Helpful Feedback</p>
        </article>
        <article className="dashboard-card">
          <span className="module-icon"><FileText size={22} /></span>
          <strong>{documents.length}</strong>
          <p>Knowledge Docs</p>
        </article>
      </div>

      <div className="ai-admin-layout">
        <form className="ai-admin-upload card" onSubmit={uploadDocument}>
          <UploadCloud size={24} color="#0F172A" />
          <h3>Train Approved Knowledge</h3>
          <p>Add hospital-approved text from PDFs, policies, FAQs, pamphlets, or admin documents.</p>
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Source
            <input name="source" required placeholder="Policy, PDF, Pamphlet, HR, Admin" />
          </label>
          <label>
            Approved Text
            <textarea name="text" required placeholder="Paste approved content for the assistant to use." />
          </label>
          <label>
            Upload PDF/TXT
            <input name="file" type="file" accept="application/pdf,text/plain" />
          </label>
          <button className="button button-primary" type="submit">Upload Knowledge</button>
        </form>

        <section className="card">
          <h3>Conversation Search</h3>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" />
          <div className="ai-conversation-list">
            {filteredConversations.slice(0, 12).map((conversation) => (
              <article className="ai-admin-conversation" key={conversation.id}>
                <span className="status">{conversation.language}</span>
                {conversation.escalationRequested ? <span className="status">staff follow-up</span> : null}
                <strong>{conversation.messages.find((item) => item.role === "user")?.content.slice(0, 90) ?? "Conversation"}</strong>
                <p>{conversation.messages.findLast((item) => item.role === "assistant")?.content.slice(0, 180)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-3">
        <article className="card">
          <h3>Most Asked Questions</h3>
          {analytics.mostAskedQuestions.length ? analytics.mostAskedQuestions.map((item) => <p key={item.question}>{item.question} ({item.count})</p>) : <p>No questions yet.</p>}
        </article>
        <article className="card">
          <h3>Popular Departments</h3>
          {analytics.popularDepartments.length ? analytics.popularDepartments.map((item) => <p key={item.department}>{item.department} ({item.count})</p>) : <p>No department trends yet.</p>}
        </article>
        <article className="card">
          <h3>Blocked Questions</h3>
          <p>Questions outside approved content are answered with a doctor/care desk escalation message.</p>
        </article>
      </div>

      <section className="card">
        <h3>Approved Documents</h3>
        <div className="grid grid-3">
          {documents.map((document) => (
            <article className="faq-item" key={document.id}>
              <h3>{document.title}</h3>
              <p>{document.source}</p>
              <p>{document.text.slice(0, 180)}...</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
