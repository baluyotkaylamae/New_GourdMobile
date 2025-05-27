import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, TextInput } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
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

const EditPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const { postId } = route.params;

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) throw new Error("No token found in AsyncStorage");

        const response = await axios.get(`${baseURL}posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const postData = response.data;
        setTitle(postData.title);
        setContent(postData.content);
        setSelectedCategory(postData.category._id);
        setImages(postData.images || []);
      } catch (error) {
        setError('Error fetching post details.');
      }
    };

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
      } catch (error) { }
    };

    fetchPostDetails();
    fetchCategories();
  }, [postId]);

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
      setImages(result.assets.map(asset => asset.uri));
    }
  };

  const updatePost = async () => {
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

      const res = await axios.put(`${baseURL}posts/${postId}`, formData, config);
      if (res.status === 200) {
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "Post Updated Successfully",
          text2: "Your post has been updated.",
        });

        setTitle('');
        setContent('');
        setSelectedCategory(null);
        setImages([]);
        setTimeout(() => {
          navigation.navigate("Home");
        }, 500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong');
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Error Updating Post",
        text2: error.response?.data?.message || "Please try again",
      });
    }
  };

  // Renders images in a grid row just like in CreatePost, with remove button
  const renderImageGrid = () => (
    images.length > 0 && (
      <View style={styles.selectedImagesRow}>
        {images.map((uri, index) => (
          <View key={index} style={styles.selectedImageWrapper}>
            <Image style={styles.selectedImage} source={{ uri }} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImages(images.filter((_, i) => i !== index))}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )
  );

  return (
    <FlatList
      data={[{}]}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={() => (
        <View style={styles.screenWrapper}>
          <View style={styles.createPostCard}>
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
            {renderImageGrid()}
            {error ? <Error message={error} /> : null}
            <TouchableOpacity
              style={styles.createButton}
              onPress={updatePost}
            >
              <Text style={styles.createButtonText}>Update Post</Text>
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
  selectedImageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginTop: 8,
  },
  selectedImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
    backgroundColor: "#A4B465",
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(31,111,120,0.93)",
    borderRadius: 10,
    zIndex: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  removeImageText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 18,
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

export default EditPost;