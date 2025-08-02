import React, { useEffect, useState, useRef } from 'react';

const GroupChat = ({ postId, username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [authError, setAuthError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear state when switching chats
    setMessages([]);
    setIsConnected(false);
    setAuthError('');
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('access');
    
    if (!token) {
      setAuthError("No JWT token found - please log in");
      return;
    }

    // Explicitly connect to port 8000 where Daphne is running
    const wsUrl = `ws://localhost:8000/ws/groupchat/${postId}/?token=${token}`;
    console.log("Connecting to WebSocket:", wsUrl);

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setAuthError('');
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: data.id,
            username: data.username,
            message: data.message,
            timestamp: data.timestamp
          }]);
        } else if (data.type === 'error') {
          console.error("Server error:", data.message);
          setAuthError(data.message);
        }
      };

      socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        
        if (!event.wasClean) {
          setAuthError(event.reason || "Connection lost unexpectedly");
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setAuthError("Connection error");
      };

      // Cleanup function
      return () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.close(1000, "Component unmounted");
        }
      };

    } catch (err) {
      console.error("WebSocket creation failed:", err);
      setAuthError("Failed to establish connection");
    }
  }, [postId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'message',
          message: message.trim()
        }));
        setMessage('');
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setAuthError("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const connectionStatus = {
    color: isConnected ? '#155724' : '#721c24',
    bg: isConnected ? '#d4edda' : '#f8d7da',
    status: isConnected ? '🟢 Connected' : '🔴 Disconnected',
    message: authError || (isConnected ? 'Ready to chat' : 'Connecting...')
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Connection Status */}
      <div style={{ 
        padding: '0.5rem',
        backgroundColor: connectionStatus.bg,
        color: connectionStatus.color,
        fontSize: '0.8rem',
        borderRadius: '4px',
        marginBottom: '0.5rem',
        border: `1px solid ${connectionStatus.color}20`
      }}>
        <strong>{connectionStatus.status}</strong> - {connectionStatus.message}
      </div>
      
      {/* Messages */}
      <div style={{ 
        flex: 1,
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        marginBottom: '1rem'
      }}>
        {!isConnected ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            <div>🔌 {authError || 'Connecting to chat...'}</div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            <div>💬 No messages yet</div>
            <small>Start the conversation!</small>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ 
              marginBottom: '0.8rem',
              padding: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ 
                  color: msg.username === username ? '#28a745' : '#007bff' 
                }}>
                  {msg.username}
                  {msg.username === username && ' (you)'}
                </strong>
                <small style={{ color: '#666' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          style={{ 
            flex: 1, 
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            opacity: isConnected ? 1 : 0.6
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !message.trim()}
          style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: isConnected && message.trim() ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isConnected && message.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;