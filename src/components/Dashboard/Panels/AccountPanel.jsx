import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usersApi } from "../../../services/users";

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
    <View>
      <Text>Account Settings</Text>

      <View>
        <Text>Update Profile</Text>
        <TextInput 
          placeholder="Name" 
          value={profileForm.name} 
          onChangeText={text => setProfileForm({ ...profileForm, name: text })} 
        />
        <TextInput 
          placeholder="Email" 
          value={profileForm.email} 
          onChangeText={text => setProfileForm({ ...profileForm, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Pressable onPress={handleUpdateProfile} disabled={isSubmitting}>
          <Text>Update Info</Text>
        </Pressable>
      </View>

      <View>
        <Text>Security</Text>
        <TextInput 
          placeholder="Current Password" 
          secureTextEntry
          value={passwordForm.currentPassword}
          onChangeText={text => setPasswordForm({ ...passwordForm, currentPassword: text })}
        />
        <TextInput 
          placeholder="New Password (min 6 chars)" 
          secureTextEntry
          value={passwordForm.newPassword}
          onChangeText={text => setPasswordForm({ ...passwordForm, newPassword: text })}
        />
        <TextInput 
          placeholder="Confirm New Password" 
          secureTextEntry
          value={passwordForm.confirmPassword}
          onChangeText={text => setPasswordForm({ ...passwordForm, confirmPassword: text })}
        />
        <Pressable onPress={handleChangePassword}>
          <Text>Change Password</Text>
        </Pressable>
      </View>

      <View>
        <Text>Danger Zone</Text>
        <Pressable onPress={handleDeleteAccount}>
          <Text>Delete My Account</Text>
        </Pressable>
      </View>
    </View>
  );
};