import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ItemRow from "../components/ItemRow.jsx";
import { useAppTheme } from "../context/ThemeContext";
import { productsApi } from "../services/products";

const Store = ({ categoryId, searchTerm = "" }) => {
  const { theme } = useAppTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerRow = 2;
  const rowsPerPage = 4;
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

  const rows = [];
  for (let i = 0; i < currentView.length; i += itemsPerRow) {
    rows.push(currentView.slice(i, i + itemsPerRow));
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading store...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.productGridVertical}>
        {rows.map((rowItems, index) => (
          <ItemRow key={`${currentPage}-${index}`} products={rowItems} />
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
    maxWidth: 800,
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
    color: "#555555",
    fontSize: 16,
  },
  productGridVertical: {
    flexDirection: "column",
    gap: 15,
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
    backgroundColor: "#ff6f61",
    borderRadius: 25,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  pageIndicator: {
    fontWeight: "600",
    color: "#555555",
    fontSize: 14,
  },
});

export default Store;