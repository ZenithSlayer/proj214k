import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../../services/api";

export const ProductPanel = ({ data, setData, setToast }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_name: "", image_url: "" });

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category_name: "", image_url: "" });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ 
      name: product.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      category_name: product.category_name || "",
      image_url: product.image_url || ""
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.price || !form.category_name) {
      setToast?.({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    const rawUser = await AsyncStorage.getItem("user");
    const storedUser = rawUser ? JSON.parse(rawUser) : null;
    const currentAdminId = storedUser?.id;

    if (!currentAdminId) {
      setToast?.({ message: "Session expired. Please log in again.", type: "error" });
      return;
    }

    const payload = { 
      ...form, 
      price: parseFloat(form.price),
      admin_id: currentAdminId
    };

    try {
      await api[editingId ? 'put' : 'post'](
        editingId ? `/products/${editingId}` : "/products",
        payload
      );
      resetForm();
    } catch (err) {
      setToast?.({ message: err.response?.data?.message || "Error saving product", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setData(prev => ({ ...prev, products: prev.products.filter(product => product.id !== id) }));
      setToast?.({ message: "Product removed", type: "success" });
    } catch {
      setToast?.({ message: "Delete failed", type: "error" });
    }
  };

  return (
    <View>
      <Text>Inventory Management</Text>
      
      <View>
        <Text>{editingId ? "Edit Product" : "Create New Product"}</Text>
        <TextInput 
          placeholder="Product Name" 
          value={form.name} 
          onChangeText={text => setForm({ ...form, name: text })} 
        />
        <TextInput 
          placeholder="Price" 
          keyboardType="numeric" 
          value={form.price} 
          onChangeText={text => setForm({ ...form, price: text })} 
        />
        <TextInput 
          placeholder="Description" 
          multiline
          value={form.description} 
          onChangeText={text => setForm({ ...form, description: text })} 
        />
        <TextInput 
          placeholder="Category" 
          value={form.category_name} 
          onChangeText={text => setForm({ ...form, category_name: text })} 
        />
        <TextInput 
          placeholder="Image URL" 
          value={form.image_url} 
          onChangeText={text => setForm({ ...form, image_url: text })} 
        />

        <View>
          <Pressable onPress={handleSubmit}>
            <Text>{editingId ? "Update Product" : "Add Product"}</Text>
          </Pressable>
          {editingId && (
            <Pressable onPress={resetForm}>
              <Text>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View>
        {(data?.products || []).map(product => (
          <View key={product.id}>
            <View>
              <Text>{product.name}</Text>
              <Text>${product.price}</Text>
            </View>
            <View>
              <Pressable onPress={() => handleEdit(product)}>
                <Text>Edit</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(product.id)}>
                <Text>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};