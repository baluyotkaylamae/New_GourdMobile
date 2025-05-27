import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Image, Pressable, Animated, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from "../../assets/common/baseurl";
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STATUSES = [
  { label: "Pending", value: "Pending", color: "#f9ab00" },
  { label: "Approved", value: "Approved", color: "#28A745" },
  { label: "Rejected", value: "Rejected", color: "#f44336" }
];

// Toast Component
const Toast = ({ visible, type, message, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onHide());
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={[
      styles.toast,
      type === "success" ? styles.toastSuccess : styles.toastError,
      { opacity: fadeAnim }
    ]}>
      <Icon
        name={type === "success" ? "check-circle" : "error"}
        size={18}
        color="#fff"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const AdminPostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postStatus, setPostStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMsg, setToastMsg] = useState("");

  const [deleteId, setDeleteId] = useState(null);

  const showToastify = (type, message) => {
    setToastType(type);
    setToastMsg(message);
    setShowToast(true);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      const response = await axios.get(`${baseURL}posts`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setPosts(response.data);
    } catch (error) {
      showToastify("error", "Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (post) => {
    setSelectedPost(post);
    setPostStatus(post.status || 'Pending');
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (selectedPost && postStatus) {
      try {
        const storedToken = await AsyncStorage.getItem("jwt");
        await axios.put(
          `${baseURL}posts/status/${selectedPost._id}`,
          { status: postStatus },
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        fetchPosts();
        setModalVisible(false);
        showToastify("success", "Post status updated!");
      } catch (error) {
        showToastify("error", "Error updating post status");
      }
    }
  };

  // Archive then delete post
  const handleDeletePost = (postId) => {
    setDeleteId(postId);
  };

  const confirmDelete = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      const postToArchive = posts.find((post) => post._id === deleteId);
      if (postToArchive) {
        // 1. Archive the post
        await axios.post(
          `${baseURL}posts/archive`,
          postToArchive,
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );
      }
      // 2. Delete the post
      await axios.delete(`${baseURL}posts/${deleteId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      fetchPosts(); // Refresh post list
      showToastify("success", "Post archived and deleted!");
    } catch (error) {
      showToastify("error", "Error archiving or deleting post");
    }
    setDeleteId(null);
  };

  const renderRadioButton = (status, checked, onChange) => (
    <TouchableOpacity
      key={status.value}
      style={styles.radioRow}
      activeOpacity={0.8}
      onPress={() => onChange(status.value)}
    >
      <View style={[
        styles.radioCircle,
        { borderColor: status.color }
      ]}>
        {checked && <View style={[styles.radioDot, { backgroundColor: status.color }]} />}
      </View>
      <Text style={[styles.radioLabel, { color: status.color }]}>{status.label}</Text>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeaderRow}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Pending'
            ? styles.statusPending
            : item.status === 'Approved'
            ? styles.statusApproved
            : styles.statusRejected
        ]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.postDetail}>
        <Icon name="person" size={15} color="#888" /> {item.user?.name}
      </Text>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.images && item.images.length > 0 && (
        <View style={{ height: 210, marginTop: 10 }}>
          <Swiper
            style={styles.swiper}
            autoplay
            autoplayTimeout={8}
            dot={<View style={styles.swiperDot} />}
            activeDot={<View style={styles.swiperActiveDot} />}
          >
            {item.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.image} />
            ))}
          </Swiper>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {item.status === 'Pending' && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleOpenModal(item)}
          >
            <Icon name="edit" size={18} color="#fff" />
            <Text style={styles.updateButtonText}>Update Status</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePost(item._id)}
        >
          <Icon name="archive" size={18} color="#fff" />
          <Text style={styles.deleteButtonText}>Archive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Toast
        visible={showToast}
        type={toastType}
        message={toastMsg}
        onHide={() => setShowToast(false)}
      />
      {loading ? <ActivityIndicator size="large" color="#FF6347" style={styles.loadingIndicator} /> :
      <View style={styles.container}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 10, alignSelf: 'center' }}>
          Post Management
        </Text>
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 }}>
              No posts found.
            </Text>
          }
        />
        {/* Update Status Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Update Post Status</Text>
              <View style={styles.radioGroup}>
                {STATUSES.map((status) =>
                  renderRadioButton(status, postStatus === status.value, setPostStatus)
                )}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#FF6347' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    postStatus !== selectedPost?.status
                      ? styles.confirmModalButton
                      : { backgroundColor: '#aaa' }
                  ]}
                  onPress={handleUpdateStatus}
                  disabled={postStatus === selectedPost?.status}
                >
                  <Text style={styles.modalButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
        {/* Archive Confirmation Modal */}
        <Modal
          visible={!!deleteId}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeleteId(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setDeleteId(null)}>
            <Pressable style={styles.deleteModalContainer}>
              <Icon name="archive" size={36} color="#FF6347" style={{ alignSelf: "center", marginBottom: 12 }} />
              <Text style={styles.deleteModalTitle}>Archive Post</Text>
              <Text style={styles.deleteModalText}>Are you sure you want to archive this post?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setDeleteId(null)}
                >
                  <Text style={[styles.modalButtonText, { color: '#FF6347' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmModalButton]}
                  onPress={confirmDelete}
                >
                  <Text style={styles.modalButtonText}>Archive</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
      }
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f7f7f7' },
  postCard: {
    padding: 18,
    marginBottom: 17,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#3baea0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 7,
    borderWidth: 1,
    borderColor: '#e6eced',
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: '#1d3938', flex: 1 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 7,
    minWidth: 80,
    alignItems: 'center',
    marginLeft: 7,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusPending: { backgroundColor: '#f9ab00' },
  statusApproved: { backgroundColor: '#28A745' },
  statusRejected: { backgroundColor: '#f44336' },
  postDetail: { fontSize: 14, marginVertical: 3, color: '#888', marginBottom: 4 },
  postContent: {
    fontSize: 15,
    color: '#444',
    marginBottom: 9,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 0,
    resizeMode: 'cover',
    backgroundColor: '#e6eced'
  },
  swiper: {
    borderRadius: 10,
  },
  swiperDot: {
    backgroundColor: 'rgba(90,90,90,0.2)',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    margin: 3,
  },
  swiperActiveDot: {
    backgroundColor: '#3baea0',
    width: 11,
    height: 11,
    borderRadius: 5.5,
    margin: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#28A745',
    borderRadius: 8,
    marginRight: 5,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 7,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6347',
    borderRadius: 8,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 40, 40, 0.42)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 16,
    elevation: 12,
    shadowColor: "#3baea0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  deleteModalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 14,
    elevation: 15,
    shadowColor: "#c12a2a",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.23,
    shadowRadius: 18,
    alignItems: "center"
  },
  deleteModalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#ff6347",
    marginBottom: 6,
    textAlign: "center"
  },
  deleteModalText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 20
  },
  modalTitle: { fontSize: 19, fontWeight: 'bold', color: '#1d3938', marginBottom: 16, textAlign: "center" },
  radioGroup: {
    marginVertical: 12,
    gap: 10,
    paddingLeft: 70,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 14,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#eee',
  },
  cancelModalButton: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  confirmModalButton: {
    backgroundColor: '#28A745',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  toast: {
    position: 'absolute',
    top: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 26,
    paddingVertical: 13,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 999,
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  toastSuccess: {
    backgroundColor: "#28A745",
  },
  toastError: {
    backgroundColor: "#FF6347",
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
});

export default AdminPostManagement;