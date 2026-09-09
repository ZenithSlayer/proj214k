import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Img from "../assets/register.png";
import Login from "../components/Login";
import Register from "../components/Register";
import Toast from "../components/Toast";
import { useAppTheme } from "../context/ThemeContext";

const auth = ({ setToast }) => {
  const [mode, setMode] = useState("login");
  const [localToast, setLocalToast] = useState(null);
  const { theme } = useAppTheme();
  const notify = setToast || setLocalToast;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {localToast && <Toast {...localToast} onClose={() => setLocalToast(null)} />}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.selector}>
              <Pressable
                onPress={() => setMode("login")}
                style={[styles.selectorButton, { backgroundColor: theme.surface }, mode === "login" && { backgroundColor: theme.drawerActive, borderBottomColor: theme.accent }]}
              >
                <Text style={[styles.selectorText, { color: theme.textSecondary }, mode === "login" && { color: theme.text }]}>Login</Text>
              </Pressable>

              <Pressable
                onPress={() => setMode("register")}
                style={[styles.selectorButton, { backgroundColor: theme.surface }, mode === "register" && { backgroundColor: theme.drawerActive, borderBottomColor: theme.accent }]}
              >
                <Text style={[styles.selectorText, { color: theme.textSecondary }, mode === "register" && { color: theme.text }]}>Register</Text>
              </Pressable>
          </View>

          <View style={styles.authPanel}>
          <Image
            source={Img}
            style={[styles.image, styles.imageFullWidth, styles.imageTop]}
            resizeMode="cover"
          />

          {mode === "login" ? (
            <Login setToast={notify} stacked />
          ) : (
            <Register setToast={notify} stacked />
          )}
        </View>

      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  content: { width: "100%", maxWidth: 760, alignSelf: "center" },
  selector: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  selectorButton: { backgroundColor: "#1e293b", paddingVertical: 9, paddingHorizontal: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  selectorButtonActive: { backgroundColor: "#0f172a", borderBottomWidth: 3, borderBottomColor: "#ef4444" },
  selectorText: { color: "#cbd5e1", fontSize: 14, fontWeight: "600" },
  selectorTextActive: { color: "#ffffff" },
  authPanel: { flexDirection: "column", alignItems: "stretch" },
  image: { width: "100%", height: 180 },
  imageFullWidth: { width: "100%", height: 180 },
  imageTop: { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
});

export default auth;