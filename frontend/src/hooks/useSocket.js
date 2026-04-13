// frontend/src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useToastStore from '../store/toastStore';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', { path: '/socket.io', transports: ['websocket'] });
  }
  return socket;
}

export function useSocketNotifications(onNewProduct) {
  const toast = useToastStore();

  useEffect(() => {
    const s = getSocket();

    s.on('product:new', (data) => {
      toast.info(`🛍️ ${data.message}`);
      if (onNewProduct) onNewProduct(data.product);
    });

    return () => {
      s.off('product:new');
    };
  }, [onNewProduct]);
}
