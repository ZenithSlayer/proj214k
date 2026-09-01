import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_URL = "http://192.168.0.241:5000/api/cart";
const getToken = () => localStorage.getItem("token");

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setCart(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error("Error loading cart:", err);
      setCart([]); 
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
        }),
      });

      await fetchCart();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      await fetchCart();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};