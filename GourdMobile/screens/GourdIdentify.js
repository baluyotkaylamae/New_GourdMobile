import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useTensorflowModel } from 'react-native-fast-tflite';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from "@react-native-community/image-editor";
import jpeg from 'jpeg-js';

const modelAsset = require("../assets/march5_model_unquant.tflite");

function GourdIdentify() {
    const [image, setImage] = useState(null);
    const [gender, setGender] = useState("");
    const [gourdType, setGourdType] = useState("");
    const [variety, setVariety] = useState("");
    const [modelLoaded, setModelLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const labels = [
        { gender: "Male", type: "Sponge Gourd", variety: "Smooth" },
        { gender: "Female", type: "Sponge Gourd", variety: "Smooth" },
        { gender: "Male", type: "Bitter Gourd", variety: "Bilog" },
        { gender: "Female", type: "Bitter Gourd", variety: "Bilog" },
        { gender: "Female", type: "Bottle Gourd", variety: "Smooth" },
        { gender: "Male", type: "Bottle Gourd", variety: "Smooth" },
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

    const applyAugmentation = async (imageUri) => {
        try {
            console.log("Image URI:", imageUri);
            console.log("Type of Image URI:", typeof imageUri);

            // Example: Rotate the image by 90 degrees
            const rotatedImage = await ImageEditor.cropImage(imageUri, {
                offset: { x: 0, y: 0 },
                size: { width: 224, height: 224 },
                displaySize: { width: 224, height: 224 },
                resizeMode: 'contain',
                rotation: 90,
            });

            const rotatedImageUri = rotatedImage.uri;
            console.log("Rotated Image URI:", rotatedImageUri);
            console.log("Type of Rotated Image URI:", typeof rotatedImageUri);

            // Example: Flip the image horizontally
            const flippedImage = await ImageEditor.cropImage(rotatedImageUri, {
                offset: { x: 0, y: 0 },
                size: { width: 224, height: 224 },
                displaySize: { width: 224, height: 224 },
                resizeMode: 'contain',
                flip: { horizontal: true, vertical: false },
            });

            const flippedImageUri = flippedImage.uri;
            console.log("Flipped Image URI:", flippedImageUri);
            console.log("Type of Flipped Image URI:", typeof flippedImageUri);

            return flippedImageUri;
        } catch (error) {
            console.error("Error applying augmentation:", error);
            return imageUri;
        }
    };

    const preprocessImage = async (imageUri) => {
        try {
            const augmentedImageUri = await applyAugmentation(imageUri);

            const resizedImage = await ImageResizer.createResizedImage(
                augmentedImageUri,
                224, // Model expects 224x224 input
                224,
                "JPEG",
                100
            );

            const imgBuffer = await FileSystem.readAsStringAsync(resizedImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const imageTensor = new Uint8Array(atob(imgBuffer).split("").map(c => c.charCodeAt(0)));
            const { width, height, data } = jpeg.decode(imageTensor, { useTArray: true });

            const rgbData = [];
            for (let i = 0; i < data.length; i += 4) {
                rgbData.push(data[i]);      // Red
                rgbData.push(data[i + 1]);  // Green
                rgbData.push(data[i + 2]);  // Blue
            }

            const floatArray = new Float32Array(rgbData.length);
            for (let i = 0; i < rgbData.length; i++) {
                floatArray[i] = rgbData[i] / 255; // Normalize pixel values
            }

            console.log("Preprocessed image size:", floatArray.length);
            return floatArray;
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

    // Define the actual labels based on your classes in Teachable Machine
    const actualLabels = [
        "Sponge Gourd, Male, Smooth",  // 0
        "Sponge Gourd, Female, Smooth", // 1
        "Bitter Gourd, Male , Bilog",    // 2
        "Bitter Gourd, Female, Bilog",  // 3
        "Bottle gourd, Female, Smooth", // 4
        "Bottle, Male, Smooth"   // 5
    ];

    // Implement the getActualLabel function
    const getActualLabel = (index) => {
        return actualLabels[index] || null;
    };

    const handleIdentify = async () => {
        setShowToast(true);
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
            console.log("Preprocessing image...");
            const tensorInput = await preprocessImage(image);

            if (!tensorInput) {
                Alert.alert("Error", "Failed to process image.");
                return;
            }

            // Reshape the tensor input to match the model's expected input shape
            const reshapedTensor = new Float32Array(1 * 224 * 224 * 3);
            reshapedTensor.set(tensorInput, 0); // Ensure it's correctly structured

            console.log("Input tensor shape:", reshapedTensor.length);

            console.log("Running model inference...");
            const result = actualModel.runSync([reshapedTensor]);

            if (result && result.length > 0) {
                console.log("Raw Model Output Probabilities:", result[0]);

                const probabilities = softmax(result[0]);
                console.log("Normalized Probabilities:", probabilities);

                if (!probabilities || probabilities.length === 0) {
                    Alert.alert("Error", "Model did not return a valid result.");
                    return;
                }

                const maxProbability = Math.max(...probabilities);
                const maxIndex = probabilities.findIndex(p => p === maxProbability);

                if (maxIndex === -1 || maxIndex >= actualLabels.length) {
                    Alert.alert("Error", "Unexpected model output.");
                    return;
                }

                console.log("Max index:", maxIndex, "Probability:", maxProbability);

                // Update state based on inference
                const label = actualLabels[maxIndex];
                setGender(labels[maxIndex].gender);
                setGourdType(labels[maxIndex].type);
                setVariety(labels[maxIndex].variety);

                // Log the selected label
                console.log("Selected Label:", label);

                // Calculate and display accuracy if you have a labeled dataset
                const actualLabel = getActualLabel(maxIndex);
                if (actualLabel) {
                    const isCorrect = actualLabel === label;
                    console.log("Prediction Correct:", isCorrect);
                    const accuracy = isCorrect ? 1 : 0;
                    console.log("Accuracy:", accuracy);
                } else {
                    console.log("Actual label not found for the image.");
                }
            } else {
                Alert.alert("Inference Error", "Could not classify image.");
            }
        } catch (error) {
            console.error("Error during identification:", error);
            Alert.alert("Error", "Failed to process the image.");
        } finally {
            setLoading(false);
            setShowToast(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setGender("");
        setGourdType("");
        setVariety("");
    };

    return (
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E0F8E6", padding: 20 },
    imageContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
    imageWrapper: { width: 150, height: 150, backgroundColor: "#D0E8D8", borderRadius: 10, justifyContent: "center", alignItems: "center", marginHorizontal: 10 },
    image: { width: "100%", height: "100%", borderRadius: 10 },
    placeholderText: { color: "#666", textAlign: "center" },
    removeButton: { position: "absolute", top: 5, right: 5, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 15, width: 25, height: 25, justifyContent: "center", alignItems: "center" },
    removeText: { color: "white", fontWeight: "bold" },
    identifyButton: { backgroundColor: "#4CAF50", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
    identifyText: { color: "white", fontWeight: "bold", fontSize: 16 },
    resetButton: { backgroundColor: "#FF6347", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
    resetText: { color: "white", fontWeight: "bold", fontSize: 16 },
    resultContainer: { marginTop: 20 },
    resultRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    resultLabel: { fontSize: 16, fontWeight: "bold", color: "#333333", marginRight: 10 },
    resultBox: { flex: 1, backgroundColor: "#FFFFFF", borderColor: "#CCCCCC", borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16, color: "#333333" },
});

export default GourdIdentify;