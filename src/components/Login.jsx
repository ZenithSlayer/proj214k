import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../services/auth";

const Login = ({ setToast }) => {
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
    <View>
      <Text>Login</Text>

      <TextInput
        placeholder="Email or Name"
        value={form.identifier}
        onChangeText={(text) => handleChange("identifier", text)}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      <Pressable onPress={handleSubmit}>
        <Text>Login</Text>
      </Pressable>
    </View>
  );
};

export default Login;