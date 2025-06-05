import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { API_URL } from "../constants/api";
import { COLORS } from "../constants/colors";

const SpendingLimitCard = () => {
    const [spendingLimit, setSpendingLimit] = useState(null);
    const [currentSpending, setCurrentSpending] = useState(0);
    const { user } = useUser();
    const router = useRouter();

    const fetchSpendingLimit = async () => {
        try {
            const response = await fetch(`${API_URL}/spending-limits/active/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setSpendingLimit(data);
            }
        } catch (error) {
            console.error('Error fetching spending limit:', error);
        }
    };

    const fetchCurrentSpending = async () => {
        try {
            const response = await fetch(`${API_URL}/transactions/current-period/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentSpending(data.totalSpending);
            }
        } catch (error) {
            console.error('Error fetching current spending:', error);
        }
    };

    useEffect(() => {
        fetchSpendingLimit();
        fetchCurrentSpending();
    }, []);

    const getProgressColor = () => {
        if (!spendingLimit) return COLORS.primary;
        const percentage = (currentSpending / spendingLimit.amount) * 100;
        if (percentage >= 100) return COLORS.error;
        if (percentage >= 80) return COLORS.warning;
        return COLORS.primary;
    };

    const getProgressPercentage = () => {
        if (!spendingLimit) return 0;
        return Math.min((currentSpending / spendingLimit.amount) * 100, 100);
    };

    const handleSetLimit = () => {
        router.push('/spending-limit');
    };

    if (!spendingLimit) {
        return (
            <TouchableOpacity style={styles.card} onPress={handleSetLimit}>
                <View style={styles.content}>
                    <Ionicons name="add-circle-outline" size={24} color={COLORS.text} />
                    <Text style={styles.setLimitText}>Set Spending Limit</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.card} onPress={handleSetLimit}>
            <View style={styles.header}>
                <Text style={styles.title}>Spending Limit</Text>
                <Text style={styles.period}>{spendingLimit.period}</Text>
            </View>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${getProgressPercentage()}%`, backgroundColor: getProgressColor() }]} />
            </View>
            <View style={styles.amounts}>
                <Text style={styles.currentAmount}>${currentSpending.toFixed(2)}</Text>
                <Text style={styles.limitAmount}>of ${spendingLimit.amount.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    setLimitText: {
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.text,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    period: {
        fontSize: 14,
        color: COLORS.textLight,
        textTransform: 'capitalize',
    },
    progressContainer: {
        height: 8,
        backgroundColor: COLORS.background,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    amounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    currentAmount: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
    },
    limitAmount: {
        fontSize: 16,
        color: COLORS.textLight,
    },
});

export default SpendingLimitCard; 