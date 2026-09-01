import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { api } from "../../../services/api";

export const CardPanel = ({ data, setData, setToast }) => {
  const [form, setForm] = useState({
    card_number: "",
    security_code: "",
    expiration_date: ""
  });

  const cards = data?.cards || [];

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
    if (form.card_number.length < 16) {
      return setToast?.({ message: "Card number must be 16 digits", type: "error" });
    }

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
      setToast?.({ message: err?.response?.data?.error || "Error adding card", type: "error" });
    }
  };

  return (
    <View>
      <Text>Payment Methods</Text>
      <View>
        {cards.length === 0 ? (
          <Text>No cards saved yet.</Text>
        ) : (
          cards.map((card) => {
            if (!card) return null;

            return (
              <View key={card.id}>
                <View>
                  <Pressable onPress={() => handleFavorite(card.id)}>
                    <FontAwesome
                      name={card?.is_favorite ? "star" : "star-o"}
                      size={20}
                      color={card?.is_favorite ? "#f59e0b" : "#6b7280"}
                    />
                  </Pressable>
                  <Text>Card ending in {card.card_number?.slice(-4) || "####"}</Text>
                </View>
                <Pressable onPress={() => handleDelete(card.id)}>
                  <Text>Delete</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View>
        <Text>Add New Card</Text>
        <TextInput
          placeholder="Card Number (16 digits)"
          value={form.card_number}
          keyboardType="numeric"
          onChangeText={text => setForm({ ...form, card_number: text.replace(/\D/g, "") })}
          maxLength={16}
        />
        <TextInput
          placeholder="CVV"
          value={form.security_code}
          keyboardType="numeric"
          onChangeText={text => setForm({ ...form, security_code: text.replace(/\D/g, "") })}
          maxLength={4}
        />
        <TextInput
          placeholder="Expiration Date (YYYY-MM-DD)"
          value={form.expiration_date}
          onChangeText={text => setForm({ ...form, expiration_date: text })}
        />
        <Pressable onPress={handleSubmit}>
          <Text>Add Card</Text>
        </Pressable>
      </View>
    </View>
  );
};