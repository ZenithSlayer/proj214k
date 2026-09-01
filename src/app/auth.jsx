import React, { useState } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import Login from "../components/Login";
import Register from "../components/Register";
import Img from "../assets/register.png";

const auth = ({ setToast }) => {
  const [mode, setMode] = useState("login");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={{ padding: 16, alignItems: "center" }}>
        
        {/* Toggle Controls */}
        <View style={{ flexDirection: "row", marginBottom: 20, backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4 }}>
          <Pressable
            onPress={() => setMode("login")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 6,
              backgroundColor: mode === "login" ? "#2563eb" : "transparent",
            }}
          >
            <Text style={{ color: mode === "login" ? "#ffffff" : "#4b5563", fontWeight: "600" }}>
              Login
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("register")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 6,
              backgroundColor: mode === "register" ? "#2563eb" : "transparent",
            }}
          >
            <Text style={{ color: mode === "register" ? "#ffffff" : "#4b5563", fontWeight: "600" }}>
              Register
            </Text>
          </Pressable>
        </View>

        {/* Content Section */}
        <View style={{ width: "100%", maxWidth: 400, alignItems: "center" }}>
          <Image
            source={Img}
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 20 }}
            resizeMode="contain"
          />

          {mode === "login" ? (
            <Login setToast={setToast} />
          ) : (
            <Register setToast={setToast} />
          )}
        </View>

      </View>
    </ScrollView>
  );
};

export default auth;