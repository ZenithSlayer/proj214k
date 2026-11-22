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
    router.push(`/product/${item.id}`);
  };

  const imageSource = item?.image_url ? { uri: item.image_url } : placeHolder;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${item?.name}`}
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

      <Text style={[styles.price, { color: theme.accent }]}>
        ${item?.price ? Number(item.price).toFixed(2) : "0.00"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    alignSelf: "stretch",
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
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
    width: "100%",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 6,
  },
});

export default StoreItem;