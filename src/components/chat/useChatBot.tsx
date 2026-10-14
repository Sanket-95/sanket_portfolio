import { useCallback, useEffect, useRef, useState } from 'react';
import { matchKeyword, type BotOption, type BotScript } from '@/data/chatbots';

export interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
  time: string;
}

// Fixed time for the opening messages so the pre-rendered HTML matches the first client render.
const OPENING_TIME = '10:00 AM';
const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

/** Runs a scripted bot conversation: replies arrive one by one behind a typing indicator. */
export function useChatBot(script: BotScript) {
  const opening = script.nodes[script.start];
  const initial = (): ChatMessage[] => opening.messages.map((text, i) => ({ id: i, from: 'bot', text, time: OPENING_TIME }));

  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [options, setOptions] = useState<BotOption[]>(opening.options);
  const [typing, setTyping] = useState(false);
  const nextId = useRef(opening.messages.length);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const push = (from: ChatMessage['from'], text: string) =>
    setMessages((m) => [...m, { id: nextId.current++, from, text, time: now() }]);

  const respond = useCallback(
    (userText: string, nodeId: string) => {
      clearTimers();
      const node = script.nodes[nodeId] ?? script.nodes[script.fallback];
      push('user', userText);
      setOptions([]);
      setTyping(true);
      let delay = 0;
      node.messages.forEach((text, i) => {
        delay += 650 + Math.min(text.length * 12, 900);
        timers.current.push(
          window.setTimeout(() => {
            push('bot', text);
            if (i === node.messages.length - 1) {
              setTyping(false);
              setOptions(node.options);
            }
          }, delay),
        );
      });
    },
    [script],
  );

  const choose = (option: BotOption) => respond(option.label, option.next);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (trimmed) respond(trimmed, matchKeyword(script, trimmed));
  };

  const reset = () => {
    clearTimers();
    nextId.current = opening.messages.length;
    setMessages(initial());
    setOptions(opening.options);
    setTyping(false);
  };

  return { messages, options, typing, choose, send, reset };
}

/** Keeps a scrollable chat log pinned to its newest message (without scrolling the page). */
export function useAutoScroll<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, deps);
  return ref;
}

/** Renders *bold* spans (WhatsApp-style) and keeps line breaks. */
export function formatText(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <strong key={i}>{part.slice(1, -1)}</strong> : part,
  );
}
