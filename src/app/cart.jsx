import React from "react";
import { View, Text, Image, Pressable, ScrollView, Alert, Platform } from "react-native";
import { useCart } from "../context/CartContext";

const cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
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
      const response = await fetch("https://214K.local/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: safeCart, total }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed");

      safeCart.forEach((item) => removeFromCart(item.id));
      notify("Order placed successfully!");
    } catch (err) {
      notify(err.message);
    }
  };

  if (safeCart.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: "#6b7280" }}>
          Your cart is empty
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Your Cart</Text>

        {safeCart.map((item) => {
          if (!item?.id) return null;

          return (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                padding: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
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
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.name || "Unnamed product"}
                </Text>

                <Text style={{ fontSize: 14, color: "#059669", marginVertical: 4 }}>
                  ${Number(item.price || 0).toFixed(2)}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
                  <Pressable
                    onPress={() => handleDecrease(item)}
                    style={{ backgroundColor: "#e5e7eb", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
                  >
                    <Text style={{ fontWeight: "bold" }}>-</Text>
                  </Pressable>

                  <Text style={{ marginHorizontal: 12, fontSize: 16, fontWeight: "600" }}>
                    {item.quantity || 1}
                  </Text>

                  <Pressable
                    onPress={() => handleIncrease(item)}
                    style={{ backgroundColor: "#e5e7eb", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
                  >
                    <Text style={{ fontWeight: "bold" }}>+</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => handleRemove(item)}>
                  <Text style={{ color: "#dc2626", fontSize: 12, fontWeight: "600" }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
            Total: ${total.toFixed(2)}
          </Text>

          <Pressable
            onPress={handleCheckout}
            style={{ backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}>Checkout</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default cart;