import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AccountPanel } from "../components/Dashboard/Panels/AccountPanel";
import { AddressPanel } from "../components/Dashboard/Panels/AddressPanel";
import { CardPanel } from "../components/Dashboard/Panels/CardPanel";
import { OrderPanel } from "../components/Dashboard/Panels/OrderPanel";
import { ProductPanel } from "../components/Dashboard/Panels/ProductPanel";
import Toast from "../components/Toast";
import { useAppTheme } from "../context/ThemeContext";
import { useDashboardData } from "../hooks/useDashboardData";

const dashboard = ({ setToast }) => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { data, setData, loading } = useDashboardData(setToast);
  const [activeTab, setActiveTab] = useState("account");
  const [localToast, setLocalToast] = useState(null);
  const notify = setToast || setLocalToast;

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#6b7280" }}>Loading Dashboard...</Text>
      </View>
    );
  }

  const tabs = ["account", "orders", "addresses", "cards"];
  if (data?.user?.is_admin) tabs.push("products");

  const renderActivePanel = () => {
    const props = { data, setData, setToast: notify };
    switch (activeTab) {
      case "account":   return <AccountPanel {...props} />;
      case "addresses": return <AddressPanel {...props} />;
      case "cards":     return <CardPanel {...props} />;
      case "products":  return <ProductPanel {...props} />;
      default:          return <OrderPanel orders={data?.orders || []} />;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {localToast && <Toast {...localToast} onClose={() => setLocalToast(null)} />}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.dashboard}>
        <Text style={[styles.heading, { color: theme.text, backgroundColor: theme.surface }]}>
          Welcome, {data?.user?.name || "User"}!
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, { backgroundColor: theme.surface }, activeTab === tab && { borderBottomColor: theme.accent }]}
              >
                <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === tab && { color: theme.text }]}>
                  {tab.toUpperCase()}
                </Text>
              </Pressable>
            ))}
        </ScrollView>

        <View style={[styles.panel, { backgroundColor: theme.surface }]}>{renderActivePanel()}</View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f1729" },
  container: { flexGrow: 1, padding: 20 },
  dashboard: { width: "100%", maxWidth: 1000, alignSelf: "center" },
  heading: { color: "#0f172a", backgroundColor: "#f8fafc", textAlign: "center", fontSize: 26, fontWeight: "700", padding: 18, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  tabs: { gap: 4, paddingTop: 16, alignItems: "flex-end" },
  tab: { backgroundColor: "#1e293b", paddingVertical: 12, paddingHorizontal: 18, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomWidth: 3, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#ef4444" },
  tabText: { color: "#94a3b8", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  activeTabText: { color: "#ffffff" },
  panel: { minHeight: 400, backgroundColor: "#1e293b", padding: 24, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 5 },
});

export default dashboard;