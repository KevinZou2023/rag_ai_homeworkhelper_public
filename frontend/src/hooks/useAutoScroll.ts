import { useEffect, useRef, useState } from 'react';

export const useAutoScroll = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isNearBottom);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (ref.current && autoScroll) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  return { ref, scrollToBottom, autoScroll };
};
