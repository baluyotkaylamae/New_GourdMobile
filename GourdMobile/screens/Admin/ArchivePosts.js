import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Button, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from "../../assets/common/baseurl";
import Swiper from 'react-native-swiper';

const ArchivedPost = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      const response = await axios.get(`${baseURL}posts/archive`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);


  // const handleDeletePost = async (postId) => {
  //   Alert.alert(
  //     "Delete Post",
  //     "Are you sure you want to delete this post?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Delete",
  //         style: "destructive",
  //         onPress: async () => {
  //           try {
  //             const storedToken = await AsyncStorage.getItem("jwt");
  //             await axios.delete(`${baseURL}posts/${postId}`, {
  //               headers: { Authorization: `Bearer ${storedToken}` },
  //             });
  //             fetchPosts(); // Refresh post list
  //           } catch (error) {
  //             console.error('Error deleting post:', error);
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };


  const handleDeletePost = async (postId) => {
    const postToArchive = posts.find((post) => post._id === postId);
    if (!postToArchive) return;

    Alert.alert(
      "Restore Post",
      "Are you sure you want to restore this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              const storedToken = await AsyncStorage.getItem("jwt");
              // 1. Archive the post
              await axios.post(
                `${baseURL}posts/`,
                postToArchive,
                { headers: { Authorization: `Bearer ${storedToken}` } }
              );
              // 2. Delete the post
              await axios.delete(
                `${baseURL}posts/archive/${postId}`,
                { headers: { Authorization: `Bearer ${storedToken}` } }
              );
              fetchPosts(); // Refresh post list
            } catch (error) {
              console.error('Error archiving or deleting post:', error);
            }
          },
        },
      ]
    );
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postDetail}>Author: {item.user?.name}</Text>
      <Text style={styles.postDetail}>Content: {item.content}</Text>
      <Text style={styles.postDetail}>Status: {item.status}</Text>

      {item.images && item.images.length > 0 && (
        <View style={{ flex: 1 }}>
          <Swiper style={{ height: 200 }} autoplay autoplayTimeout={10}>
            {item.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.image} />
            ))}
          </Swiper>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleDeletePost(item._id)}
        >
          <Text style={styles.deleteButtonText}>Retrive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    loading ? <ActivityIndicator size="large" color="#FF6347" style={styles.loadingIndicator} /> :
      <View style={styles.container}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10, alignSelf: 'center' }}>
            Archive post
        </Text>
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item._id}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f7f7f7' },
  postCard: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  postDetail: { fontSize: 14, marginVertical: 3, color: '#666' },
  image: { width: '100%', height: 200, borderRadius: 8, marginTop: 10, resizeMode: 'cover' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  updateButton: {
    paddingVertical: 10,
    backgroundColor: '#28A745',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  updateButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    paddingVertical: 10,
    backgroundColor: '#FF6347',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  picker: { height: 50, width: '100%', color: '#333' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
});

export default ArchivedPost;
