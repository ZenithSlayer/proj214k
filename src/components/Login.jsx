import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { authApi } from "../services/auth";

const Login = ({ setToast, stacked = false }) => {
  const { theme } = useAppTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.identifier) {
      return setToast?.({ message: "Email or username is required.", type: "error" });
    }

    if (!form.password) {
      return setToast?.({ message: "Password is required.", type: "error" });
    }

    try {
      const data = await authApi.login({
        identifier: form.identifier,
        password: form.password,
      });

      await AsyncStorage.setItem("token", data.token);

      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }

      setToast?.({ message: "Login successful!", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      setToast?.({ message: err.message, type: "error" });
    }
  };

  return (
    <View style={[styles.form, { backgroundColor: theme.surface, borderLeftColor: theme.accent }, stacked && styles.stackedForm]}>
      <Text style={[styles.heading, { color: theme.text }]}>Login</Text>

      <TextInput
        placeholder="Email or Name"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
        value={form.identifier}
        onChangeText={(text) => handleChange("identifier", text)}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      <Pressable onPress={handleSubmit} style={[styles.button, { backgroundColor: theme.accent }]}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>Login</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  form: { flex: 1, minWidth: 0, justifyContent: "center", gap: 8, backgroundColor: "#1e293b", padding: 24, borderTopRightRadius: 10, borderBottomRightRadius: 10, borderLeftWidth: 4, borderLeftColor: "#ef4444" },
  stackedForm: { borderLeftWidth: 0, borderTopWidth: 4, borderTopColor: "#ef4444", borderTopRightRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  heading: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  input: { height: 40, backgroundColor: "#fff", borderRadius: 4, paddingHorizontal: 8, color: "#0f172a" },
  button: { marginTop: 8, padding: 12, alignItems: "center", backgroundColor: "#ef4444", borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "700" },
});

export default Login;