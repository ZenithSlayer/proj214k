import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import { addressesApi } from "../../../services/addresses.ts";
import { createPanelStyles } from "./panelStyles";

export const AddressPanel = ({ data, setData, setToast }) => {
  const { theme } = useAppTheme();
  const styles = createPanelStyles(theme);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    country: "",
    state: "",
    city: "",
    street: "",
    number: "",
    postal_code: ""
  });

  const addresses = data?.addresses || [];

  const resetForm = () => {
    setForm({ country: "", state: "", city: "", street: "", number: "", postal_code: "" });
    setEditingId(null);
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (addr) => {
    if (!addr) return;
    setEditingId(addr.id);
    setForm({
      country: addr.country || "",
      state: addr.state || "",
      city: addr.city || "",
      street: addr.street || "",
      number: addr.number ? String(addr.number) : "",
      postal_code: addr.postal_code || ""
    });
  };

  const handleFavorite = async (id) => {
    try {
      await addressesApi.setFavorite(id);
      setData(prev => ({
        ...prev,
        addresses: prev.addresses.map(a => 
          a ? { ...a, is_favorite: a.id === id ? 1 : 0 } : a
        )
      }));
      setToast?.({ message: "Favorite address updated", type: "success" });
    } catch (err) {
      setToast?.({ message: "Failed to update favorite", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await addressesApi.delete(id);
              setData(prev => ({
                ...prev,
                addresses: prev.addresses.filter(a => a && a.id !== id)
              }));
              setToast?.({ message: "Address deleted", type: "success" });
            } catch (err) {
              setToast?.({ message: "Error deleting address", type: "error" });
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    const allFieldsFilled = Object.values(form).every(value => 
      value && value.toString().trim() !== ""
    );
    
    if (!allFieldsFilled) {
      return setToast?.({ message: "All fields are required.", type: "error" });
    }

    try {
      if (editingId) {
        await addressesApi.update(editingId, form);
        setData(prev => ({
          ...prev,
          addresses: prev.addresses.map(a => 
            a?.id === editingId ? { ...a, ...form } : a
          )
        }));
        setToast?.({ message: "Address updated successfully", type: "success" });
      } else {
        const res = await addressesApi.create(form);
        const newAddress = res.address || { ...form, id: Date.now(), is_favorite: 0 };
        setData(prev => ({
          ...prev,
          addresses: [...prev.addresses, newAddress]
        }));
        setToast?.({ message: "New address added successfully", type: "success" });
      }
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Operation failed";
      setToast?.({ message: errorMsg, type: "error" });
    }
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Your Addresses</Text>
      <View style={{ gap: 12 }}>
        {addresses.length === 0 ? (
          <Text style={styles.empty}>No addresses saved yet.</Text>
        ) : (
          addresses.map(addr => {
            if (!addr) return null;

            return (
              <View key={addr.id} style={styles.card}>
                <View style={styles.row}>
                  <Pressable onPress={() => handleFavorite(addr.id)}>
                    <FontAwesome 
                      name={addr?.is_favorite ? "star" : "star-o"} 
                      size={20}
                      color={addr?.is_favorite ? "#f59e0b" : "#6b7280"}
                    />
                  </Pressable>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.text}>{addr.street || "Unknown Street"}, {addr.number || "N/A"}</Text>
                    <Text style={styles.muted}>{addr.city}, {addr.state}, {addr.country}</Text>
                    <Text style={styles.muted}>{addr.postal_code}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable onPress={() => handleEdit(addr)} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(addr.id)} style={styles.dangerButton}>
                    <Text style={styles.dangerText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{editingId ? "Edit Address" : "Add New Address"}</Text>
        <TextInput 
          placeholder="Country" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.country} 
          onChangeText={text => handleFieldChange("country", text)} 
        />
        <TextInput 
          placeholder="State" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.state} 
          onChangeText={text => handleFieldChange("state", text)} 
        />
        <TextInput 
          placeholder="City" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.city} 
          onChangeText={text => handleFieldChange("city", text)} 
        />
        <TextInput 
          placeholder="Street" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.street} 
          onChangeText={text => handleFieldChange("street", text)} 
        />
        <TextInput 
          placeholder="Number" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.number} 
          keyboardType="numeric"
          onChangeText={text => handleFieldChange("number", text.replace(/\D/g, ""))} 
        />
        <TextInput 
          placeholder="Postal Code" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.postal_code} 
          onChangeText={text => handleFieldChange("postal_code", text)} 
        />

        <View style={styles.actions}>
          <Pressable onPress={handleSubmit} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{editingId ? "Update Address" : "Add Address"}</Text>
          </Pressable>
          {editingId && (
            <Pressable onPress={resetForm} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};