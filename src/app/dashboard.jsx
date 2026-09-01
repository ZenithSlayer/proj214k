import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useDashboardData } from "../hooks/useDashboardData"; 
import { AddressPanel } from "../components/Dashboard/Panels/AddressPanel";
import { CardPanel } from "../components/Dashboard/Panels/CardPanel";
import { ProductPanel } from "../components/Dashboard/Panels/ProductPanel";
import { OrderPanel } from "../components/Dashboard/Panels/OrderPanel";
import { AccountPanel } from "../components/Dashboard/Panels/AccountPanel";

const dashboard = ({ setToast }) => {
  const { data, setData, loading } = useDashboardData(setToast);
  const [activeTab, setActiveTab] = useState("account");

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
    const props = { data, setData, setToast };
    switch (activeTab) {
      case "account":   return <AccountPanel {...props} />;
      case "addresses": return <AddressPanel {...props} />;
      case "cards":     return <CardPanel {...props} />;
      case "products":  return <ProductPanel {...props} />;
      default:          return <OrderPanel orders={data?.orders} />;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 16 }}>
          Welcome, {data?.user?.name || "User"}!
        </Text>

        {/* Tab Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab ? "#2563eb" : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? "#ffffff" : "#374151",
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {tab.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Tab Output */}
        <View>{renderActivePanel()}</View>
      </View>
    </ScrollView>
  );
};

export default dashboard;