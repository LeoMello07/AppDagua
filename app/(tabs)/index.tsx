import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing } from '@/constants/design';

const GOAL_ML = 2500;

type QuickAdd = {
  amount: number;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const QUICK_ADDS: QuickAdd[] = [
  { amount: 200, label: 'Glass', icon: 'water-outline' },
  { amount: 300, label: 'Mug', icon: 'cafe-outline' },
  { amount: 500, label: 'Bottle', icon: 'flask-outline' },
];

export default function HomeScreen() {
  const [intake, setIntake] = useState(1500);
  const [justAdded, setJustAdded] = useState(false);

  const progress = Math.min(intake / GOAL_ML, 1);
  const liters = (intake / 1000).toFixed(1);
  const goalLiters = (GOAL_ML / 1000).toFixed(1);

  function addWater(ml: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIntake((v) => v + ml);
    setJustAdded(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={styles.avatar} />
          <Text style={styles.brand}>H2O Flow</Text>
          <Ionicons name="notifications-outline" size={22} color={Palette.primary} />
        </View>

        <Text style={styles.title}>Stay Hydrated</Text>
        <Text style={styles.subtitle}>You&apos;re doing great today.</Text>

        {/* Medidor de água */}
        <View style={styles.gaugeWrap}>
          <View style={styles.gauge}>
            <View style={[styles.gaugeFill, { height: `${progress * 100}%` }]} />
          </View>
          <View style={styles.gaugeCenter} pointerEvents="none">
            <Text style={styles.gaugeValue}>{liters}L</Text>
            <Text style={styles.gaugeGoal}>{goalLiters}L</Text>
          </View>
        </View>

        {/* Chips */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Ionicons name="leaf-outline" size={14} color={Palette.tertiary} />
            <Text style={styles.chipText}>3 Day Streak</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="time-outline" size={14} color={Palette.primary} />
            <Text style={styles.chipText}>{justAdded ? 'Last: just now' : 'Last: 1h ago'}</Text>
          </View>
        </View>

        {/* Adição rápida */}
        <View style={styles.quickRow}>
          {QUICK_ADDS.map((q) => (
            <Pressable
              key={q.amount}
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
              onPress={() => addWater(q.amount)}>
              <View style={styles.quickIcon}>
                <Ionicons name={q.icon} size={20} color={Palette.primary} />
              </View>
              <Text style={styles.quickAmount}>{q.amount}ml</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => addWater(250)}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.ctaText}>Add Water</Text>
        </Pressable>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.secondary,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.neutral,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  gaugeWrap: {
    alignSelf: 'center',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  gauge: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Palette.secondary,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  gaugeFill: {
    width: '100%',
    backgroundColor: Palette.waterFill,
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Palette.primary,
  },
  gaugeGoal: {
    fontSize: 14,
    color: Palette.textMuted,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.neutral,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.neutral,
  },
  quickLabel: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.primary,
    paddingVertical: 18,
    borderRadius: Radius.pill,
    shadowColor: Palette.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
  },
});
