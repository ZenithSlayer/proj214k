import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import bannerArt from "../assets/wideArt.jpg";
import StoreItem from "../components/StoreItem";
import { useAppTheme } from "../context/ThemeContext";
import { productsApi } from "../services/products";

const Store = ({ categoryId, searchTerm = "", showBanner = false }) => {
  const { theme } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const filterKey = `${categoryId || ""}:${searchTerm}`;
  const [pagination, setPagination] = useState({ filterKey, page: 0 });
  const currentPage = pagination.filterKey === filterKey ? pagination.page : 0;
  const updateCurrentPage = (update) => {
    setPagination((current) => {
      const page = current.filterKey === filterKey ? current.page : 0;
      return {
        filterKey,
        page: typeof update === "function" ? update(page) : update,
      };
    });
  };

  const availableGridWidth = gridWidth || Math.min(windowWidth, 1000) - 30;
  const columns = availableGridWidth < 560 ? 2 : availableGridWidth < 900 ? 3 : 4;
  const gridGap = 10;
  const cardWidth = Math.max(0, (availableGridWidth - gridGap * (columns - 1)) / columns);
  const rowsPerPage = 5;
  const itemsPerPage = columns * rowsPerPage;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = categoryId
          ? await productsApi.getAllCategory(categoryId)
          : await productsApi.getAll();
        if (!Array.isArray(data)) {
          throw new Error("The catalog returned an invalid product list.");
        }
        setProducts(data);
      } catch (err) {
        setProducts([]);
        setLoadError(err instanceof Error ? err.message : "Could not load products.");
      } finally {
        setLoading(false);
      }
    };
    void fetchAll();
  }, [categoryId, reloadKey]);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [product.name, product.description, product.category_name, product.category_names]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });

  const filteredTotalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = currentPage * itemsPerPage;
  const currentView = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      {showBanner && (
        <ImageBackground
          source={bannerArt}
          imageStyle={styles.bannerImage}
          style={styles.banner}
          accessibilityRole="image"
          accessibilityLabel="214K store banner"
        >
          <View style={styles.bannerShade}>
            <Text style={styles.bannerTitle}>Welcome to 214K</Text>
            <Text style={styles.bannerSubtitle}>Find your next favorite item.</Text>
          </View>
        </ImageBackground>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading store...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{loadError}</Text>
          <Pressable
            onPress={() => setReloadKey((key) => key + 1)}
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View
            style={styles.productGrid}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              if (width !== gridWidth) setGridWidth(width);
            }}
          >
            {currentView.map((product) => (
              <View key={product.id || product.name} style={[styles.cardWrapper, { width: cardWidth }]}>
                <StoreItem item={product} />
              </View>
            ))}
            {filteredProducts.length === 0 && (
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                No products are available yet.
              </Text>
            )}
          </View>

          {filteredTotalPages > 1 && (
            <View style={styles.paginationBar}>
              <Pressable
                disabled={currentPage === 0}
                onPress={() => updateCurrentPage((p) => p - 1)}
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
                onPress={() => updateCurrentPage((p) => p + 1)}
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
        </>
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
    backgroundColor: "transparent",
  },
  banner: {
    height: 220,
    width: "100%",
    marginBottom: 24,
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 12,
  },
  bannerImage: {
    borderRadius: 12,
  },
  bannerShade: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 28,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: "#ffffff",
    fontSize: 17,
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
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
  },
  cardWrapper: {
    flexGrow: 0,
    flexShrink: 0,
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