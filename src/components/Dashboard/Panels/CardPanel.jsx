import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import { api } from "../../../services/api";
import DateInput from "./DateInput";
import { createPanelStyles } from "./panelStyles";

export const CardPanel = ({ data, setData, setToast }) => {
  const { theme } = useAppTheme();
  const styles = createPanelStyles(theme);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    card_number: "",
    security_code: "",
    expiration_date: ""
  });

  const cards = data?.cards || [];

  const minimumDate = new Date();
  const minimumDateString = `${minimumDate.getFullYear()}-${String(minimumDate.getMonth() + 1).padStart(2, "0")}-${String(minimumDate.getDate()).padStart(2, "0")}`;

  const handleFavorite = async (id) => {
    try {
      await api.put(`/users/card/${id}/favorite`);
      setData(prev => ({
        ...prev,
        cards: prev.cards.map(c => 
          c ? { ...c, is_favorite: c.id === id ? 1 : 0 } : c
        )
      }));
      setToast?.({ message: "Favorite card updated", type: "success" });
    } catch {
      setToast?.({ message: "Failed to update favorite", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/card/${id}`);
      setData(prev => ({
        ...prev,
        cards: prev.cards.filter(c => c && c.id !== id)
      }));
    } catch {
      setToast?.({ message: "Error deleting card", type: "error" });
    }
  };

  const handleSubmit = async () => {
    if (form.card_number.length !== 16) {
      return setToast?.({ message: "Card number must be 16 digits", type: "error" });
    }

    if (form.security_code.length < 3) {
      return setToast?.({ message: "Security code must be at least 3 digits", type: "error" });
    }

    if (!form.expiration_date) {
      return setToast?.({ message: "Select an expiration date", type: "error" });
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/users/card", form);
      
      if (res) {
        setToast?.({ message: "Card added. Refreshing...", type: "success" });
        const newCard = { 
          id: Date.now(), 
          card_number: form.card_number, 
          is_favorite: 0 
        };
        setData(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
      }
      
      setForm({ card_number: "", security_code: "", expiration_date: "" });
    } catch (err) {
      setToast?.({ message: err.message || "Error adding card", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Payment Methods</Text>
      <View style={{ gap: 12 }}>
        {cards.length === 0 ? (
          <Text style={styles.empty}>No cards saved yet.</Text>
        ) : (
          cards.map((card) => {
            if (!card) return null;

            return (
              <View key={card.id} style={styles.card}>
                <View style={styles.row}>
                  <Pressable onPress={() => handleFavorite(card.id)}>
                    <FontAwesome
                      name={card?.is_favorite ? "star" : "star-o"}
                      size={20}
                      color={card?.is_favorite ? "#f59e0b" : "#6b7280"}
                    />
                  </Pressable>
                  <Text style={styles.text}>Card ending in {card.card_number?.slice(-4) || "####"}</Text>
                </View>
                <Pressable onPress={() => handleDelete(card.id)} style={styles.dangerButton}>
                  <Text style={styles.dangerText}>Delete</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Card</Text>
        <TextInput
          placeholder="Card Number (16 digits)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.card_number}
          keyboardType="numeric"
          onChangeText={text => setForm({ ...form, card_number: text.replace(/\D/g, "") })}
          maxLength={16}
        />
        <TextInput
          placeholder="CVV"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={form.security_code}
          keyboardType="numeric"
          onChangeText={text => setForm({ ...form, security_code: text.replace(/\D/g, "") })}
          maxLength={4}
        />
        <Text style={styles.fieldLabel}>Expiration Date</Text>
        <DateInput
          value={form.expiration_date}
          min={minimumDateString}
          onChange={(expiration_date) => setForm({ ...form, expiration_date })}
        />
        <Pressable onPress={handleSubmit} disabled={isSubmitting} style={[styles.primaryButton, isSubmitting && { opacity: 0.6 }]}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? "Adding..." : "Add Card"}</Text>
        </Pressable>
      </View>
    </View>
  );
};