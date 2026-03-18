import type { FormEvent, MouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axios';

type ChatMessageType = 'user' | 'bot';

interface ChatMessage {
  id: string;
  type: ChatMessageType;
  message: string;
  isHtml?: boolean;
}

interface ChatbotAskResponse {
  success: boolean;
  reply?: string;
}

const CHAT_HISTORY_KEY = 'evodana_chat_history';
const CHAT_OPENED_KEY = 'evodana_chat_opened';

const SUGGESTIONS = ['Thu tuc thue xe?', 'Gia thue xe?', 'Huong dan dat xe'];

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const createMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createDefaultMessages = (): ChatMessage[] => [
  {
    id: 'default-welcome',
    type: 'bot',
    isHtml: true,
    message: '<p class="text-sm">Xin chao! Toi la tro ly ao cua EcoDana. Toi co the giup gi cho ban?</p>',
  },
];

const toBotHtml = (reply: string): string => {
  const trimmed = reply.trim();
  if (!trimmed) {
    return '<p class="text-sm">Xin loi, toi chua co cau tra loi phu hop luc nay.</p>';
  }
  if (trimmed.startsWith('<p>')) {
    return trimmed;
  }
  return `<p class="text-sm">${escapeHtml(trimmed)}</p>`;
};

const parseStoredHistory = (): ChatMessage[] => {
  const raw = sessionStorage.getItem(CHAT_HISTORY_KEY);
  if (!raw) {
    return createDefaultMessages();
  }
  try {
    const parsed = JSON.parse(raw) as Array<{ type: ChatMessageType; message: string; isHtml?: boolean }>;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return createDefaultMessages();
    }
    return parsed.map((item) => ({
      id: createMessageId(),
      type: item.type === 'user' ? 'user' : 'bot',
      message: String(item.message ?? ''),
      isHtml: Boolean(item.isHtml),
    }));
  } catch {
    return createDefaultMessages();
  }
};

export const ChatbotWidget = () => {
  const navigate = useNavigate();
  const chatboxRef = useRef<HTMLUListElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') {
      return createDefaultMessages();
    }
    return parseStoredHistory();
  });

  const showSuggestions = useMemo(() => messages.length <= 1, [messages.length]);

  const persistHistory = (nextMessages: ChatMessage[]) => {
    const payload = nextMessages.map((item) => ({
      type: item.type,
      message: item.message,
      isHtml: Boolean(item.isHtml),
    }));
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(payload));
  };

  const resetConversation = () => {
    const defaults = createDefaultMessages();
    setMessages(defaults);
    setInputValue('');
    setSending(false);
    sessionStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setShowWelcome(false);
        sessionStorage.setItem(CHAT_OPENED_KEY, 'true');
      }
      return next;
    });
  };

  const pushUserAndRequest = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || sending) {
      return;
    }

    setInputValue('');
    const userMessage: ChatMessage = { id: createMessageId(), type: 'user', message };
    const pendingMessages = [...messages, userMessage];
    setMessages(pendingMessages);
    setSending(true);

    try {
      const response = await axiosClient.post<ChatbotAskResponse>('/api/chatbot/ask', { message });
      const botMessage: ChatMessage = {
        id: createMessageId(),
        type: 'bot',
        isHtml: true,
        message: toBotHtml(response.data.reply ?? ''),
      };
      const next = [...pendingMessages, botMessage];
      setMessages(next);
      persistHistory(next);
    } catch (error) {
      const fallbackMessage = 'Xin loi, da co loi xay ra khi ket noi voi tro ly. Vui long thu lai sau.';
      const errorMessage = axios.isAxiosError<{ error?: string; message?: string }>(error)
        ? error.response?.data?.error ?? error.response?.data?.message ?? fallbackMessage
        : fallbackMessage;
      const botMessage: ChatMessage = {
        id: createMessageId(),
        type: 'bot',
        isHtml: true,
        message: `<p class="text-sm">${escapeHtml(errorMessage)}</p>`,
      };
      const next = [...pendingMessages, botMessage];
      setMessages(next);
      persistHistory(next);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await pushUserAndRequest(inputValue);
  };

  const onSuggestionClick = async (value: string) => {
    await pushUserAndRequest(value);
  };

  const onChatboxClick = (event: MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (!link) {
      return;
    }
    event.preventDefault();
    const href = link.getAttribute('href');
    if (!href) {
      return;
    }
    if (href.startsWith('/')) {
      setIsOpen(false);
      navigate(href);
      return;
    }
    window.location.href = href;
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const input = document.getElementById('chatbot-input');
    input?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    chatboxRef.current?.scrollTo({ top: chatboxRef.current.scrollHeight, behavior: 'smooth' });
  }, [isOpen, messages, sending]);

  useEffect(() => {
    if (sessionStorage.getItem(CHAT_OPENED_KEY) || isOpen) {
      return;
    }
    const showTimer = window.setTimeout(() => setShowWelcome(true), 3000);
    const hideTimer = window.setTimeout(() => setShowWelcome(false), 10000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isOpen]);

  return (
    <>
      <button
        id="chatbot-toggler"
        type="button"
        onClick={toggleChat}
        className="chatbot-jiggle fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600"
      >
        <i className={`fas fa-comments transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
        <i className={`fas fa-times absolute transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      <button
        id="welcome-bubble"
        type="button"
        onClick={toggleChat}
        className={`fixed bottom-24 right-6 z-40 max-w-xs rounded-xl rounded-br-none bg-gradient-to-r from-green-500 to-primary p-4 text-left text-white shadow-xl transition-all duration-500 ${
          showWelcome ? 'welcome-bubble-visible' : 'pointer-events-none hidden opacity-0'
        }`}
      >
        <p className="flex items-center text-sm">
          <span className="wave-hand mr-2 text-lg">
            <i className="fas fa-hand-paper" />
          </span>
          <span className="font-medium text-white">Chao ban, toi co the giup gi khong?</span>
        </p>
      </button>

      <div
        id="chatbot-container"
        className={`fixed bottom-24 left-4 right-4 z-50 flex max-h-[560px] flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 md:left-auto md:w-[28rem] ${
          isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between rounded-t-2xl bg-primary p-4 text-white">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30">
              <i className="fas fa-leaf text-white" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold">EcoDana Assistant</h3>
              <p className="text-xs text-green-100">Online</p>
            </div>
          </div>
          <button
            id="close-chatbot-btn"
            type="button"
            onClick={() => {
              setIsOpen(false);
              resetConversation();
            }}
            className="text-white/70 transition-colors hover:text-white"
            title="Dong va ket thuc tro chuyen"
          >
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        <ul
          id="chatbox"
          ref={chatboxRef}
          onClick={onChatboxClick}
          className="space-y-4 overflow-y-auto bg-slate-50 p-4 h-[320px]"
        >
          {messages.map((item) => (
            <li key={item.id} className={`flex items-start space-x-3 ${item.type === 'user' ? 'justify-end space-x-0' : ''}`}>
              {item.type === 'bot' ? (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <i className="fas fa-leaf text-sm text-white" />
                </div>
              ) : null}

              <div
                className={`max-w-xs rounded-xl p-3 text-sm ${
                  item.type === 'user'
                    ? 'rounded-br-none bg-primary text-white'
                    : 'rounded-bl-none bg-slate-200 text-slate-800 [&_a]:font-semibold [&_a]:text-blue-600 [&_a]:underline'
                }`}
                style={{ minWidth: '60px' }}
                {...(item.isHtml
                  ? {
                      dangerouslySetInnerHTML: {
                        __html: item.message,
                      },
                    }
                  : undefined)}
              >
                {!item.isHtml ? <p className="text-sm">{item.message}</p> : null}
              </div>
            </li>
          ))}

          {sending ? (
            <li className="flex items-start space-x-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                <i className="fas fa-leaf text-sm text-white" />
              </div>
              <div className="flex min-w-[60px] items-center space-x-2 rounded-xl rounded-bl-none bg-slate-200 p-3 text-slate-800">
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </div>
            </li>
          ) : null}

          {showSuggestions ? (
            <li id="suggestion-buttons" className="pt-2">
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => void onSuggestionClick(value)}
                    className="suggestion-btn"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </li>
          ) : null}
        </ul>

        <div className="rounded-b-2xl border-t bg-white p-4">
          <form className="flex space-x-2" onSubmit={onSubmit}>
            <input
              id="chatbot-input"
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Nhap cau hoi..."
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={sending}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-all duration-300 hover:scale-110 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fas fa-paper-plane" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
