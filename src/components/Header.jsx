import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import logo from "../assets/logo.png";
import { useAppTheme } from "../context/ThemeContext";

const Header = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useAppTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.header }]}>
      <Pressable onPress={() => navigation?.toggleDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={30} color={theme.text} />
      </Pressable>

      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <Pressable onPress={toggleTheme} style={styles.themeButton} accessibilityLabel="Toggle color theme">
        <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={theme.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { height: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  menuButton: { padding: 8 },
  themeButton: { padding: 8 },
  logo: { height: 80, width: 150 },
});

export default Header;