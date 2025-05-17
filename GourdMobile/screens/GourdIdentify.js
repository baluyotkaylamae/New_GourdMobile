import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import ImageResizer from "react-native-image-resizer";
import jpeg from "jpeg-js";
import axios from "axios";

function GourdIdentify() {
    const [image, setImage] = useState(null);
    const [gender, setGender] = useState("");
    const [gourdType, setGourdType] = useState("");
    const [variety, setVariety] = useState("");
    const [confidence, setConfidence] = useState("");
    const [loading, setLoading] = useState(false);

    // Helper: Blurriness filter
    const checkBlurriness = async (imageUri) => {
        try {
            const resizedImage = await ImageResizer.createResizedImage(
                imageUri, 100, 100, "JPEG", 80
            );
            const imgBuffer = await FileSystem.readAsStringAsync(resizedImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imageTensor = Uint8Array.from(atob(imgBuffer), c => c.charCodeAt(0));
            const { data } = jpeg.decode(imageTensor, { useTArray: true });
            let variance = 0;
            for (let i = 0; i < data.length; i += 4) {
                variance += Math.pow(data[i] - 128, 2);
            }
            variance /= data.length / 4;
            return variance < 100;
        } catch (error) {
            return false;
        }
    };

    // Helper: Lighting filter
    const checkLighting = async (imageUri) => {
        try {
            const resizedImage = await ImageResizer.createResizedImage(
                imageUri, 100, 100, "JPEG", 80
            );
            const imgBuffer = await FileSystem.readAsStringAsync(resizedImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const imageTensor = Uint8Array.from(atob(imgBuffer), c => c.charCodeAt(0));
            const { data } = jpeg.decode(imageTensor, { useTArray: true });
            let brightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            brightness /= data.length / 4;
            if (brightness < 50) return "dark";
            if (brightness > 200) return "bright";
            return "normal";
        } catch (error) {
            return "normal";
        }
    };

    const handleImagePick = async () => {
        const options = [
            { text: "Cancel", style: "cancel" },
            {
                text: "Camera",
                onPress: async () => {
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 1,
                    });
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                        const imageUri = result.assets[0].uri;
                        setLoading(true);
                        setTimeout(async () => {
                            const isBlurry = await checkBlurriness(imageUri);
                            const lighting = await checkLighting(imageUri);
                            setLoading(false);
                            if (isBlurry) {
                                Alert.alert("Blurry Image", "The image appears blurry. Please clean the lens and retake the photo.");
                                return;
                            }
                            if (lighting === "dark") {
                                Alert.alert("Low Lighting", "The lighting is too dark. Please adjust the lighting and retake the photo.");
                                return;
                            }
                            if (lighting === "bright") {
                                Alert.alert("High Lighting", "The lighting is too bright. Please adjust the lighting and retake the photo.");
                                return;
                            }
                            setImage(imageUri);
                        }, 0);
                    }
                },
            },
            {
                text: "Gallery",
                onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 1,
                    });
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                        const imageUri = result.assets[0].uri;
                        setLoading(true);
                        setTimeout(async () => {
                            const isBlurry = await checkBlurriness(imageUri);
                            const lighting = await checkLighting(imageUri);
                            setLoading(false);
                            if (isBlurry) {
                                Alert.alert("Blurry Image", "The image appears blurry. Please clean the lens and retake the photo.");
                                return;
                            }
                            if (lighting === "dark") {
                                Alert.alert("Low Lighting", "The lighting is too dark. Please adjust the lighting and retake the photo.");
                                return;
                            }
                            if (lighting === "bright") {
                                Alert.alert("High Lighting", "The lighting is too bright. Please adjust the lighting and retake the photo.");
                                return;
                            }
                            setImage(imageUri);
                        }, 0);
                    }
                },
            },
        ];
        Alert.alert("Select Image", "Choose an option", options);
    };

    const removeImage = () => {
        setImage(null);
        setGender("");
        setGourdType("");
        setVariety("");
        setConfidence("");
    };

    const handleIdentify = async () => {
        if (!image) {
            Alert.alert("Error", "Please select an image first.");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", {
                uri: image,
                type: "image/jpeg",
                name: "gourd_image.jpg",
            });
            const response = await axios.post("https://gourdtify-2f23690d96e0.herokuapp.com/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Adjust this part based on your backend's response structure
            const { predicted_class, confidence } = response.data;
            // Example: predicted_class = "SpongeFemale"
            const [type, genderResult] = predicted_class.split(/(?=[A-Z][a-z])/); // Split at capital letter
            setGourdType(type || "");
            setGender(genderResult || "");
            setConfidence(confidence || "");
        } catch (error) {
            console.error("Error identifying image:", error);
            Alert.alert("Error", "Failed to identify the image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.imageWrapper} onPress={handleImagePick}>
                    {image ? (
                        <>
                            <Image source={{ uri: image }} style={styles.image} />
                            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                                <Text style={styles.removeText}>X</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.placeholderText}>Add Image</Text>
                    )}
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.identifyButton} onPress={handleIdentify} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.identifyText}>Identify</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={removeImage}>
                <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <View style={styles.resultContainer}>
                <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Gender </Text>
                    <TextInput style={styles.resultBox} editable={false} value={gender} />
                </View>
                <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Type</Text>
                    <TextInput style={styles.resultBox} editable={false} value={gourdType} />
                </View>
                <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Confidence</Text>
                    <TextInput style={styles.resultBox} editable={false} value={confidence} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "#F5F5F5",
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 20,
        width: "100%",
        maxWidth: 400,
        elevation: 5,
    },
    imageContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    imageWrapper: {
        width: 200,
        height: 200,
        backgroundColor: "#E0E0E0",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 15,
    },
    placeholderText: {
        color: "#888",
        fontSize: 16,
        textAlign: "center",
    },
    removeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#FF5252",
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },
    removeText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    identifyButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 10,
        elevation: 3,
    },
    identifyText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
    resetButton: {
        backgroundColor: "#FF6347",
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 10,
        elevation: 3,
    },
    resetText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
    resultContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: "#FFFFFF",
        elevation: 5,
        width: "100%",
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    resultLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333333",
        width: 90,
    },
    resultBox: {
        flex: 1,
        height: 40,
        backgroundColor: "#F9F9F9",
        borderColor: "#A4B465",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        fontSize: 16,
        color: "#333333",
        textAlignVertical: "center",
    },
});

export default GourdIdentify;