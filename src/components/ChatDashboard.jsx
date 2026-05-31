import { useState, useEffect, useRef } from "react";
import {
  getChats, getChatMessages, sendMessage,
  logoutUser, getUsers, createChat,
} from "../services/api";
import echo from "../echo";

// ─── Helpers ──────────────────────────────────────────────────────
const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const formatSidebarTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

// ─── Avatar ───────────────────────────────────────────────────────
const COLORS = [
  "bg-violet-600","bg-blue-600","bg-emerald-600",
  "bg-rose-600","bg-amber-600","bg-cyan-600","bg-pink-600",
];
const Avatar = ({ name, size = "md", online = false }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-11 h-11 text-base" }[size];
  return (
    <div className="relative shrink-0">
      <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold text-white select-none`}>
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-900 rounded-full" />
      )}
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);
const SearchIcon = () => <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="w-4 h-4" />;
const SendIcon   = () => <Icon path="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" className="w-4 h-4" />;
const LogoutIcon = () => <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" className="w-4 h-4" />;
const MenuIcon   = () => <Icon path="M4 6h16M4 12h16M4 18h16" />;
const CloseIcon  = () => <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />;
const PlusIcon   = () => <Icon path="M12 4v16m8-8H4" className="w-5 h-5" />;
const CheckIcon  = () => <Icon path="M5 13l4 4L19 7" className="w-4 h-4" />;

// ─── Chat Item ────────────────────────────────────────────────────
const ChatItem = ({ chat, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
      ${isActive ? "bg-zinc-700/70" : "hover:bg-zinc-800/60"}`}
  >
    <Avatar name={chat.chat_name} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-semibold text-zinc-100 truncate">{chat.chat_name}</span>
        <span className="text-[11px] text-zinc-500 shrink-0">{formatSidebarTime(chat.last_message_time)}</span>
      </div>
      <p className="text-xs text-zinc-500 truncate mt-0.5">
        {chat.last_message ?? "No messages yet"}
      </p>
    </div>
  </button>
);

// ─── Message Bubble ───────────────────────────────────────────────
const MessageBubble = ({ msg, isMine }) => (
  <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
    {!isMine && <Avatar name={msg.sender?.name} size="sm" />}
    <div className={`max-w-[68%] flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
      {!isMine && <span className="text-[11px] text-zinc-500 px-1">{msg.sender?.name}</span>}
      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
        ${isMine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-zinc-800 text-zinc-100 rounded-bl-sm"}
        ${msg._pending ? "opacity-60" : ""}`}
      >
        {msg.message}
      </div>
      <span className="text-[10px] text-zinc-600 px-1">{formatTime(msg.created_at)}</span>
    </div>
  </div>
);

// ─── Skeletons ────────────────────────────────────────────────────
const SidebarSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
        <div className="w-10 h-10 bg-zinc-800 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
          <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    ))}
  </>
);

// ─── New Chat Modal ───────────────────────────────────────────────
const NewChatModal = ({ onClose, onChatCreated }) => {
  const [search, setSearch]     = useState("");
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    loadUsers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsers = async (q = "") => {
    setLoading(true);
    try { setUsers(await getUsers(q)); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleStart = async () => {
    if (!selected || creating) return;
    setCreating(true);
    try {
      const chat = await createChat({ user_id: selected.id, is_group: false });
      onChatCreated(chat);
      onClose();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">New Chat</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Kisi se bhi baat karo</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
            <CloseIcon />
          </button>
        </div>
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5">
            <span className="text-zinc-500 shrink-0"><SearchIcon /></span>
            <input ref={inputRef} type="text" placeholder="Naam ya email se dhundo..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none w-full" />
          </div>
        </div>
        {selected && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl px-3 py-2">
              <Avatar name={selected.name} size="sm" />
              <span className="text-sm text-indigo-300 font-medium flex-1">{selected.name}</span>
              <button onClick={() => setSelected(null)} className="text-indigo-400 hover:text-indigo-200"><CloseIcon /></button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {loading ? (
            <div className="space-y-1 p-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-9 h-9 bg-zinc-800 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-zinc-800 rounded w-2/3" />
                    <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              {search ? `"${search}" ka koi user nahi mila` : "Koi user nahi hai"}
            </div>
          ) : (
            users.map((u) => {
              const isSel = selected?.id === u.id;
              return (
                <button key={u.id} onClick={() => setSelected(isSel ? null : u)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                    ${isSel ? "bg-indigo-600/20" : "hover:bg-zinc-800/60"}`}>
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{u.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                  </div>
                  {isSel && (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="px-4 py-4 border-t border-zinc-800">
          <button onClick={handleStart} disabled={!selected || creating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
              disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl
              transition-all flex items-center justify-center gap-2
              hover:shadow-lg hover:shadow-indigo-600/25 active:scale-95">
            {creating
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <PlusIcon />}
            {creating ? "Chat ban rahi hai..." : selected ? `${selected.name} se chat karo` : "Pehle koi user select karo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────
export default function ChatDashboard({ user, onLogout }) {
  const [chats, setChats]               = useState([]);
  const [activeChat, setActiveChat]     = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [sending, setSending]           = useState(false);
  const [search, setSearch]             = useState("");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [showNewChat, setShowNewChat]   = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);

  // ── Chats load karo
  useEffect(() => {
    getChats()
      .then(setChats)
      .catch(() => {})
      .finally(() => setLoadingChats(false));
  }, []);

  // ── Messages load karo + WebSocket subscribe karo
  useEffect(() => {
    if (!activeChat) return;

    // Messages load karo
    setLoadingMsgs(true);
    setMessages([]);
    getChatMessages(activeChat.chat_id)
      .then((res) => setMessages(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));

    // ✅ Reverb: Private channel subscribe karo
    // Jab bhi koi doosra user message bheje — yahan aayega
    const channel = echo.private(`chat.${activeChat.chat_id}`);

    channel.listen('.message.sent', (data) => {
      // Naya message aaya — state mein add karo
      setMessages((prev) => {
        // Duplicate check — agar already hai toh mat add karo
        const exists = prev.some((m) => m.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });

      // Sidebar mein last message update karo
      setChats((prev) =>
        prev.map((c) =>
          c.chat_id === activeChat.chat_id
            ? { ...c, last_message: data.message, last_message_time: data.created_at }
            : c
        )
      );
    });

    inputRef.current?.focus();

    // ✅ Cleanup — chat change hone par channel chhodo
    // Warna purane channels pe bhi listen hota rahega
    return () => {
      echo.leave(`chat.${activeChat.chat_id}`);
    };
  }, [activeChat]);

  // ── Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeChat || sending) return;
    setSending(true);

    const optimistic = {
      id: `tmp-${Date.now()}`,
      message: text,
      created_at: new Date().toISOString(),
      sender: { id: user.id, name: user.name },
      _pending: true,
    };

    setMessages((p) => [...p, optimistic]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await sendMessage({ chat_id: activeChat.chat_id, message: text });
      const saved = res.data ?? res;
      // Optimistic message ko real se replace karo
      setMessages((p) =>
        p.map((m) => m.id === optimistic.id
          ? { ...saved, sender: { id: user.id, name: user.name } }
          : m
        )
      );
      setChats((p) =>
        p.map((c) => c.chat_id === activeChat.chat_id
          ? { ...c, last_message: text, last_message_time: new Date().toISOString() }
          : c
        )
      );
    } catch {
      setMessages((p) => p.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChatCreated = (newChat) => {
    setChats((prev) => {
      const exists = prev.find((c) => c.chat_id === newChat.chat_id);
      return exists ? prev : [newChat, ...prev];
    });
    setActiveChat(newChat);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    onLogout();
  };

  const filteredChats = chats.filter((c) =>
    c.chat_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`
        flex flex-col w-80 shrink-0 bg-zinc-900 border-r border-zinc-800/60
        transition-transform duration-300 z-20
        absolute inset-y-0 left-0 md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={user?.name} online />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name}</p>
              <p className="text-xs text-emerald-400">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setShowNewChat(true)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all" title="New Chat">
              <PlusIcon />
            </button>
            <button onClick={handleLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all" title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
            <span className="text-zinc-500 shrink-0"><SearchIcon /></span>
            <input type="text" placeholder="Chats search karo..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none w-full" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {loadingChats ? <SidebarSkeleton /> : filteredChats.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-500 text-sm">{search ? "Koi chat nahi mili" : "Koi chat nahi hai abhi"}</p>
              {!search && (
                <button onClick={() => setShowNewChat(true)}
                  className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors font-medium">
                  + Nayi chat shuru karo
                </button>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatItem key={chat.chat_id} chat={chat}
                isActive={activeChat?.chat_id === chat.chat_id}
                onClick={() => { setActiveChat(chat); setSidebarOpen(false); }} />
            ))
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-10" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/60 bg-zinc-900/60 backdrop-blur shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 transition-all">
            <MenuIcon />
          </button>
          {activeChat ? (
            <>
              <Avatar name={activeChat.chat_name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{activeChat.chat_name}</p>
                <p className="text-xs text-zinc-500">{activeChat.is_group ? "Group" : "Active recently"}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold text-white">C</div>
              <p className="text-sm font-semibold text-zinc-300">Chat App</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!activeChat ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 bg-zinc-800/80 rounded-2xl flex items-center justify-center text-3xl">💬</div>
              <div>
                <p className="text-zinc-300 font-semibold">Koi chat select karo</p>
                <p className="text-zinc-500 text-sm mt-1">Ya nayi chat shuru karo</p>
              </div>
              <button onClick={() => setShowNewChat(true)}
                className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-600/25 active:scale-95">
                + New Chat
              </button>
            </div>
          ) : loadingMsgs ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex gap-2 ${i % 2 ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 bg-zinc-800 rounded-full shrink-0" />
                  <div className={`h-10 bg-zinc-800 rounded-2xl ${i % 2 ? "w-36" : "w-52"}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
              <div className="text-4xl">👋</div>
              <p className="text-zinc-400 text-sm">Pehla message bhejo!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isMine={msg.sender?.id === user?.id} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {activeChat && (
          <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/60 backdrop-blur shrink-0">
            <div className="flex items-end gap-3 bg-zinc-800 rounded-2xl px-4 py-3">
              <textarea
                ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                rows={1} value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message likho..."
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                style={{ maxHeight: "120px" }}
              />
              <button onClick={handleSend} disabled={!input.trim() || sending}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                  disabled:cursor-not-allowed text-white transition-all shrink-0
                  hover:shadow-lg hover:shadow-indigo-600/25 active:scale-95">
                <SendIcon />
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1.5 text-center">
              Enter to send • Shift+Enter for new line
            </p>
          </div>
        )}
      </main>

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} onChatCreated={handleChatCreated} />
      )}
    </div>
  );
}