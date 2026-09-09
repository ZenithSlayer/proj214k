import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";

const ErrorPage = () => {
  const { theme } = useAppTheme();
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 32, fontWeight: "bold", color: theme.text, marginBottom: 16 }}>
        Error {code}
      </Text>
      
      <Image
        source={{ uri: `https://http.cat/${code}` }}
        style={{ width: 300, height: 240, borderRadius: 8, marginBottom: 16 }}
        resizeMode="contain"
      />
      
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8, color: theme.text }}>
        Oops! Something went wrong.
      </Text>
      
      <Text style={{ fontSize: 14, color: theme.textSecondary }}>
        Redirecting to home in {countdown}...
      </Text>
    </View>
  );
};

export default ErrorPage;