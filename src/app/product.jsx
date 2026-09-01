import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { productsApi } from "../services/products";
import ItemRow from "../components/ItemRow";
import placeHolder from "../assets/placeHolder.png";

const product = ({ id, onAddToCart, setToast }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 8, color: "#6b7280" }}>Loading product...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, color: "#dc2626", fontWeight: "bold" }}>{error}</Text>
      </View>
    );
  }

  const parsedCategories = product?.categories ? JSON.parse(product.categories) : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={{ padding: 16 }}>
        <Image
          source={product?.image_url ? { uri: product.image_url } : placeHolder}
          style={{ width: "100%", height: 300, borderRadius: 12, marginBottom: 16 }}
          resizeMode="cover"
        />

        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>{product?.name}</Text>
        <Text style={{ fontSize: 16, color: "#4b5563", marginBottom: 16 }}>{product?.description}</Text>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#059669", marginBottom: 16 }}>
          ${Number(product?.price || 0).toFixed(2)}
        </Text>

        {/* Quantity Controls */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{ backgroundColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>-</Text>
          </Pressable>

          <Text style={{ marginHorizontal: 20, fontSize: 18, fontWeight: "600" }}>{quantity}</Text>

          <Pressable
            onPress={() => setQuantity((q) => q + 1)}
            style={{ backgroundColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>+</Text>
          </Pressable>
        </View>

        {/* Add to Cart Button */}
        <Pressable
          onPress={() => {
            onAddToCart?.(product, quantity);
            setToast?.({
              message: `${quantity}x ${product.name} added to cart`,
              type: "success",
            });
          }}
          style={{ backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center", marginBottom: 24 }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}>Add to Cart</Text>
        </Pressable>

        {/* Categories */}
        {parsedCategories.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Categories</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {parsedCategories.map((tag, index) => (
                <View key={index} style={{ backgroundColor: "#f3f4f6", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 }}>
                  <Text style={{ fontSize: 12, color: "#374151" }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <ItemRow offset={0} />
      </View>
    </ScrollView>
  );
};

export default product;