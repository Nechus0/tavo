import { ScrollView, View } from 'react-native';
import { t } from './theme';

export function Screen({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        justifyContent: center ? 'center' : 'flex-start',
        alignItems: 'center',
      }}>
      <View style={{ width: '100%', maxWidth: 460, gap: 12 }}>{children}</View>
    </ScrollView>
  );
}
