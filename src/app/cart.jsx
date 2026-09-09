import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCart } from "../context/CartContext";
import { useAppTheme } from "../context/ThemeContext";
import { cartApi } from "../services/cart";

const cart = () => {
  const { theme } = useAppTheme();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const safeCart = Array.isArray(cart) ? cart : [];

  const total = safeCart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const notify = (msg) => {
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert("Notification", msg);
  };

  const handleDecrease = (item) => {
    const newQty = (item.quantity || 1) - 1;
    if (newQty < 1) return;
    updateQuantity(item.id, newQty);
  };

  const handleIncrease = (item) => {
    const newQty = (item.quantity || 1) + 1;
    updateQuantity(item.id, newQty);
  };

  const handleRemove = (item) => {
    if (!item?.id) return;
    removeFromCart(item.id);
  };

  const handleCheckout = async () => {
    try {
      await cartApi.checkout(safeCart, total);
      clearCart();
      notify("Order placed successfully!");
    } catch (err) {
      notify(err.message);
    }
  };

  if (safeCart.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Your cart is empty
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.title, { color: theme.text }]}>Your Cart</Text>

        {safeCart.map((item) => {
          if (!item?.id) return null;

          return (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                padding: 12,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                borderRadius: 8,
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: item.image_url || "https://via.placeholder.com/80" }}
                style={{ width: 80, height: 80, borderRadius: 6, marginRight: 12 }}
              />

              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: theme.text }]}>
                  {item.name || "Unnamed product"}
                </Text>

                <Text style={[styles.price, { color: theme.primary }]}>
                  ${Number(item.price || 0).toFixed(2)}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
                  <Pressable
                    onPress={() => handleDecrease(item)}
                    style={[styles.quantityButton, { backgroundColor: theme.surfaceAlt }]}
                  >
                    <Text style={{ color: theme.text, fontWeight: "bold" }}>-</Text>
                  </Pressable>

                  <Text style={[styles.quantity, { color: theme.text }]}>
                    {item.quantity || 1}
                  </Text>

                  <Pressable
                    onPress={() => handleIncrease(item)}
                    style={[styles.quantityButton, { backgroundColor: theme.surfaceAlt }]}
                  >
                    <Text style={{ color: theme.text, fontWeight: "bold" }}>+</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => handleRemove(item)}>
                  <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "600" }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={[styles.total, { borderTopColor: theme.border }]}>
          <Text style={[styles.totalText, { color: theme.text }]}>
            Total: ${total.toFixed(2)}
          </Text>

          <Pressable
            onPress={handleCheckout}
            style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: theme.surface, fontSize: 16, fontWeight: "bold" }}>Checkout</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 22, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  itemName: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, marginVertical: 4 },
  quantityButton: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  quantity: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
  total: { marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
  totalText: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
});

export default cart;