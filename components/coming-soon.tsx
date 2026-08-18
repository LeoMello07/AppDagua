import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/design';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  phase: string;
};

export function ComingSoon({ icon, title, phase }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Ionicons name={icon} size={40} color={Palette.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.phase}>{phase}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.neutral,
  },
  phase: {
    fontSize: 14,
    color: Palette.textMuted,
  },
});
