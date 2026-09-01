import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: "#ff6f61" },
          headerTintColor: "#fff",
          drawerActiveTintColor: "#ff6f61",
          drawerStyle: { backgroundColor: "#fff", width: 280 },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home Store",
            title: "Store Overview",
          }}
        />
        <Drawer.Screen
          name="cart"
          options={{
            drawerLabel: "Shopping Cart",
            title: "My Cart",
          }}
        />
        <Drawer.Screen
          name="orders"
          options={{
            drawerLabel: "My Orders",
            title: "Order History",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}