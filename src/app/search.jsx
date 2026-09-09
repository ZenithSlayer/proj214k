import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { productsApi } from "../services/products";
import StorePage from "./store";

const search = () => {
  const { theme } = useAppTheme();
  const [tags, setTags] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [query, setQuery] = useState("");

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
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.title, { color: theme.text }]}>Find Products</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by product name or description"
          placeholderTextColor="#64748b"
          style={[styles.searchInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {/* Horizontal Tag Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setSelectedCategoryId(null)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: selectedCategoryId === null ? theme.primary : theme.surfaceAlt,
              }}
            >
              <Text style={{ color: selectedCategoryId === null ? theme.surface : theme.text, fontWeight: "600" }}>
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
                  backgroundColor: selectedCategoryId === tag.id ? theme.primary : theme.surfaceAlt,
                }}
              >
                <Text style={{ color: selectedCategoryId === tag.id ? theme.surface : theme.text, fontWeight: "600" }}>
                  {tag.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

          <View>
          <StorePage categoryId={selectedCategoryId} searchTerm={query} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: { color: "#0f172a", fontSize: 24, fontWeight: "700", marginBottom: 10 },
  searchInput: { height: 46, marginBottom: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, backgroundColor: "#fff", color: "#0f172a", fontSize: 16 },
});

export default search;