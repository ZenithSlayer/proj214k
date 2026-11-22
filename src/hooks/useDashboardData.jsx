import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/client";

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

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return router.push("/auth");

      const [res, orders] = await Promise.all([
        api.get("/users/me"),
        api.get("/orders"),
      ]);
      setData((prev) => ({ ...prev, ...res, user: res.user, orders }));

      if (res.user?.is_admin) {
        const prodRes = await api.get("/products");
        setData((prev) => ({ ...prev, products: prodRes }));
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setToast?.({ message: "Failed to load dashboard", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [router, setToast]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (active) await fetchData();
    };
    void loadData();
    return () => {
      active = false;
    };
  }, [fetchData]);

  return { data, setData, loading, reload: fetchData };
};