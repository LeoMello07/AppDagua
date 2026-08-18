import { io } from 'socket.io-client';

import { CHAT_SERVER_URL } from './config';

/**
 * Conexão ÚNICA e compartilhada com o servidor de chat.
 * Mora aqui (fora de qualquer tela) pra existir UMA só no app inteiro —
 * qualquer tela importa `socket` e fala com o mesmo correio.
 */
export const socket = io(CHAT_SERVER_URL, {
  transports: ['websocket'], // no celular, força WebSocket puro (evita o fallback flaky)
  autoConnect: false,        // só conecta quando A GENTE mandar (ao abrir o chat)
});
