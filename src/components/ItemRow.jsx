import React from "react";
import { View, StyleSheet } from "react-native";
import StoreItem from "./StoreItem";

const ItemRow = ({ products = [] }) => {
  return (
    <View style={styles.container}>
      {products.map((item) => (
        <View key={item.id} style={styles.itemWrapper}>
          <StoreItem item={item} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  itemWrapper: {
    width: "48%", // Places two items per row with space in between
    marginBottom: 16,
  },
});

export default ItemRow;