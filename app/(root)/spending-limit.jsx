import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { API_URL } from "../../constants/api";
import { styles } from "../../assets/styles/create.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const PERIODS = [
  { id: "daily", name: "Daily", icon: "calendar" },
  { id: "weekly", name: "Weekly", icon: "calendar" },
  { id: "monthly", name: "Monthly", icon: "calendar" },
];

const SpendingLimitScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const [amount, setAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    // validations
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!selectedPeriod) return Alert.alert("Error", "Please select a period");

    setIsLoading(true);
    try {
      console.log('User object:', user);
      console.log('User ID:', user?.id);

      const requestBody = {
        amount: parseFloat(amount),
        period: selectedPeriod,
        startDate: new Date().toISOString()
      };

      console.log('Sending request body:', requestBody);

      const response = await fetch(`${API_URL}/spending-limits/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set spending limit");
      }

      Alert.alert("Success", "Spending limit set successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to set spending limit");
      console.error("Error setting spending limit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Spending Limit</Text>
        <TouchableOpacity
          style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          {!isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {/* AMOUNT CONTAINER */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={COLORS.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* TITLE */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.text} /> Period
        </Text>

        <View style={styles.categoryGrid}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.categoryButton,
                selectedPeriod === period.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Ionicons
                name={period.icon}
                size={20}
                color={selectedPeriod === period.id ? COLORS.white : COLORS.text}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedPeriod === period.id && styles.categoryButtonTextActive,
                ]}
              >
                {period.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

export default SpendingLimitScreen; 