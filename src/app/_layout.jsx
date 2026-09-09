import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import { Drawer, DrawerContentScrollView, DrawerItem } from "expo-router/drawer";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider, useAppTheme } from "../context/ThemeContext";

const menuItems = [
  { label: "Home", path: "/", icon: "home-outline" },
  { label: "Search", path: "/search", icon: "search-outline" },
];

function AppDrawerContent(props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme } = useAppTheme();

  const refreshAuthState = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  };

  useEffect(() => {
    refreshAuthState();
  }, [pathname]);

  const items = [
    ...menuItems,
    ...(isLoggedIn
      ? [
          { label: "Cart", path: "/cart", icon: "cart-outline" },
          { label: "Dashboard", path: "/dashboard", icon: "speedometer-outline" },
        ]
      : [{ label: "Login", path: "/auth", icon: "log-in-outline" }]),
  ];

  const handleAuth = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setIsLoggedIn(false);
    props.navigation.closeDrawer();
    router.replace("/auth");
  };

  return (
    <View style={[styles.drawer, { backgroundColor: theme.drawer }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={[styles.drawerContent, { backgroundColor: theme.drawer }]}>
        {items.map((item) => (
          <DrawerItem
            key={item.path}
            label={item.label}
            focused={pathname === item.path}
            activeTintColor={theme.text}
            inactiveTintColor={theme.text}
            activeBackgroundColor={theme.drawerActive}
            labelStyle={styles.drawerLabel}
            style={styles.drawerItem}
            icon={({ color, size }) => <Ionicons name={item.icon} size={size} color={color} />}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push(item.path);
            }}
          />
        ))}
        {isLoggedIn && (
          <DrawerItem
            label="Logout"
            activeTintColor={theme.text}
            inactiveTintColor={theme.accent}
            labelStyle={styles.drawerLabel}
            style={styles.drawerItem}
            icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
            onPress={handleAuth}
          />
        )}
      </DrawerContentScrollView>
    </View>
  );
}

function LayoutContent() {
  const { theme } = useAppTheme();

  return (
    <CartProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => <AppDrawerContent {...props} />}
            screenOptions={{
              header: (props) => <Header navigation={props.navigation} />,
              headerTintColor: "#fff",
              drawerActiveTintColor: "#ffffff",
              drawerStyle: { backgroundColor: theme.drawer, width: 280 },
            }}
          >
            <Drawer.Screen name="index" options={{ drawerLabel: "Home Store", title: "Store Overview" }} />
            <Drawer.Screen name="cart" options={{ drawerLabel: "Shopping Cart", title: "My Cart" }} />
            <Drawer.Screen name="orders" options={{ drawerLabel: "My Orders", title: "Order History" }} />
          </Drawer>
          <Footer />
          </View>
        </GestureHandlerRootView>
    </CartProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  drawer: { flex: 1, backgroundColor: "#0f172a" },
  drawerContent: { paddingTop: 20, backgroundColor: "#0f172a", flexGrow: 1 },
  drawerItem: { borderRadius: 0, marginVertical: 0, marginHorizontal: 0 },
  drawerLabel: { fontSize: 15, fontWeight: "600", marginLeft: 4 },
});