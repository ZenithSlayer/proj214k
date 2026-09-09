import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, Pressable, Text } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import { createPanelStyles } from "./panelStyles";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DateInput({ value, onChange, min }) {
  const { theme } = useAppTheme();
  const styles = createPanelStyles(theme);
  const [visible, setVisible] = React.useState(false);
  const selectedDate = value ? new Date(`${value}T12:00:00`) : new Date();
  const minimumDate = new Date(`${min}T12:00:00`);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.inputButton}>
        <Text style={value ? styles.text : styles.placeholderText}>{value || "Select a date"}</Text>
      </Pressable>
      {visible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minimumDate}
          onChange={(event, date) => {
            if (Platform.OS !== "ios") setVisible(false);
            if (date) onChange(formatDate(date));
          }}
        />
      )}
    </>
  );
}