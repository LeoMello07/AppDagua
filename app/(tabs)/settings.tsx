import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing } from '@/constants/design';
import {
  cancelWaterReminders,
  getScheduledCount,
  requestNotificationPermission,
  scheduleWaterReminders,
  sendTestNotification,
} from '@/lib/notifications';

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fonte da verdade: se há lembretes agendados no SO, o switch fica ligado.
  useEffect(() => {
    getScheduledCount().then((c) => {
      setCount(c);
      setEnabled(c > 0);
    });
  }, []);

  async function toggle(value: boolean) {
    setLoading(true);
    try {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            'Permissão negada',
            'Ative as notificações nas configurações do celular para receber os lembretes.',
          );
          setEnabled(false);
          return;
        }
        await scheduleWaterReminders();
      } else {
        await cancelWaterReminders();
      }
      const c = await getScheduledCount();
      setCount(c);
      setEnabled(c > 0);
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Permissão negada', 'Ative as notificações para testar.');
      return;
    }
    await sendTestNotification();
    Alert.alert('Enviado 💧', 'A notificação de teste chega em ~5 segundos. Pode minimizar o app pra ver.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <View style={styles.rowIcon}>
            <Ionicons name="water" size={20} color={Palette.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Lembretes de água</Text>
            <Text style={styles.rowSub}>
              {enabled ? `${count} lembretes ativos · 8h–22h` : 'Desligado'}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggle}
            disabled={loading}
            trackColor={{ true: Palette.primary, false: Palette.border }}
            thumbColor="#fff"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.testBtn, pressed && styles.pressed]}
          onPress={handleTest}>
          <Ionicons name="notifications-outline" size={18} color={Palette.primary} />
          <Text style={styles.testText}>Testar notificação agora</Text>
        </Pressable>

        <Text style={styles.hint}>
          Os lembretes são locais: funcionam mesmo sem internet e sem servidor.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.neutral,
    marginBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.neutral,
  },
  rowSub: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 2,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.secondary,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    marginTop: Spacing.lg,
  },
  testText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  hint: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
