import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { api } from "../services/api";

export const useDashboardData = (setToast) => {
  const router = useRouter();
  const [data, setData] = useState({
    user: null,
    orders: [],
    addresses: [],
    cards: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await api.get("/users/me");
      setData((prev) => ({ ...prev, ...res, user: res.user }));

      if (res.user?.is_admin) {
        const prodRes = await api.get("/products");
        setData((prev) => ({ ...prev, products: prodRes }));
      }
    } catch (err) {
      setToast?.({ message: "Failed to load dashboard", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, setData, loading, reload: fetchData };
};