import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const ErrorPage = () => {
  const { statusCode } = useLocalSearchParams();
  const router = useRouter();
  const code = statusCode || 404;
  const waiter = 5000;

  const [countdown, setCountdown] = useState(waiter / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      router.replace("/");
    }, waiter);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router, waiter]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#ffffff" }}>
      <Text style={{ fontSize: 32, fontWeight: "bold", marginBottom: 16 }}>
        Error {code}
      </Text>
      
      <Image
        source={{ uri: `https://http.cat/${code}` }}
        style={{ width: 300, height: 240, borderRadius: 8, marginBottom: 16 }}
        resizeMode="contain"
      />
      
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#111827" }}>
        Oops! Something went wrong.
      </Text>
      
      <Text style={{ fontSize: 14, color: "#6b7280" }}>
        Redirecting to home in {countdown}...
      </Text>
    </View>
  );
};

export default ErrorPage;