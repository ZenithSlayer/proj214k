import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { productsApi } from "../services/products";
// Import your individual product card component here (the one that handles your images):
// import ProductCard from "../components/ProductCard.jsx";

const Store = ({ categoryId, searchTerm = "" }) => {
  const { theme } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Responsive column configuration based on screen width
  const isPhone = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  // 2 items per row on phones, 3-4 on tablets/desktops
  const itemsPerRow = isPhone ? 2 : isTablet ? 3 : 4;
  const rowsPerPage = 5;
  const itemsPerPage = itemsPerRow * rowsPerPage;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        let data = [];
        if (categoryId) {
          data = await productsApi.getAllCategory(categoryId);
          setCurrentPage(0);
        } else {
          data = await productsApi.getAll();
        }
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Store Error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [categoryId]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [product.name, product.description, product.category_name, product.category_names]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });

  const filteredTotalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = currentPage * itemsPerPage;
  const currentView = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading store...</Text>
      </View>
    );
  }

  // Calculate exact percentage widths for flex-wrap to keep spacing clean
  const cardWidth = isPhone ? "48%" : isTablet ? "31%" : "23%";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.productGrid}>
        {currentView.map((product) => (
          <View key={product.id || product.name} style={[styles.cardWrapper, { width: cardWidth }]}>
            {/* 
              REPLACE THIS COMMENT WITH YOUR PRODUCT CARD COMPONENT 
              Example: <ProductCard product={product} /> 
              Make sure your card component contains your image code!
            */}
            <View style={[styles.fallbackCard, { backgroundColor: theme.surface || "#fff" }]}>
              <Text style={{ color: theme.text, fontWeight: "600" }} numberOfLines={2}>
                {product.name}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {filteredTotalPages > 1 && (
        <View style={styles.paginationBar}>
          <Pressable
            disabled={currentPage === 0}
            onPress={() => setCurrentPage((p) => p - 1)}
            style={({ pressed }) => [
              styles.pageButton, { backgroundColor: theme.accent },
              currentPage === 0 && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>← Previous</Text>
          </Pressable>

          <Text style={[styles.pageIndicator, { color: theme.textSecondary }]}>
            Page {currentPage + 1} of {filteredTotalPages}
          </Text>

          <Pressable
            disabled={currentPage === filteredTotalPages - 1}
            onPress={() => setCurrentPage((p) => p + 1)}
            style={({ pressed }) => [
              styles.pageButton, { backgroundColor: theme.accent },
              currentPage === filteredTotalPages - 1 && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>Next →</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
  },
  cardWrapper: {
    marginBottom: 5,
  },
  fallbackCard: {
    padding: 12,
    borderRadius: 8,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  paginationBar: {
    marginTop: 30,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  pageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  pageIndicator: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Store;