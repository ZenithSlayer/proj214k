import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartApi } from "../services/cart";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    try {
      const data = await cartApi.getCart();
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
      await cartApi.addToCart(product.id, quantity);
      await fetchCart();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await cartApi.remove(id);
      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await cartApi.updateQuantity(id, quantity);
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