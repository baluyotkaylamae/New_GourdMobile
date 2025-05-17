import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import Error from "../../Shared/Error";
import axios from "axios";
import baseURL from "../../assets/common/baseurl";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) throw new Error("No token found in AsyncStorage");

        const response = await axios.get(`${baseURL}category`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedCategories = response.data.map((category) => ({
          label: category.name,
          value: category._id,
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert("Permission to access camera roll is required!");
      }
    };

    requestPermission();
    fetchCategories();
  }, []);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setImages(selectedImages);
    }
  };

  const createPost = async () => {
    if (!title || !content || !selectedCategory) {
      setError("Please fill in all fields.");
      return;
    }

    let formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", selectedCategory);

    images.forEach((imageUri) => {
      const newImageUri = `file:///${imageUri.split("file:/").join("")}`;
      formData.append("images", {
        uri: newImageUri,
        type: mime.getType(newImageUri) || 'image/jpeg',
        name: newImageUri.split("/").pop(),
      });
    });

    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) throw new Error("No token found in AsyncStorage");

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post(`${baseURL}posts`, formData, config);
      if (res.status === 201) {
        Alert.alert(
          "Submitting Post",
          "Your post is being submitted. Wait for the approval of the admin.",
          [{ text: "OK" }]
        );

        setTitle('');
        setContent('');
        setSelectedCategory(null);
        setImages([]);
        setTimeout(() => {
          navigation.navigate("Home");
        }, 500);
      }
    } catch (error) {
      console.error('Error creating post:', error.message);
      setError(error.response?.data?.message || 'Something went wrong');
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Error Creating Post",
        text2: error.response?.data?.message || "Please try again",
      });
    }
  };

  // Render the form as a FlatList (solution 3)
  return (
    <FlatList
      data={[{}]}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={() => (
        <View style={styles.screenWrapper}>
          <View style={styles.createPostCard}>
            {/* Title as a single-line styled TextInput */}
            <Text style={styles.label}>Title</Text>
            <View style={styles.pseudoRichBoxTitle}>
              <TextInput
                placeholder="Enter the title"
                value={title}
                onChangeText={setTitle}
                style={styles.richInputTitle}
                maxLength={100}
                numberOfLines={1}
                textAlignVertical="center"
                multiline={false}
                returnKeyType="done"
              />
            </View>
            {/* "Rich" text box for content (multi-line) */}
            <Text style={styles.label}>Content</Text>
            <View style={styles.pseudoRichBox}>
              <TextInput
                placeholder="Write your content here..."
                multiline
                numberOfLines={8}
                onChangeText={setContent}
                value={content}
                style={styles.richInput}
                textAlignVertical="top"
              />
            </View>
            <DropDownPicker
              open={open}
              value={selectedCategory}
              items={categories}
              setOpen={setOpen}
              setValue={setSelectedCategory}
              setItems={setCategories}
              placeholder="Select a Category"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
              <MaterialIcons name="add-photo-alternate" size={24} color="#A4B465" />
              <Text style={styles.imagePickerText}>
                {images.length > 0 ? "Change Images" : "Select Images"}
              </Text>
            </TouchableOpacity>
            {images.length > 0 && (
              <View style={styles.selectedImagesRow}>
                {images.map((uri, index) => (
                  <Image key={index} style={styles.selectedImage} source={{ uri }} />
                ))}
              </View>
            )}

            {error ? <Error message={error} /> : null}

            <TouchableOpacity
              style={styles.createButton}
              onPress={createPost}
            >
              <Text style={styles.createButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={styles.flatListContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
    minHeight: '100%',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: "#E0F8E6",
    minHeight: '100%',
  },
  createPostCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 22,
    justifyContent: 'flex-start',
  },
  label: {
    marginBottom: 8,
    marginTop: 2,
    fontWeight: '600',
    color: '#A4B465',
    fontSize: 16,
  },
  pseudoRichBoxTitle: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    minHeight: 46,
    marginBottom: 18,
    padding: 6,
    justifyContent: 'center',
  },
  richInputTitle: {
    fontSize: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "#222",
    paddingVertical: 0,
    paddingHorizontal: 2,
    minHeight: 32,
    maxHeight: 38,
  },
  pseudoRichBox: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    minHeight: 120,
    marginBottom: 18,
    padding: 6,
  },
  richInput: {
    minHeight: 110,
    fontSize: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
    textAlignVertical: 'top',
    color: "#222",
  },
  dropdown: {
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#F6F6F6",
    borderColor: '#A4B465',
    minHeight: 45,
  },
  dropdownContainer: {
    borderColor: '#A4B465',
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A4B465',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f2fbf6",
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  imagePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#A4B465",
    fontWeight: "600",
  },
  selectedImagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    marginTop: 4,
  },
  selectedImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
    backgroundColor: "#A4B465"
  },
  createButton: {
    backgroundColor: "#A4B465",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1.2,
  },
});

export default CreatePost;