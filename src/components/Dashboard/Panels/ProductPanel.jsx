import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import { api } from "../../../services/api";
import { createPanelStyles } from "./panelStyles";

const PAGE_SIZE = 6;

export const ProductPanel = ({ data, setData, setToast }) => {
  const { theme } = useAppTheme();
  const styles = createPanelStyles(theme);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", image_url: "" });
  const [categories, setCategories] = useState([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const products = data?.products || [];

  useEffect(() => {
    api.get("/categories")
      .then(setCategories)
      .catch((error) => setToast?.({ message: error.message, type: "error" }));
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    return !query || [product.name, product.description, product.category_name]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleProducts = filteredProducts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const reloadProducts = async () => {
    const productsResult = await api.get("/products");
    setData((previous) => ({ ...previous, products: productsResult }));
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category_id: "", image_url: "" });
    setImagePreview("");
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      category_id: product.category_id ? String(product.category_id) : "",
      image_url: product.image_url || "",
    });
    setImagePreview(product.image_url || "");
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType || "image/jpeg";
      const extension = mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : ".jpg";
      const file = Platform.OS === "web"
        ? asset.file
        : { uri: asset.uri, name: `product-${Date.now()}${extension}`, type: mimeType };
      if (!file) throw new Error("The selected image could not be read");

      setUploadingImage(true);
      const uploaded = await api.upload("/products/upload-image", file);
      setForm((previous) => ({ ...previous, image_url: uploaded.url }));
      setImagePreview(asset.uri);
      setToast?.({ message: "Image uploaded", type: "success" });
    } catch (error) {
      setToast?.({ message: error.message || "Image upload failed", type: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category_id) {
      setToast?.({ message: "Name, description, price, and category are required", type: "error" });
      return;
    }

    try {
      const payload = { ...form, price: parseFloat(form.price), category_id: Number(form.category_id) };
      await api[editingId ? "put" : "post"](editingId ? `/products/${editingId}` : "/products", payload);
      await reloadProducts();
      resetForm();
      setToast?.({ message: editingId ? "Product updated" : "Product added", type: "success" });
    } catch (error) {
      setToast?.({ message: error.message || "Error saving product", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setData((previous) => ({ ...previous, products: previous.products.filter((product) => product.id !== id) }));
      setToast?.({ message: "Product removed", type: "success" });
    } catch (error) {
      setToast?.({ message: error.message || "Delete failed", type: "error" });
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      const category = await api.post("/categories", { name });
      setCategories((previous) => [...previous, category].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((previous) => ({ ...previous, category_id: String(category.id) }));
      setNewCategoryName("");
      setToast?.({ message: "Category created", type: "success" });
    } catch (error) {
      setToast?.({ message: error.message || "Could not create category", type: "error" });
    }
  };

  const selectedCategory = categories.find((category) => String(category.id) === String(form.category_id));

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Inventory Management</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{editingId ? "Edit Product" : "Create New Product"}</Text>
        <TextInput placeholder="Product Name" placeholderTextColor="#94a3b8" style={styles.input} value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <TextInput placeholder="Price" placeholderTextColor="#94a3b8" style={styles.input} keyboardType="decimal-pad" value={form.price} onChangeText={(price) => setForm({ ...form, price })} />
        <TextInput placeholder="Description" placeholderTextColor="#94a3b8" style={[styles.input, styles.multiline]} multiline value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
        <Pressable onPress={() => setCategoryPickerOpen(true)} style={styles.inputButton}>
          <Text style={selectedCategory ? styles.text : styles.placeholderText}>{selectedCategory?.name || "Choose a category"}</Text>
        </Pressable>
        <Pressable onPress={handlePickImage} disabled={uploadingImage} style={styles.imagePicker}>
          {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.imagePreview} /> : <Text style={styles.placeholderText}>Choose product image</Text>}
          <Text style={styles.secondaryButtonText}>{uploadingImage ? "Uploading..." : imagePreview ? "Change image" : "Choose image"}</Text>
        </Pressable>
        <View style={styles.actions}>
          <Pressable onPress={handleSubmit} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{editingId ? "Update Product" : "Add Product"}</Text></Pressable>
          {editingId && <Pressable onPress={resetForm} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Find Products</Text>
        <TextInput placeholder="Search by name, description, or category" placeholderTextColor="#94a3b8" style={styles.input} value={search} onChangeText={(value) => { setSearch(value); setPage(0); }} />
        <Text style={styles.muted}>{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found</Text>
      </View>

      <View style={{ gap: 12 }}>
        {visibleProducts.length === 0 ? <Text style={styles.empty}>No products match your search.</Text> : visibleProducts.map((product) => (
          <View key={product.id} style={styles.card}>
            <View style={styles.row}><Text style={styles.text}>{product.name}</Text><Text style={styles.muted}>${Number(product.price || 0).toFixed(2)}</Text></View>
            <Text style={styles.muted}>{product.category_name || "Uncategorized"}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => handleEdit(product)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Edit</Text></Pressable>
              <Pressable onPress={() => handleDelete(product.id)} style={styles.dangerButton}><Text style={styles.dangerText}>Delete</Text></Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.pagination}>
        <Pressable disabled={currentPage === 0} onPress={() => setPage((value) => value - 1)} style={[styles.secondaryButton, currentPage === 0 && styles.disabledButton]}><Text style={styles.secondaryButtonText}>Previous</Text></Pressable>
        <Text style={styles.muted}>Page {currentPage + 1} of {pageCount}</Text>
        <Pressable disabled={currentPage >= pageCount - 1} onPress={() => setPage((value) => value + 1)} style={[styles.secondaryButton, currentPage >= pageCount - 1 && styles.disabledButton]}><Text style={styles.secondaryButtonText}>Next</Text></Pressable>
      </View>

      <Modal visible={categoryPickerOpen} transparent animationType="fade" onRequestClose={() => setCategoryPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Choose Category</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {categories.map((category) => <Pressable key={category.id} onPress={() => { setForm({ ...form, category_id: String(category.id) }); setCategoryPickerOpen(false); }} style={styles.modalOption}><Text style={styles.text}>{category.name}</Text></Pressable>)}
            </ScrollView>
            <TextInput placeholder="New category name" placeholderTextColor="#94a3b8" style={styles.input} value={newCategoryName} onChangeText={setNewCategoryName} />
            <View style={styles.actions}>
              <Pressable onPress={handleCreateCategory} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Add Category</Text></Pressable>
              <Pressable onPress={() => setCategoryPickerOpen(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Close</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
