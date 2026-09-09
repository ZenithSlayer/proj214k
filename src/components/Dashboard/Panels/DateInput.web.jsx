import { useAppTheme } from "../../../context/ThemeContext";

export default function DateInput({ value, onChange, min, style }) {
  const { theme } = useAppTheme();

  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={(event) => onChange(event.target.value)}
      style={{
        boxSizing: "border-box",
        width: "100%",
        minHeight: 42,
        padding: "0 12px",
        border: `1px solid ${theme.border}`,
        borderRadius: 6,
        backgroundColor: theme.surface,
        color: theme.text,
        fontSize: 14,
        ...style,
      }}
    />
  );
}