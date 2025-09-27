import { useEffect, useMemo, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { ChatHistory, ChatInput } from "./components/chat/ChatComponents";
import Dashboard from "./components/dashboard/Dashboard";
import WebsiteBuilder from "./components/website/WebsiteBuilder";
import EmailMarketing from "./components/email/EmailMarketing";
import N8nWorkflow from "./components/n8nWorkflow/N8nWorkflow";
import { callN8n } from "./api";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { newId } from "./utils/helpers";
import './App.css';

export default function App() {
  // State management with localStorage persistence
  const [sessions, setSessions] = useLocalStorage("sessions", []);
  const [currentId, setCurrentId] = useLocalStorage("currentId", "");
  const [messagesStore, setMessagesStore] = useLocalStorage("messagesBySession", {});
  const [sending, setSending] = useState(false);
  const [currentView, setCurrentView] = useLocalStorage("currentView", "dashboard"); // 'dashboard' or 'chat'

  // Initialize app with a first session if none exists
  useEffect(() => {
    if (!sessions.length) {
      const first = { id: newId(), title: "New chat" };
      setSessions([first]);
      setCurrentId(first.id);
      setMessagesStore({ [first.id]: [] });
    } else if (!currentId) {
      setCurrentId(sessions[0].id);
    }
  }, [sessions, currentId, setSessions, setCurrentId, setMessagesStore]);

  // Get messages for current session
  const messages = useMemo(() => 
    messagesStore[currentId]?.map(msg => ({
      id: msg.ts,
      role: msg.role,
      content: msg.text,
      timestamp: msg.ts
    })) || [], 
    [messagesStore, currentId]
  );

  // Navigation items
  const navItems = [
    {
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
      active: currentView === "dashboard",
      onClick: () => setCurrentView("dashboard")
    },
    {
      label: "Chat",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      active: currentView === "chat",
      onClick: () => setCurrentView("chat")
    },
    {
      label: "Website Builder",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      active: currentView === "website",
      onClick: () => setCurrentView("website")
    },
    {
      label: "Email Marketing",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      active: currentView === "email",
      onClick: () => setCurrentView("email")
    },
    {
      label: "N8N Workflow",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      ),
      active: currentView === "n8n",
      onClick: () => setCurrentView("n8n")
    }
  ];

  // Session management functions
  const addSession = () => {
    const newSession = { id: newId(), title: "New chat" };
    setSessions((prev) => [newSession, ...prev]);
    setMessagesStore((prev) => ({ ...prev, [newSession.id]: [] }));
    setCurrentId(newSession.id);
    setCurrentView("chat"); // Switch to chat view
  };

  const renameSession = (id, title) => {
    setSessions((prev) => 
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const deleteSession = (id) => {
    const idx = sessions.findIndex((s) => s.id === id);
    const filtered = sessions.filter((s) => s.id !== id);
    const nextId = filtered[idx] ? filtered[idx].id : filtered[0]?.id;
    
    // Remove messages for this session
    const { [id]: _, ...restMessages } = messagesStore;
    
    setSessions(filtered);
    setMessagesStore(restMessages);
    setCurrentId(nextId || "");
  };

  // Send message to n8n webhook
  const sendMessage = async (text) => {
    if (!text.trim() || !currentId) return;

    // Add user message to UI
    const userMsg = { role: "user", text, ts: Date.now() };
    setMessagesStore((prev) => ({ 
      ...prev, 
      [currentId]: [...(prev[currentId] || []), userMsg] 
    }));

    setSending(true);
    try {
      // Call n8n webhook
      const reply = await callN8n({ sessionId: currentId, text });
      
      // Add assistant response to UI
      const botMsg = { role: "assistant", text: String(reply), ts: Date.now() };
      setMessagesStore((prev) => ({ 
        ...prev, 
        [currentId]: [...(prev[currentId] || []), botMsg] 
      }));
      
      // If this is a new chat, use first message as the title
      const session = sessions.find((s) => s.id === currentId);
      if (session && (session.title === "New chat" || !session.title?.trim())) {
        renameSession(currentId, text.slice(0, 30));
      }
    } catch (err) {
      // Show error in UI
      const errorMsg = { 
        role: "assistant", 
        text: `⚠️ Error: ${err?.message || "Unknown error occurred"}`, 
        ts: Date.now() 
      };
      setMessagesStore((prev) => ({ 
        ...prev, 
        [currentId]: [...(prev[currentId] || []), errorMsg] 
      }));
    } finally {
      setSending(false);
    }
  };

  // Get title based on current view
  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Dashboard';
      case 'chat': return 'N8N Chat';
      case 'website': return 'Website Builder';
      case 'n8n': return 'N8N Workflow';
      default: return 'N8N Chat';
    }
  };

  // Render content based on current view
  const renderContent = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return (
          <>
            <ChatHistory messages={messages} />
            <ChatInput 
              onSend={sendMessage} 
              disabled={sending}
              placeholder="Type your message and press Enter..."
            />
          </>
        );
      case 'website':
        return <WebsiteBuilder />;
      case 'email':
        return <EmailMarketing />;
      case 'n8n':
        return <N8nWorkflow />;
      default:
        return <Dashboard />;
    }
  };

  // SessionList should only be shown in chat view
  const showSessionList = currentView === "chat";
  
  return (
    <MainLayout
      title={getTitle()}
      sessions={showSessionList ? sessions : []}
      currentId={currentId}
      onSelectSession={(id) => {
        setCurrentId(id);
        setCurrentView("chat");
      }}
      onDeleteSession={deleteSession}
      onAddSession={addSession}
      onRenameSession={renameSession}
      navItems={navItems}
      showSessionList={showSessionList}
    >
      {renderContent()}
    </MainLayout>
  );
}
