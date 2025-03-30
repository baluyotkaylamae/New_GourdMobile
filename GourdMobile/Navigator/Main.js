import React, { useContext, useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthGlobal from "../Context/Store/AuthGlobal";
import LoginScreen from "../screens/User/Login";
import DrawerNavigator from "./DrawerNavigator";
import { jwtDecode } from "jwt-decode";

const Stack = createNativeStackNavigator();

const Main = () => {
    const context = useContext(AuthGlobal);
    const [loading, setLoading] = useState(true); // State to manage loading

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("jwt"); // Retrieve the token
            if (token) {
                try {
                    const decoded = jwtDecode(token); // Decode the token
                    context.dispatch({ type: "SET_CURRENT_USER", payload: decoded }); // Update authentication state
                } catch (error) {
                    console.error("Token decoding error:", error);
                    context.dispatch({ type: "SET_CURRENT_USER", payload: {} }); // Clear state if decoding fails
                }
            } else {
                console.warn("No token found in AsyncStorage.");
                context.dispatch({ type: "SET_CURRENT_USER", payload: {} }); // Clear state if no token
            }
            setLoading(false); // Stop loading after checking the token
        };

        checkToken();
    }, []);

    const isAuthenticated = context.stateUser && context.stateUser.isAuthenticated;

    if (loading) {
        // Show loading indicator while fetching the token
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {isAuthenticated ? (
                <Stack.Screen
                    name="MainTabs"
                    component={DrawerNavigator}
                    options={{ headerShown: false }}
                />
            ) : (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            )}
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center", // Center the content
        backgroundColor: "#ffffff", // Optional: Add a background color
    },
});

export default Main;
