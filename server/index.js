/**
 * Servidor de chat do AppDagua — o "correio".
 * Recebe a mensagem de um cliente e reenvia pra TODOS os conectados.
 */
const { Server } = require('socket.io');

const PORT = 3001;

// Cria o servidor Socket.io já ouvindo na porta 3001.
// cors: '*' libera qualquer app a conectar (ok para desenvolvimento).
const io = new Server(PORT, {
  cors: { origin: '*' },
});

// Guarda as últimas mensagens em memória, pra mandar pra quem entrar depois.
const history = [];
const MAX_HISTORY = 50;

// Dispara TODA vez que um celular se conecta.
io.on('connection', (socket) => {
  console.log('✅ conectou:', socket.id);

  // Cada conexão começa "Anônimo" até o cliente avisar o nome (evento 'join').
  let userName = 'Anônimo';

  // 1) Assim que conecta, manda o histórico só pra ELE (socket.emit = só este cliente).
  socket.emit('history', history);

  // 2) O cliente avisou o nome ao entrar.
  socket.on('join', (name) => {
    userName = String(name || 'Anônimo').slice(0, 20);
    console.log('👋', userName, 'entrou');
    io.emit('system', `${userName} entrou no chat`); // io.emit = avisa TODOS
  });

  // 3) O cliente enviou uma mensagem.
  socket.on('message', (text) => {
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: userName,
      text: String(text).slice(0, 500),
      at: Date.now(),
    };

    history.push(msg);
    if (history.length > MAX_HISTORY) history.shift();

    io.emit('message', msg); // ← O CORAÇÃO: reenvia pra TODOS (inclui o remetente)
  });

  // 4) O cliente desconectou (fechou o app, caiu a rede).
  socket.on('disconnect', () => {
    console.log('❌', userName, 'saiu');
    io.emit('system', `${userName} saiu`);
  });
});

console.log(`🚀 AppDagua chat rodando na porta ${PORT}`);
