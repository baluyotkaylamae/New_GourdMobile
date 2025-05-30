import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import InputUser from "../../Shared/Form/InputUser";
import Error from "../../Shared/Error";
import axios from "axios";
import baseURL from "../../assets/common/baseurl";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Camera } from 'expo-camera';
import Icon from "react-native-vector-icons/FontAwesome";
import mime from "mime";

const { width } = Dimensions.get("window");

const initialFieldErrors = {
    email: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    street: "",
    apartment: "",
    zip: "",
    city: "",
    country: "",
};

const Register = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [apartment, setApartment] = useState("");
    const [zip, setZip] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [image, setImage] = useState(null);
    const navigation = useNavigation();
    const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);

    // Loader state
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        })();
    }, []);

    const pickImage = async () => {
        if (isLoading) return;
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        if (isLoading) return;
        if (hasCameraPermission === null) {
            alert("Camera permission is needed.");
            return;
        } else if (hasCameraPermission === false) {
            alert("No access to the camera.");
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const register = () => {
        let errors = { ...initialFieldErrors };
        let hasError = false;

        if (!email) {
            errors.email = "Email is required.";
            hasError = true;
        } else {
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.email = "Please enter a valid email address.";
                hasError = true;
            }
        }
        if (!name) {
            errors.name = "Full Name is required.";
            hasError = true;
        }
        if (!phone) {
            errors.phone = "Phone Number is required.";
            hasError = true;
        } else if (!/^\d{7,}$/.test(phone)) {
            errors.phone = "Please enter a valid phone number.";
            hasError = true;
        }
        if (!password) {
            errors.password = "Password is required.";
            hasError = true;
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
            hasError = true;
        }
        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password.";
            hasError = true;
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
            hasError = true;
        }
        if (!street) {
            errors.street = "Street is required.";
            hasError = true;
        }
        if (!apartment) {
            errors.apartment = "Apartment/Unit is required.";
            hasError = true;
        }
        if (!zip) {
            errors.zip = "Zip is required.";
            hasError = true;
        }
        if (!city) {
            errors.city = "City is required.";
            hasError = true;
        }
        if (!country) {
            errors.country = "Country is required.";
            hasError = true;
        }

        setFieldErrors(errors);

        if (hasError) return; // Don't show loader if validation fails

        setIsLoading(true); // Show loader only after validation passes

        const formData = new FormData();
        if (image) {
            formData.append("image", {
                uri: image,
                type: mime.getType(image),
                name: image.split("/").pop(),
            });
        }
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("phone", phone);
        formData.append("street", street);
        formData.append("apartment", apartment);
        formData.append("zip", zip);
        formData.append("city", city);
        formData.append("country", country);
        formData.append("isAdmin", false);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };

        axios
            .post(`${baseURL}users/register`, formData, config)
            .then((res) => {
                setIsLoading(false);
                if (res.status === 201) {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "Registration Succeeded",
                        text2: "Please Login into your account",
                    });
                    setEmail(""); setName(""); setPhone(""); setStreet(""); setApartment(""); setZip(""); setCity(""); setCountry(""); setPassword(""); setConfirmPassword(""); setImage(null);
                    setTimeout(() => {
                        navigation.navigate("Login");
                    }, 500);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                Toast.show({
                    position: 'bottom',
                    bottomOffset: 20,
                    type: "error",
                    text1: "Something went wrong",
                    text2: error.response?.data?.message || "Please try again",
                });
            });
    };

    // Larger avatar size
    const AVATAR = Math.min(width * 0.38, 160);

    return (
        <View style={{flex: 1}}>
            {/* Loader Modal */}
            <Modal
                visible={isLoading}
                transparent
                animationType="fade"
                onRequestClose={() => {}} // disables back button
            >
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#3baea0" />
                    <Text style={{marginTop: 15, color: "#333"}}>Creating your account...</Text>
                </View>
            </Modal>

            <ScrollView style={{ backgroundColor: "#fff" }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={!isLoading}>
                <View style={styles.card}>
                    {/* Avatar inside card, above Personal Info */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity style={[styles.avatarContainer, { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 }]} onPress={pickImage} activeOpacity={0.85} disabled={isLoading}>
                            {image ? (
                                <Image style={[styles.avatar, { width: AVATAR - 6, height: AVATAR - 6, borderRadius: (AVATAR - 6) / 2 }]} source={{ uri: image }} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { width: AVATAR - 6, height: AVATAR - 6, borderRadius: (AVATAR - 6) / 2 }]}>
                                    <Icon name="user" size={Math.max(AVATAR * 0.32, 36)} color="#bdbdbd" />
                                    <Text style={styles.addPhotoText}>Add Photo</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto} disabled={isLoading}>
                                <Icon name="camera" size={Math.max(AVATAR * 0.15, 16)} color="#fff" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.sectionLabel}>Personal Info</Text>
                        <InputUser
                            placeholder="Email Address"
                            placeholderTextColor="#bdbdbd"
                            style={styles.input}
                            value={email}
                            onChangeText={(text) => { setEmail(text.toLowerCase()); setFieldErrors({ ...fieldErrors, email: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
                        <InputUser
                            placeholder="Full Name"
                            style={styles.input}
                            value={name}
                            onChangeText={(text) => { setName(text); setFieldErrors({ ...fieldErrors, name: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
                        <InputUser
                            placeholder="Phone Number"
                            keyboardType="numeric"
                            style={styles.input}
                            value={phone}
                            onChangeText={(text) => { setPhone(text); setFieldErrors({ ...fieldErrors, phone: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
                        <InputUser
                            placeholder="Password"
                            secureTextEntry={true}
                            style={styles.input}
                            value={password}
                            onChangeText={(text) => { setPassword(text); setFieldErrors({ ...fieldErrors, password: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
                        <InputUser
                            placeholder="Confirm Password"
                            secureTextEntry={true}
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                            }}
                            editable={!isLoading}
                        />
                        {fieldErrors.confirmPassword ? (
                            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
                        ) : null}
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.sectionLabel}>Address</Text>
                        <InputUser
                            placeholder="Street"
                            style={styles.input}
                            value={street}
                            onChangeText={(text) => { setStreet(text); setFieldErrors({ ...fieldErrors, street: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.street ? <Text style={styles.fieldError}>{fieldErrors.street}</Text> : null}
                        <InputUser
                            placeholder="Apartment/Unit"
                            style={styles.input}
                            value={apartment}
                            onChangeText={(text) => { setApartment(text); setFieldErrors({ ...fieldErrors, apartment: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.apartment ? <Text style={styles.fieldError}>{fieldErrors.apartment}</Text> : null}

                        <InputUser
                            placeholder="Zip"
                            keyboardType="numeric"
                            style={[styles.input, { marginBottom: 0 }]}
                            value={zip}
                            onChangeText={(text) => { setZip(text); setFieldErrors({ ...fieldErrors, zip: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.zip ? <Text style={styles.fieldError}>{fieldErrors.zip}</Text> : null}

                        <InputUser
                            placeholder="City"
                            style={[styles.input, { marginBottom: 0 }]}
                            value={city}
                            onChangeText={(text) => { setCity(text); setFieldErrors({ ...fieldErrors, city: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.city ? <Text style={styles.fieldError}>{fieldErrors.city}</Text> : null}

                        <InputUser
                            placeholder="Country"
                            style={styles.input}
                            value={country}
                            onChangeText={(text) => { setCountry(text); setFieldErrors({ ...fieldErrors, country: "" }); }}
                            editable={!isLoading}
                        />
                        {fieldErrors.country ? <Text style={styles.fieldError}>{fieldErrors.country}</Text> : null}
                    </View>
                    <View style={styles.buttonGroup}>
                        {error ? <Error message={error} style={styles.error} /> : null}
                        <EasyButton
                            login
                            primary
                            onPress={register}
                            style={styles.registerButton}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        </EasyButton>
                    </View>
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate("Login")}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        paddingBottom: 0,
        minHeight: "100%",
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 4,
        paddingBottom: 50,
        elevation: 4,
        shadowColor: "#207868",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        paddingTop: 18,
        paddingHorizontal: 5,
        width: Math.min(width * 0.97, 410),
        alignSelf: "center",
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 12,
        marginTop: 0,
    },
    avatarContainer: {
        backgroundColor: "#eaf9f0",
        borderWidth: 2,
        borderColor: "#3baea0",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: 7,
        shadowColor: "#3baea0",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 5,
    },
    avatar: {
        resizeMode: "cover",
    },
    avatarPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eaf9f0",
    },
    addPhotoText: {
        color: "#bdbdbd",
        marginTop: 5,
        fontSize: 13,
        fontWeight: "500",
    },
    cameraButton: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: "#1f6f78",
        padding: 8,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#fff",
        elevation: 3,
        zIndex: 10,
    },
    inputGroup: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#207868',
        marginBottom: 8,
        marginTop: 2,
    },
    input: {
        backgroundColor: '#F6F7FB',
        borderRadius: 8,
        paddingHorizontal: 13,
        paddingVertical: 11,
        fontSize: 15,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    registerButton: {
        backgroundColor: '#3baea0',
        borderRadius: 9,
        paddingVertical: 12,
        marginTop: 6,
        marginBottom: 1,
        alignItems: 'center',
        width: '100%',
        elevation: 1,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.8,
    },
    buttonGroup: {
        width: "100%",
        alignItems: "center",
        marginVertical: 10,
    },
    loginLink: {
        marginTop: 12,
        alignSelf: "center",
        marginBottom: 5,
    },
    loginText: {
        color: "#6B7280",
        fontSize: 13.5,
    },
    loginHighlight: {
        color: "#3baea0",
        fontWeight: "700",
    },
    error: {
        backgroundColor: '#FEF2F2',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        width: "100%",
    },
    fieldError: {
        color: '#e74c3c',
        fontSize: 12,
        marginBottom: 6,
        marginLeft: 2,
        paddingLeft: 10,
    },
    loaderOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.22)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
    },
});

export default Register;