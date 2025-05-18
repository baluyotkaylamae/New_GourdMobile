import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { logoutUser } from "../../Context/Actions/Auth.actions";
import { MaterialIcons } from '@expo/vector-icons';

const UserDetails = ({ route }) => {
    const context = useContext(AuthGlobal);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { userId } = route.params;

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('jwt');
                if (userId && token) {
                    const response = await axios.get(`${baseURL}users/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserDetails(response.data.user || {});
                }
            } catch (error) {
                // Handle error
            } finally {
                setLoading(false);
            }
        };

        if (!context.stateUser.isAuthenticated) {
            navigation.navigate('Login');
            return;
        }

        fetchUserDetails();
    }, [userId, context.stateUser.isAuthenticated]);

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');
            const userId = context.stateUser?.user?.userId;
            await axios.post(`${baseURL}users/logout`, { userId }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await AsyncStorage.removeItem('jwt');
            logoutUser(context.dispatch);
            navigation.navigate('Login');
        } catch (error) {}
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#207868" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.outer}>
            <View style={styles.profileCard}>
                <View style={styles.avatarSection}>
                    <Image
                        source={{ uri: userDetails?.image || 'https://via.placeholder.com/120' }}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity
                        style={styles.editAvatar}
                        onPress={() => navigation.navigate('UpdateProfile', { userDetails })}
                    >
                        <MaterialIcons name="edit" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{userDetails?.name || 'Anonymous User'}</Text>
                <Text style={styles.userEmail}>{userDetails?.email || 'No Email'}</Text>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <MaterialIcons name="phone" size={20} color="#A4B465" />
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{userDetails?.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="home" size={20} color="#A4B465" />
                    <Text style={styles.infoLabel}>Street:</Text>
                    <Text style={styles.infoValue}>{userDetails?.street || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-city" size={20} color="#A4B465" />
                    <Text style={styles.infoLabel}>Apartment:</Text>
                    <Text style={styles.infoValue}>{userDetails?.apartment || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="markunread-mailbox" size={20} color="#A4B465" />
                    <Text style={styles.infoLabel}>Zip:</Text>
                    <Text style={styles.infoValue}>{userDetails?.zip || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-city" size={20} color="#A4B465" />
                    <Text style={styles.infoLabel}>City:</Text>
                    <Text style={styles.infoValue}>{userDetails?.city || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="flag" size={20} color="#A4B465" />
                    <Text style={styles.infoLabel}>Country:</Text>
                    <Text style={styles.infoValue}>{userDetails?.country || 'N/A'}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('UpdateProfile', { userDetails })}
            >
                <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 7 }} />
                <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editButton, styles.logoutButton]} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color="#fff" style={{ marginRight: 7 }} />
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    outer: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 24,
        paddingHorizontal: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F5F5F5"
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 24,
        paddingHorizontal: 32,
        marginBottom: 18,
        width: '92%',
        elevation: 4,
        shadowColor: '#1f6f78',
        shadowOpacity: 0.09,
        shadowOffset: { width: 0, height: 2 },
    },
    avatarSection: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        borderWidth: 2.5,
        borderColor: "#A4B465",
        backgroundColor: "#e0f6eb",
    },
    editAvatar: {
        position: "absolute",
        bottom: 6,
        right: 12,
        backgroundColor: "#A4B465",
        borderRadius: 16,
        padding: 5,
        elevation: 3,
    },
    userName: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#9EBC8A',
        marginBottom: 2,
        letterSpacing: 1,
    },
    userEmail: {
        fontSize: 15,
        color: '#888',
        marginBottom: 10,
        fontWeight: "500",
    },
    infoCard: {
        width: '92%',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 18,
        elevation: 2,
        shadowColor: '#A4B465',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 1 },
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 7,
    },
    infoLabel: {
        fontSize: 15,
        color: "#207868",
        fontWeight: "600",
        marginLeft: 5,
        minWidth: 70,
    },
    infoValue: {
        fontSize: 15,
        color: "#444",
        fontWeight: "500",
        marginLeft: 2,
        flex: 1,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        width: '92%',
        backgroundColor: "#207868",
        paddingVertical: 13,
        borderRadius: 9,
        alignSelf: "center",
        justifyContent: "center",
        marginBottom: 10,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
    },
});

export default UserDetails;