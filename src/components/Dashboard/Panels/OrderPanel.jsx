import React from "react";
import { View, Text } from "react-native";

export const OrderPanel = ({ orders = [] }) => {
  return (
    <View>
      <Text>Order History</Text>
      <View>
        {orders.length === 0 ? (
          <Text>You haven't placed any orders yet.</Text>
        ) : (
          orders.map((o) => (
            <View key={o.id}>
              <View>
                <Text>Order #{o.id}</Text>
                <Text>{o.status}</Text>
              </View>
              <View>
                <Text>Total: ${o.total}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};