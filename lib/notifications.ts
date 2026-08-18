/**
 * Lembretes de água — notificações LOCAIS agendadas.
 * Não usa servidor nem internet: o próprio celular dispara nos horários.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'reminders';

// Dispara de 2 em 2 horas, das 8h às 22h.
const REMINDER_HOURS = [8, 10, 12, 14, 16, 18, 20, 22];

const MESSAGES = [
  'Hora de beber água! 💧',
  'Bora hidratar? Toma um gole agora 💦',
  'Seu corpo pediu água 🚰',
  'Pausa pra um copo d’água 🥤',
  'Não esquece: beba água! 💧',
];

// Como a notificação aparece quando o app está ABERTO na tela.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function randomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

/** Pede permissão ao usuário (e cria o canal no Android). Retorna se foi concedida. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de água',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Agenda os lembretes diários (limpa os antigos antes pra não duplicar). */
export async function scheduleWaterReminders(): Promise<void> {
  await cancelWaterReminders();

  for (const hour of REMINDER_HOURS) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AppDagua 💧',
        body: randomMessage(),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
  }
}

/** Cancela todos os lembretes agendados. */
export async function cancelWaterReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Quantos lembretes estão agendados agora (fonte da verdade = o próprio SO). */
export async function getScheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}

/** Dispara uma notificação de teste em ~5s (pra você minimizar o app e ver chegar). */
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'AppDagua 💧',
      body: 'Notificação de teste — bora beber água!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
      channelId: CHANNEL_ID,
    },
  });
}
