import { useState, useRef, useEffect } from "react";
import { useCustomerMessages, getSessionId, setSessionId } from "../messages";
import { ArrowRight, Close, Logo, SendArrow, WhatsApp } from "../icons";
import { waLink, WHATSAPP_LOCAL } from "../whatsapp";
import { cn } from "../utils/cn";

export default function SupportWidget() {
  const { messages, addMessage, addCustomerReply } = useCustomerMessages();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"home" | "chat">("home");

  const [sessionId, setSession] = useState<string | null>(() => getSessionId());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [seenCount, setSeenCount] = useState(0);

  const convo = sessionId ? messages.find((m) => m.id === sessionId) ?? null : null;
  const thread = convo?.thread ?? [];

  // unread admin replies while the panel is closed
  const adminCount = thread.filter((t) => t.from === "admin").length;
  const unreadReplies = open ? 0 : Math.max(0, adminCount - seenCount);
  useEffect(() => {
    if (open) setSeenCount(adminCount);
  }, [open, adminCount]);

  useEffect(() => {
    if (open && tab === "chat") endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, open, tab]);

  const startChat = () => {
    if (!name.trim() || !text.trim()) return;
    const msg = addMessage({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      message: text.trim(),
    });
    setSessionId(msg.id);
    setSession(msg.id);
    setText("");
    setTab("chat");
  };

  const sendReply = () => {
    if (!draft.trim() || !sessionId) return;
    addCustomerReply(sessionId, draft.trim());
    setDraft("");
  };

  const endChat = () => {
    try { window.localStorage.removeItem("pso-support-session"); } catch { /* ignore */ }
    setSession(null);
    setName(""); setEmail(""); setPhone(""); setText(""); setDraft("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-paper shadow-2xl shadow-black/40 transition-all hover:scale-110",
          open ? "bg-steel2 rotate-90" : "bg-oil",
        )}
        aria-label="PSO help service"
      >
        {open ? <Close className="h-5 w-5" /> : <ChatBubble className="h-6 w-6" />}
        {unreadReplies > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1.5 font-mono text-[10px] font-bold text-paper">
            {unreadReplies}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-22 right-5 z-50 flex h-[540px] max-h-[80vh] w-full max-w-[380px] flex-col overflow-hidden rounded-2xl border border-line bg-coal shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <div>
                <h3 className="font-display text-[14px] font-bold text-paper">PSO Support</h3>
                <p className="font-mono text-[9px] tracking-[0.2em] text-fog uppercase">
                  {convo ? "live · you're connected" : "online · usually replies fast"}
                </p>
              </div>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-oil opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-oil" />
            </span>
          </div>

          <div className="flex border-b border-line">
            {(["home", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-2.5 font-mono text-[10.5px] tracking-[0.2em] uppercase transition-colors",
                  tab === t ? "border-b-2 border-oil text-oil" : "text-fog hover:text-fog2",
                )}
              >
                {t === "home" ? <HomeIcon className="h-4 w-4" /> : <ChatBubble className="h-4 w-4" />}
                {t === "home" ? "Home" : "Chat"}
                {t === "chat" && unreadReplies > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 font-mono text-[9px] font-bold text-paper">{unreadReplies}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            {tab === "home" ? (
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div className="rounded-xl border border-line bg-panel p-4">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-fog uppercase">PSO from support</p>
                  <p className="mt-1.5 text-[14px] font-bold text-paper">How can we help you today?</p>
                </div>
                <button onClick={() => setTab("chat")} className="flex w-full items-center justify-center gap-2 rounded-full bg-oil py-3 font-display text-[13px] font-bold tracking-wide text-paper uppercase transition-colors hover:bg-paper hover:text-ink">
                  <SendArrow className="h-4 w-4" /> {convo ? "Open my conversation" : "Send us a message"}
                </button>
                <a href={waLink("Hi PSO Lubricants, I need help.")} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-between rounded-full border border-moss bg-moss/10 px-5 py-3 transition-colors hover:bg-moss/20">
                  <span className="flex items-center gap-2.5 font-display text-[13px] font-bold text-moss"><WhatsApp className="h-4 w-4" /> WhatsApp Support</span>
                  <ArrowRight className="h-4 w-4 text-moss" />
                </a>
                <a href={`tel:${WHATSAPP_LOCAL}`} className="flex w-full items-center justify-between rounded-xl border border-line bg-panel px-5 py-3 transition-colors hover:border-oil">
                  <div><p className="font-mono text-[10px] tracking-[0.18em] text-fog uppercase">Phone</p><p className="text-[14px] font-bold text-paper">{WHATSAPP_LOCAL}</p></div>
                  <PhoneIcon className="h-5 w-5 text-fog" />
                </a>
              </div>
            ) : !convo ? (
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                <div className="rounded-xl border border-line bg-panel p-4">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-fog uppercase">PSO from support</p>
                  <p className="mt-1.5 text-[14px] font-bold text-paper">Tell us how we can help</p>
                </div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" className="w-full rounded-lg border border-line bg-steel px-3.5 py-2.5 text-[13px] text-paper outline-none placeholder:text-fog/50 focus:border-oil" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full rounded-lg border border-line bg-steel px-3.5 py-2.5 text-[13px] text-paper outline-none placeholder:text-fog/50 focus:border-oil" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full rounded-lg border border-line bg-steel px-3.5 py-2.5 text-[13px] text-paper outline-none placeholder:text-fog/50 focus:border-oil" />
                <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message... *" className="w-full resize-none rounded-lg border border-line bg-steel px-3.5 py-2.5 text-[13px] text-paper outline-none placeholder:text-fog/50 focus:border-oil" />
                <button onClick={startChat} disabled={!name.trim() || !text.trim()} className="flex w-full items-center justify-center gap-2 rounded-full bg-oil py-3 font-display text-[13px] font-bold tracking-wide text-paper uppercase transition-colors hover:bg-paper hover:text-ink disabled:opacity-40">
                  <SendArrow className="h-4 w-4" /> Start conversation
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  <div className="rounded-lg border border-line bg-panel/60 px-3 py-2 text-center font-mono text-[9.5px] text-fog">
                    Conversation #{convo.id.slice(-6)} · our team replies here
                  </div>
                  {thread.map((t) => (
                    <div key={t.id} className={cn("flex", t.from === "customer" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                        t.from === "customer" ? "rounded-br-sm bg-oil text-paper" : "rounded-bl-sm border border-moss/40 bg-moss/10 text-paper",
                      )}>
                        {t.from === "admin" && <p className="mb-1 font-mono text-[9.5px] font-semibold text-moss">PSO Support</p>}
                        <p>{t.text}</p>
                        <p className={cn("mt-1 font-mono text-[9px]", t.from === "customer" ? "text-paper/70" : "text-fog")}>
                          {new Date(t.date).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {convo.status !== "replied" && (
                    <div className="flex justify-start">
                      <div className="rounded-xl rounded-bl-sm border border-line bg-panel px-3.5 py-2.5">
                        <span className="flex gap-1">
                          <Dot delay="0s" /><Dot delay="0.2s" /><Dot delay="0.4s" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                <div className="border-t border-line px-4 py-3">
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) sendReply(); }}
                      placeholder="Type your message…"
                      className="flex-1 rounded-full border border-line bg-steel px-4 py-2.5 text-[13px] text-paper outline-none placeholder:text-fog/50 focus:border-oil"
                    />
                    <button onClick={sendReply} disabled={!draft.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-oil text-paper transition-transform hover:scale-105 disabled:opacity-40">
                      <SendArrow className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={endChat} className="mt-2 font-mono text-[9.5px] text-fog hover:text-rust">End conversation</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ delay }: { delay: string }) {
  return <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fog" style={{ animationDelay: delay }} />;
}
function ChatBubble({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
}
function HomeIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12l9-9 9 9" /><path d="M5 12v7.5a1.5 1.5 0 0 0 1.5 1.5H10v-5h4v5h3.5a1.5 1.5 0 0 0 1.5-1.5V12" /></svg>;
}
function PhoneIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 4h4l1.5 4L8 10a12 12 0 0 0 6 6l2-2.5 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
}
