import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { productsApi } from "../services/products";
import StorePage from "./store";

const search = () => {
  const [tags, setTags] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    const getTags = async () => {
      try {
        const data = await productsApi.getAllTags();
        setTags(data);
      } catch (err) {
        console.error("Failed to load tags:", err);
      }
    };
    getTags();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={{ padding: 16 }}>
        
        {/* Horizontal Tag Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setSelectedCategoryId(null)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: selectedCategoryId === null ? "#2563eb" : "#f3f4f6",
              }}
            >
              <Text style={{ color: selectedCategoryId === null ? "#ffffff" : "#374151", fontWeight: "600" }}>
                All Products
              </Text>
            </Pressable>

            {tags.map((tag) => (
              <Pressable
                key={tag.id}
                onPress={() => setSelectedCategoryId(tag.id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: selectedCategoryId === tag.id ? "#2563eb" : "#f3f4f6",
                }}
              >
                <Text style={{ color: selectedCategoryId === tag.id ? "#ffffff" : "#374151", fontWeight: "600" }}>
                  {tag.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View>
          <StorePage categoryId={selectedCategoryId} />
        </View>
      </View>
    </ScrollView>
  );
};

export default search;