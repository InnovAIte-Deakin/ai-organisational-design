import { useState, useRef } from 'react';
import { Button } from '../components/ui/BasicElements';
import styles from './MainLayout.module.css';
import { cx } from '../utils/helpers';

/**
 * NeuralBackground component for visual effect
 */
function NeuralBackground() {
  return (
    <div className={styles.neuralBackground}>
      <div className={styles.neuralGlow1} />
      <div className={styles.neuralGlow2} />
    </div>
  );
}

/**
 * SidebarToggle component for collapsing/expanding the sidebar
 */
function SidebarToggle({ collapsed, onToggle }) {
  return (
    <button 
      className={styles.sidebarToggle} 
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? "›" : "‹"}
    </button>
  );
}

/**
 * SessionList component to display chat sessions
 */
function SessionList({ 
  sessions = [], 
  currentId, 
  onSelect, 
  onDelete, 
  onAddNew,
  onRename 
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef(null);

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditTitle(title);
    // Focus the input after it renders
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div>
      <Button onClick={onAddNew} className="w-full">New Chat</Button>
      <div className={styles.sessionList}>
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={cx(
              styles.sessionItem,
              session.id === currentId && styles.sessionActive
            )}
          >
            {editingId === session.id ? (
              <input
                ref={editInputRef}
                className={styles.sessionEditInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <button 
                className={styles.sessionBtn}
                onClick={() => onSelect(session.id)}
                onDoubleClick={() => startEditing(session.id, session.title)}
              >
                {session.title}
              </button>
            )}
            <div className={styles.sessionControls}>
              {!editingId && (
                <button 
                  className={styles.editBtn}
                  onClick={() => startEditing(session.id, session.title)}
                  aria-label="Edit chat name"
                >
                  ✎
                </button>
              )}
              <button 
                className={styles.deleteBtn}
                onClick={() => onDelete(session.id)}
                aria-label="Delete chat session"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * MainLayout component for the chat application
 */
export default function MainLayout({
  children,
  title = "N8N Chat",
  sessions = [],
  currentId,
  onSelectSession,
  onDeleteSession,
  onAddSession,
  onRenameSession,
  navItems = [],
  showSessionList = true
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className={styles.layoutContainer}>
      <NeuralBackground />
      
      <aside className={cx(
        styles.sidebar,
        sidebarCollapsed && styles.sidebarCollapsed
      )}>
        {/* Sidebar content */}
        <div className={styles.sidebarContent}>
          {/* Navigation links (optional) */}
          {navItems.length > 0 && (
            <div className={styles.navSection}>
              <h3 className={styles.navSectionTitle}>Navigation</h3>
              <div className={styles.navList}>
                {navItems.map((item, index) => (
                  <button 
                    key={index}
                    className={cx(
                      styles.navItem,
                      item.active && styles.navItemActive
                    )}
                    onClick={item.onClick}
                  >
                    {item.icon && <span className={styles.navItemIcon}>{item.icon}</span>}
                    <span className={styles.navItemText}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat history - moved below navigation */}
          {showSessionList && (
            <SessionList 
              sessions={sessions}
              currentId={currentId}
              onSelect={onSelectSession}
              onDelete={onDeleteSession}
              onAddNew={onAddSession}
              onRename={onRenameSession}
            />
          )}
        </div>
        
        {/* Sidebar toggle button */}
        <SidebarToggle 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      </aside>
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
        </header>
        
        <div className={cx(
          styles.content,
          // Apply specific styles if the content is the dashboard
          title === "Dashboard" && styles.dashboardContent
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}