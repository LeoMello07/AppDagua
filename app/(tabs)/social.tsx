import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing } from '@/constants/design';
import { socket } from '@/lib/socket';

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  at: number;
  system?: boolean;
};

function hhmm(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SocialScreen() {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState('');
  const [draftName, setDraftName] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Todo o ciclo de vida da conexão vive aqui: liga ao entrar, desliga ao sair.
  useEffect(() => {
    if (!joined) return;

    const onConnect = () => {
      setConnected(true);
      setError(null);
      socket.emit('join', name); // avisa o correio quem eu sou
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => {
      setConnected(false);
      setError('Não consegui conectar ao servidor. Confira a rede/URL em lib/config.ts.');
    };
    const onHistory = (h: ChatMessage[]) => setMessages(h);
    const onMessage = (m: ChatMessage) => setMessages((prev) => [...prev, m]);
    const onSystem = (t: string) =>
      setMessages((prev) => [
        ...prev,
        { id: `sys-${Date.now()}-${Math.random()}`, author: '', text: t, at: Date.now(), system: true },
      ]);

    // 1) escuta ANTES de conectar (pra não perder nenhum evento)
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('history', onHistory);
    socket.on('message', onMessage);
    socket.on('system', onSystem);

    // 2) agora sim, abre o cano
    socket.connect();

    // 3) limpeza ao sair da tela: tira os ouvintes e fecha a conexão
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('history', onHistory);
      socket.off('message', onMessage);
      socket.off('system', onSystem);
      socket.disconnect();
    };
  }, [joined, name]);

  // Rola pro fim sempre que chega mensagem nova.
  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages]);

  function join() {
    const n = draftName.trim();
    if (!n) return;
    setName(n);
    setJoined(true);
  }

  function send() {
    const t = text.trim();
    if (!t) return;
    socket.emit('message', t); // manda pro correio → ele reenvia pros dois
    setText('');
  }

  // ---------- Tela de entrada: escolher nome ----------
  if (!joined) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.joinBox}>
          <View style={styles.badge}>
            <Ionicons name="chatbubbles" size={36} color={Palette.primary} />
          </View>
          <Text style={styles.joinTitle}>Entrar no chat</Text>
          <Text style={styles.joinSub}>Escolha um nome pra aparecer pro outro.</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Seu nome"
            placeholderTextColor={Palette.textMuted}
            value={draftName}
            onChangeText={setDraftName}
            maxLength={20}
            returnKeyType="done"
            onSubmitEditing={join}
            autoFocus
          />
          <Pressable style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]} onPress={join}>
            <Text style={styles.joinBtnText}>Entrar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Tela de chat ----------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: connected ? Palette.tertiary : Palette.border }]} />
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <Text style={styles.headerStatus}>{connected ? 'online' : 'conectando…'}</Text>
      </View>

      {error && (
        <View style={styles.errorBar}>
          <Ionicons name="warning-outline" size={14} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma mensagem ainda. Manda um “oi”! 👋</Text>}
          renderItem={({ item }) => {
            if (item.system) {
              return <Text style={styles.system}>{item.text}</Text>;
            }
            const mine = item.author === name;
            return (
              <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                  {!mine && <Text style={styles.author}>{item.author}</Text>}
                  <Text style={[styles.msg, mine && styles.msgMine]}>{item.text}</Text>
                  <Text style={[styles.time, mine && styles.timeMine]}>{hhmm(item.at)}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Palette.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable style={({ pressed }) => [styles.sendBtn, pressed && styles.pressed]} onPress={send}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Palette.background },

  // Entrada
  joinBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTitle: { fontSize: 22, fontWeight: '800', color: Palette.neutral },
  joinSub: { fontSize: 14, color: Palette.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  nameInput: {
    width: '100%',
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    color: Palette.neutral,
  },
  joinBtn: {
    width: '100%',
    backgroundColor: Palette.primary,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    backgroundColor: Palette.card,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Palette.neutral },
  headerStatus: { fontSize: 12, color: Palette.textMuted },

  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  errorText: { flex: 1, fontSize: 12, color: '#B91C1C' },

  // Lista
  listContent: { padding: Spacing.lg, flexGrow: 1 },
  empty: { textAlign: 'center', color: Palette.textMuted, marginTop: Spacing.xxl },
  system: { textAlign: 'center', color: Palette.textMuted, fontSize: 12, marginVertical: Spacing.sm },

  row: { flexDirection: 'row', marginVertical: 3 },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  bubbleMine: { backgroundColor: Palette.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Palette.card, borderWidth: 1, borderColor: Palette.border, borderBottomLeftRadius: 4 },
  author: { fontSize: 11, fontWeight: '700', color: Palette.primary, marginBottom: 2 },
  msg: { fontSize: 15, color: Palette.neutral },
  msgMine: { color: '#fff' },
  time: { fontSize: 10, color: Palette.textMuted, marginTop: 3, alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(255,255,255,0.75)' },

  // Barra de envio
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    backgroundColor: Palette.card,
  },
  input: {
    flex: 1,
    backgroundColor: Palette.background,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: Palette.neutral,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});
