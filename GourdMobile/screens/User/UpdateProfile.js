import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import InputPrfl from "../../Shared/Form/InputPrfl";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import baseURL from "../../assets/common/baseurl";
import AuthGlobal from "../../Context/Store/AuthGlobal";
import * as ImagePicker from "expo-image-picker";
import { Camera } from 'expo-camera';
import mime from 'mime';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UpdateProfile = ({ route, navigation }) => {
    const { userDetails } = route.params;
    const context = useContext(AuthGlobal);
    const [updatedProfile, setUpdatedProfile] = useState(userDetails);
    const [loading, setLoading] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    useEffect(() => {
        const requestPermissions = async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
            const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaLibraryStatus.status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        };
        requestPermissions();
    }, []);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setUpdatedProfile({ ...updatedProfile, image: result.assets[0].uri });
        }
    };

    const takePhoto = async () => {
        if (hasCameraPermission === null) {
            alert("Camera permission is needed.");
            return;
        }
        if (!hasCameraPermission) {
            alert("No access to the camera.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setUpdatedProfile({ ...updatedProfile, image: result.assets[0].uri });
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("jwt");
            const userId = context.stateUser.user?.userId;

            if (userId) {
                const formData = new FormData();

                for (const key in updatedProfile) {
                    if (key === 'image' && updatedProfile.image) {
                        formData.append("image", {
                            uri: updatedProfile.image,
                            type: mime.getType(updatedProfile.image) || 'image/jpeg',
                            name: updatedProfile.image.split("/").pop(),
                        });
                    } else {
                        formData.append(key, updatedProfile[key]);
                    }
                }

                await axios.put(`${baseURL}users/${userId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                navigation.navigate("User Profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                alignItems: 'center',
                backgroundColor: '#E0F8E6',
                paddingVertical: 30,
            }}
        >
            <View style={styles.card}>
                {loading ? (
                    <ActivityIndicator size="large" color="#207868" />
                ) : (
                    <>
                        <View style={styles.avatarSection}>
                            <Image
                                source={{ uri: updatedProfile.image || 'https://via.placeholder.com/120' }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity
                                style={styles.editAvatar}
                                onPress={handleImagePick}
                            >
                                <MaterialIcons name="edit" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imageButtonRow}>
                            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
                                <MaterialIcons name="collections" size={22} color="#fff" />
                                <Text style={styles.imageBtnText}>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.imagePicker} onPress={takePhoto}>
                                <MaterialIcons name="photo-camera" size={22} color="#fff" />
                                <Text style={styles.imageBtnText}>Camera</Text>
                            </TouchableOpacity>
                        </View>

                        {['name', 'email', 'phone', 'street', 'apartment', 'zip', 'city', 'country'].map((field) => (
                            <View style={styles.infoRow} key={field}>
                                <Text style={styles.infoLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                                <InputPrfl
                                    placeholder={`Enter your ${field}`}
                                    onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, [field]: text })}
                                    value={updatedProfile[field]}
                                />
                            </View>
                        ))}

                        <TouchableOpacity style={styles.saveProfileButton} onPress={handleSaveProfile}>
                            <Text style={styles.saveProfileText}>Save Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate("User Profile")}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    card: {
        width: width > 500 ? 450 : '94%',
        backgroundColor: 'white',
        borderRadius: 15,
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        shadowColor: '#207868',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    avatarSection: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
        elevation: 2,
    },
    imageButtonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 10,
        gap: 16,
    },
    imagePicker: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#207868",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginHorizontal: 4,
        elevation: 2,
    },
    imageBtnText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 7,
        fontSize: 15,
    },
    infoRow: {
        marginBottom: 13,
        width: '100%',
    },
    infoLabel: {
        color: '#207868',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
        marginLeft: 2,
    },
    saveProfileButton: {
        backgroundColor: '#207868',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 18,
        width: '100%',
        elevation: 2,
    },
    saveProfileText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    cancelButton: {
        alignItems: 'center',
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 13,
        width: '100%',
        elevation: 1,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UpdateProfile;