import { Text, View } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import { createPanelStyles } from "./panelStyles";

export const OrderPanel = ({ orders = [] }) => {
  const { theme } = useAppTheme();
  const styles = createPanelStyles(theme);
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Order History</Text>
      <View style={{ gap: 12 }}>
        {orders.length === 0 ? (
          <Text style={styles.empty}>You haven&apos;t placed any orders yet.</Text>
        ) : (
          orders.map((o) => (
            <View key={o.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.text}>Order #{o.id}</Text>
                <Text style={styles.badge}>{o.status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.muted}>Total: <Text style={styles.text}>${Number(o.total || 0).toFixed(2)}</Text></Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};