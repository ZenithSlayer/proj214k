import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";

const Footer = () => {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.footer, { backgroundColor: theme.header }]}>
      <Text style={[styles.text, { color: theme.text }]}>No ©. No rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: { minHeight: 50, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  text: { color: "#ffffff", fontSize: 13 },
});

export default Footer;