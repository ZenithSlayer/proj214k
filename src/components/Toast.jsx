import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import toastImage from "../assets/ToastImage.jpg";

const Toast = ({ message, type = "error", onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <View style={[styles.toast, type === "success" ? styles.success : styles.error]}>
      <Image source={toastImage} style={styles.image} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: { position: "absolute", top: 20, alignSelf: "center", zIndex: 1000, elevation: 8, flexDirection: "row", width: "90%", maxWidth: 420, borderRadius: 5, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
  success: { backgroundColor: "#4caf50" },
  error: { backgroundColor: "#f44336" },
  image: { width: 50, height: 50 },
  message: { flex: 1, alignSelf: "center", color: "#fff", marginHorizontal: 10 },
});

export default Toast;