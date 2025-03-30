import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useTensorflowModel } from 'react-native-fast-tflite';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from "@react-native-community/image-editor";
import jpeg from 'jpeg-js';
import { ScrollView } from "react-native"; // Import ScrollView


const modelAsset = require("../assets/model_unquant_March23.tflite");

function GourdIdentify() {
    const [image, setImage] = useState(null);
    const [gender, setGender] = useState("");
    const [gourdType, setGourdType] = useState("");
    const [variety, setVariety] = useState("");
    const [modelLoaded, setModelLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [probabilityDetails, setProbabilityDetails] = useState(""); // Add state to store probabilities

    const labels = [
        { gender: "Male", type: "Sponge Gourd", variety: "Smooth" },
        { gender: "Female", type: "Sponge Gourd", variety: "Smooth" },
        { gender: "Male", type: "Bitter Gourd", variety: "Bilog" },
        { gender: "Female", type: "Bitter Gourd", variety: "Bilog" },
        { gender: "Female", type: "Bottle Gourd", variety: "Smooth" },
        { gender: "Male", type: "Bottle Gourd", variety: "Smooth" },
        { gender: "Male", type: "Bitter Gourd", variety: "Haba" },
    ];

    const model = useTensorflowModel(modelAsset);
    const actualModel = model.state === 'loaded' ? model.model : undefined;

    const modelLoadRef = useRef(false);

    useEffect(() => {
        if (actualModel && !modelLoadRef.current) {
            console.log("Model loaded!");
            setModelLoaded(true);
            modelLoadRef.current = true;
        }
    }, [actualModel]);

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
                    if (!result.canceled) {
                        console.log("Image picked from camera:", result.assets[0].uri);
                        setImage(result.assets[0].uri);
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
                    if (!result.canceled) {
                        console.log("Image picked from gallery:", result.assets[0].uri);
                        setImage(result.assets[0].uri);
                    }
                },
            },
        ];
        Alert.alert("Select Image", "Choose an option", options);
    };

    const preprocessImage = async (imageUri) => {
        try {
            const resizedImage = await ImageResizer.createResizedImage(
                imageUri,
                224, 
                224, 
                "JPEG",
                100
            );
    
            const imgBuffer = await FileSystem.readAsStringAsync(resizedImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
    
            const imageTensor = new Uint8Array(atob(imgBuffer).split("").map(c => c.charCodeAt(0)));
            const { data, width, height } = jpeg.decode(imageTensor, { useTArray: true });
    
            // Normalize the image data to [0, 1]
            const rgbData = [];
            for (let i = 0; i < data.length; i += 4) {
                rgbData.push(data[i] / 255);      // Red
                rgbData.push(data[i + 1] / 255);  // Green
                rgbData.push(data[i + 2] / 255);  // Blue
            }
    
            return new Float32Array(rgbData);
        } catch (error) {
            console.error("Error preprocessing image:", error);
            return null;
        }
    };
    

    const softmax = (logits) => {
        const exps = logits.map(Math.exp);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sumExps);
    };

    const handleIdentify = async () => {
        if (!modelLoaded) {
            Alert.alert("Error", "Model is not loaded yet. Please try again.");
            return;
        }
        if (!image) {
            Alert.alert("Error", "Please select an image to identify.");
            return;
        }
    
        setLoading(true);
        try {
            const tensorInput = await preprocessImage(image);
            if (!tensorInput) {
                Alert.alert("Error", "Failed to process image.");
                return;
            }
    
            const reshapedTensor = new Float32Array(1 * 224 * 224 * 3);
            reshapedTensor.set(tensorInput, 0);
    
            const result = actualModel.runSync([reshapedTensor]);
            if (result && result.length > 0) {
                console.log("Raw Model Output:", result[0]); // Debugging raw output
    
                const probabilities = softmax(result[0]);
                console.log("Probabilities:", probabilities);
    
                // Format probabilities for display
                const formattedProbabilities = labels.map((label, index) => {
                    return `${label.type} (${label.gender}, ${label.variety}): ${(probabilities[index] * 100).toFixed(2)}%`;
                }).join("\n");
    
                setProbabilityDetails(formattedProbabilities); // Update state with probabilities
    
                const maxProbability = Math.max(...probabilities);
                const maxIndex = probabilities.findIndex(p => p === maxProbability);
    
                console.log("Max Probability:", maxProbability, "Index:", maxIndex);
    
                if (maxProbability < 0.15) { // Adjusted confidence threshold
                    Alert.alert("Low Confidence", "The model is not confident about its prediction.");
                    return;
                }
    
                setGender(labels[maxIndex].gender);
                setGourdType(labels[maxIndex].type);
                setVariety(labels[maxIndex].variety);
            } else {
                Alert.alert("Inference Error", "Could not classify image.");
            }
        } catch (error) {
            console.error("Error during identification:", error);
            Alert.alert("Error", "Failed to process the image.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleReset = () => {
        setImage(null);
        setGender("");
        setGourdType("");
        setVariety("");
        setProbabilityDetails(""); 
    };

    

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {model.state === 'loading' && <ActivityIndicator size="large" color="blue" />}
                {model.state === 'error' && <Text>Failed to load model! {model.error.message}</Text>}
    
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.imageWrapper} onPress={handleImagePick}>
                        {image ? (
                            <>
                                <Image source={{ uri: image }} style={styles.image} />
                                <TouchableOpacity style={styles.removeButton} onPress={() => setImage(null)}>
                                    <Text style={styles.removeText}>X</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={styles.placeholderText}>Add Image</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.identifyButton} onPress={handleIdentify}>
                    <Text style={styles.identifyText}>Identify</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
                <View style={styles.resultContainer}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Gender:</Text>
                        <TextInput style={styles.resultBox} editable={false} value={gender} />
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Type:</Text>
                        <TextInput style={styles.resultBox} editable={false} value={gourdType} />
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Variety:</Text>
                        <TextInput style={styles.resultBox} editable={false} value={variety} />
                    </View>
                    {probabilityDetails ? (
                        <Text style={styles.probabilityText}>{probabilityDetails}</Text>
                    ) : null}
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
    },
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5", // Light background
        padding: 20,
        width: "100%", // Ensure full width
    },
    imageContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    imageWrapper: {
        width: 200,
        height: 200,
        backgroundColor: "#E0E0E0", // Neutral background for image placeholder
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        elevation: 5, // Shadow for modern look
    },
    image: {
        width: "100%",
        height: "100%",
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
        backgroundColor: "#FF5252", // Red for remove button
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
        backgroundColor: "#4CAF50", // Green for identify button
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 20,
        elevation: 3,
    },
    identifyText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },
    resetButton: {
        backgroundColor: "#FF6347", // Orange-red for reset button
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
        backgroundColor: "#FFFFFF", // White card for results
        borderRadius: 15,
        elevation: 5,
        width: "100%", // Ensure full width
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
        marginRight: 10,
    },
    resultBox: {
        flex: 1,
        backgroundColor: "#F9F9F9", // Light gray for result box
        borderColor: "#DDDDDD",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        color: "#333333",
    },
    probabilityText: {
        marginTop: 20,
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        fontStyle: "italic",
    },
});
export default GourdIdentify;