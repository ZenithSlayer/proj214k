import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { authApi } from "../services/auth";

const isValidEmail = (email) => {
  const basicCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!basicCheck) return false;

  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "live.com",
    "protonmail.com",
    "aol.com",
    "gmx.com",
    "yandex.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return allowedDomains.includes(domain);
};

const isValidCPF = (cpf) => {
  if (!cpf) return false;
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;

  const digits = cleaned.split("").map(Number);

  const calc = (slice) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += slice[i] * (slice.length + 1 - i);
    }
    const res = (sum * 10) % 11;
    return res === 10 ? 0 : res;
  };

  return (
    digits[9] === calc(digits.slice(0, 9)) &&
    digits[10] === calc(digits.slice(0, 10))
  );
};

const Register = ({ setToast, stacked = false }) => {
  const { theme } = useAppTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim())
      return setToast?.({ message: "Name is required.", type: "error" });

    if (!isValidEmail(form.email))
      return setToast?.({ message: "Invalid email.", type: "error" });

    if (form.password.length < 6)
      return setToast?.({ message: "Password too short.", type: "error" });

    if (!isValidCPF(form.cpf))
      return setToast?.({ message: "Invalid CPF.", type: "error" });

    try {
      const payload = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ""),
      };

      const data = await authApi.register(payload);

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      setToast?.({ message: "Registered successfully!", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      setToast?.({ message: err.message, type: "error" });
    }
  };

  return (
    <View style={[styles.form, { backgroundColor: theme.surface, borderLeftColor: theme.accent }, stacked && styles.stackedForm]}>
      <Text style={[styles.heading, { color: theme.text }]}>Register</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
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

      <TextInput
        placeholder="CPF"
        placeholderTextColor="#94a3b8"
        style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
        value={form.cpf}
        onChangeText={(text) => handleChange("cpf", text)}
        keyboardType="numeric"
      />

      <Pressable onPress={handleSubmit} style={[styles.button, { backgroundColor: theme.accent }]}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>Register</Text>
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

export default Register;