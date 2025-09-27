import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/BasicElements';
import { cx } from '../../utils/helpers';
import styles from './ChatComponents.module.css';

/**
 * ChatInput component - handles user input and submission
 */
export function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Type your message...",
}) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSend(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <div className={styles.chatInputContainer}>
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cx(
          styles.chatTextarea,
          disabled && styles.chatTextareaDisabled
        )}
      />
      <Button 
        onClick={handleSend} 
        disabled={disabled || !inputValue.trim()}
        className="h-[44px]"
      >
        Send
      </Button>
    </div>
  );
}

/**
 * ChatMessage component - displays a single message
 */
export function ChatMessage({ 
  message, 
  isUser = false 
}) {
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
  
  return (
    <div className={cx(
      styles.chatMessageContainer,
      isUser ? styles.chatMessageUser : styles.chatMessageAssistant
    )}>
      <div className={cx(
        styles.chatMessageBubble,
        isUser ? styles.chatMessageBubbleUser : styles.chatMessageBubbleAssistant
      )}>
        <div className={styles.chatMessageRole}>
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div className={styles.chatMessageContent}>
          {message.content}
        </div>
      </div>
      <div className={styles.chatMessageTime}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

/**
 * ChatHistory component - displays all messages
 */
export function ChatHistory({ messages = [] }) {
  const chatHistoryRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className={styles.chatHistoryContainer} ref={chatHistoryRef}>
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id || index} 
          message={message} 
          isUser={message.role === 'user'} 
        />
      ))}
    </div>
  );
}