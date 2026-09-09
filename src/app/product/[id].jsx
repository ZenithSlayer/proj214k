import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Toast from "../../components/Toast";
import { useCart } from "../../context/CartContext";
import Product from "../product";

export default function ProductRoute() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [toast, setToast] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      <Product id={id} onAddToCart={addToCart} setToast={setToast} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </View>
  );
}