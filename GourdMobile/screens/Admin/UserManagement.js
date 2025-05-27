import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Pressable, Animated, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from "../../assets/common/baseurl";
import Icon from 'react-native-vector-icons/MaterialIcons';

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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMsg, setToastMsg] = useState("");

  const [archiveId, setArchiveId] = useState(null);

  const showToastify = (type, message) => {
    setToastType(type);
    setToastMsg(message);
    setShowToast(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Get current user id from AsyncStorage
      let id = null;
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const userObj = JSON.parse(userJson);
          id = userObj._id || userObj.id;
        }
      } catch (err) {}
      setCurrentUserId(id);

      try {
        const storedToken = await AsyncStorage.getItem('jwt');
        const response = await axios.get(`${baseURL}users/`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUsers(response.data);
      } catch (error) {
        showToastify("error", "Error fetching users");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Archive user (archive + delete)
  const handleArchiveUser = (userId) => {
    setArchiveId(userId);
  };

  const confirmArchive = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      const userToArchive = users.find((u) => u._id === archiveId);
      if (!userToArchive) {
        showToastify("error", "User not found");
        setArchiveId(null);
        return;
      }
      // 1. Archive the user
      await axios.post(`${baseURL}users/archive`, userToArchive, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        }
      });
      // 2. Delete the user from active users
      await axios.delete(`${baseURL}users/${archiveId}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setUsers(users => users.filter(u => u._id !== archiveId));
      showToastify("success", "User archived!");
    } catch (error) {
      showToastify("error", "Failed to archive or delete user");
    }
    setArchiveId(null);
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      await axios.patch(`${baseURL}users/${userId}/role`, {
        isAdmin: !isAdmin
      }, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        }
      });
      setUsers(users => users.map(u => u._id === userId ? { ...u, isAdmin: !isAdmin } : u));
      showToastify("success", "User admin status updated!");
    } catch (error) {
      showToastify("error", "Error updating admin status");
    }
  };

  const shownUsers = currentUserId ? users.filter(u => u._id !== currentUserId) : users;

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, item.isAdmin ? styles.revokeButton : styles.makeAdminButton]}
          onPress={() => handleToggleAdmin(item._id, item.isAdmin)}
        >
          <Text style={styles.buttonText}>{item.isAdmin ? 'Revoke Admin' : 'Make Admin'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleArchiveUser(item._id)}
        >
          <Text style={styles.buttonText}>Archive User</Text>
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
        <Text style={styles.header}>User Management</Text>
        <FlatList
          data={shownUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No users found.</Text>
          }
        />
        {/* Archive Confirmation Modal */}
        <Modal
          visible={!!archiveId}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setArchiveId(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setArchiveId(null)}>
            <Pressable style={styles.deleteModalContainer}>
              <Icon name="archive" size={36} color="#F44336" style={{ alignSelf: "center", marginBottom: 12 }} />
              <Text style={styles.deleteModalTitle}>Archive User</Text>
              <Text style={styles.deleteModalText}>Are you sure you want to archive this user?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setArchiveId(null)}
                >
                  <Text style={[styles.modalButtonText, { color: '#F44336' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmModalButton]}
                  onPress={confirmArchive}
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  makeAdminButton: {
    backgroundColor: '#4CAF50',
  },
  revokeButton: {
    backgroundColor: '#FFC107',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 40, 40, 0.42)',
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
    color: "#F44336",
    marginBottom: 6,
    textAlign: "center"
  },
  deleteModalText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 20
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
    borderColor: '#F44336',
  },
  confirmModalButton: {
    backgroundColor: '#F44336',
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
    backgroundColor: "#F44336",
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

export default UserManagement;