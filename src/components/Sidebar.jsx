import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Sidebar = ({ isOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, [pathname]);

  const menu = [
    { name: "Home", path: "/", icon: "home-outline" },
    { name: "Search", path: "/search", icon: "search-outline" },
    ...(isLoggedIn ? [{ name: "Cart", path: "/cart", icon: "cart-outline" }] : []),
    ...(isLoggedIn ? [{ name: "Dashboard", path: "/dashboard", icon: "speedometer-outline" }] : []),
  ];

  const handleAuthClick = async () => {
    if (isLoggedIn) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setIsLoggedIn(false);
    }
    router.push("/auth");
  };

  return (
    <View>
      {menu.map((item) => (
        <Pressable key={item.path} onPress={() => router.push(item.path)}>
          <Ionicons name={item.icon} size={20} />
          {isOpen && <Text>{item.name}</Text>}
        </Pressable>
      ))}

      <Pressable onPress={handleAuthClick}>
        <Ionicons name={isLoggedIn ? "log-out-outline" : "log-in-outline"} size={20} />
        {isOpen && <Text>{isLoggedIn ? "Logout" : "Login"}</Text>}
      </Pressable>
    </View>
  );
};

export default Sidebar;