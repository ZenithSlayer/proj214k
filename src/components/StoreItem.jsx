import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import placeHolder from "../assets/placeHolder.png";
import { useAppTheme } from "../context/ThemeContext";

const StoreItem = ({ item }) => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    router.replace(`/product/${item.id}`);
  };

  const imageSource = item?.image_url ? { uri: item.image_url } : placeHolder;

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.card, { backgroundColor: theme.surface, borderColor: theme.border },
        (isHovered || pressed) && styles.cardHovered,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {item?.name}
      </Text>

      {/* <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {item?.description}
      </Text>

      <Text style={[styles.price, { color: theme.accent }]}>
        ${item?.price ? Number(item.price).toFixed(2) : "0.00"}
      </Text>

      <View style={[styles.button, { backgroundColor: theme.accent }]}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>View Details</Text>
      </View> */}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: 350,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 5,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
  },
  cardHovered: {
    ...(Platform.OS === "web" && {
      transform: [{ translateY: -5 }],
    }),
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  imageContainer: {
    width: "100%",
    maxWidth: 200,
    aspectRatio: 1,
    overflow: "hidden",
    padding: 5,
  },
  image: {
    borderRadius: 5,
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6f61",
    marginVertical: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ff6f61",
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default StoreItem;