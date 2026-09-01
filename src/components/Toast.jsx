import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import toastImage from "../assets/ToastImage.jpg";

const Toast = ({ message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <View>
      <Image source={toastImage} />
      <Text>{message}</Text>
    </View>
  );
};

export default Toast;