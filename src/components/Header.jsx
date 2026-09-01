import React from "react";
import { View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import logo from "../assets/logo.png";

const Header = ({ toggleSidebar }) => {
  return (
    <View>
      <Pressable onPress={toggleSidebar}>
        <Ionicons name="menu" size={24} color="black" />
      </Pressable>

      <Image source={logo} />
    </View>
  );
};

export default Header;