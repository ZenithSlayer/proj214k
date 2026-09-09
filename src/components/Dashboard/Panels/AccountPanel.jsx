import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";
import { usersApi } from "../../../services/users";
import { createPanelStyles } from "./panelStyles";

const isValidEmail = (email) => {
  const basicCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!basicCheck) return false;

  const allowedDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
    "icloud.com", "live.com", "protonmail.com", "aol.com", 
    "gmx.com", "yandex.com"
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return allowedDomains.includes(domain);
};

export const AccountPanel = ({ data, setData, setToast }) => {
  const { theme } = useAppTheme();
  const styles = createPanelStyles(theme);
  const router = useRouter();
  
  const [profileForm, setProfileForm] = useState({
    name: data.user?.name || "",
    email: data.user?.email || ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      return setToast?.({ message: "Name is required.", type: "error" });
    }

    if (!isValidEmail(profileForm.email)) {
      return setToast?.({ message: "Please use a valid email from a recognized provider.", type: "error" });
    }

    setIsSubmitting(true);
    try {
      const res = await usersApi.updateProfile(profileForm);
      setData(prev => ({ ...prev, user: { ...prev.user, ...res.user } }));
      setToast?.({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setToast?.({ message: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      return setToast?.({ message: "New password must be at least 6 characters.", type: "error" });
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setToast?.({ message: "Passwords do not match.", type: "error" });
    }

    try {
      await usersApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setToast?.({ message: "Password updated successfully!", type: "success" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setToast?.({ message: err.message, type: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Permanently delete your account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await usersApi.deleteAccount();
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("user");
              setToast?.({ message: "Account deleted.", type: "success" });
              router.push("/auth");
            } catch (err) {
              setToast?.({ message: "Delete failed.", type: "error" });
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Account Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Profile</Text>
        <TextInput 
          placeholder="Name"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={profileForm.name} 
          onChangeText={text => setProfileForm({ ...profileForm, name: text })} 
        />
        <TextInput 
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={profileForm.email} 
          onChangeText={text => setProfileForm({ ...profileForm, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Pressable onPress={handleUpdateProfile} disabled={isSubmitting} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? "Updating..." : "Update Info"}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TextInput 
          placeholder="Current Password" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          secureTextEntry
          value={passwordForm.currentPassword}
          onChangeText={text => setPasswordForm({ ...passwordForm, currentPassword: text })}
        />
        <TextInput 
          placeholder="New Password (min 6 chars)" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          secureTextEntry
          value={passwordForm.newPassword}
          onChangeText={text => setPasswordForm({ ...passwordForm, newPassword: text })}
        />
        <TextInput 
          placeholder="Confirm New Password" 
          placeholderTextColor="#94a3b8"
          style={styles.input}
          secureTextEntry
          value={passwordForm.confirmPassword}
          onChangeText={text => setPasswordForm({ ...passwordForm, confirmPassword: text })}
        />
        <Pressable onPress={handleChangePassword} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Change Password</Text>
        </Pressable>
      </View>

      <View style={[styles.section, { borderWidth: 1, borderColor: "#7f1d1d" }]}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <Pressable onPress={handleDeleteAccount} style={styles.dangerButton}>
          <Text style={styles.dangerText}>Delete My Account</Text>
        </Pressable>
      </View>
    </View>
  );
};