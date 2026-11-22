import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { cartApi } from "../services/cart";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const pathname = usePathname();
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return [];

      const data = await cartApi.getCart();
      return Array.isArray(data) ? data : data.items || [];
    } catch (err) {
      console.error("Error loading cart:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadCart = async () => {
      const items = await fetchCart();
      if (active) setCart(items);
    };
    void loadCart();
    return () => {
      active = false;
    };
  }, [pathname, fetchCart]);

  const addToCart = async (product, quantity) => {
    try {
      await cartApi.addToCart(product.id, quantity);
      setCart(await fetchCart());
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
      setCart(await fetchCart());
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