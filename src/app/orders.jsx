import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { api } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders")
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ff6f61" />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {error ? <Text style={{ color: "#dc2626" }}>{error}</Text> : null}
      {!error && orders.length === 0 ? <Text>You haven't placed any orders yet.</Text> : null}
      {orders.map((order) => (
        <View key={order.id} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
          <Text style={{ fontWeight: "700" }}>Order #{order.id}</Text>
          <Text>Total: ${Number(order.total || 0).toFixed(2)}</Text>
          <Text>Status: {order.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}