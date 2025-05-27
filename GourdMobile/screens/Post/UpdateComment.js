import React, { useState, useEffect, useRef } from 'react';
import baseURL from "../../assets/common/baseurl";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Toast component for feedback
const Toast = ({ visible, type, message, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => onHide());
      }, 1700);
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

const UpdateComment = ({ route, navigation }) => {
  const { postId, commentId, currentContent } = route.params;

  const [updatedContent, setUpdatedContent] = useState(currentContent);
  const [loading, setLoading] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastMsg, setToastMsg] = useState("");

  const showToastify = (type, message, callback) => {
    setToastType(type);
    setToastMsg(message);
    setShowToast(true);
    if (callback) {
      setTimeout(callback, 1700);
    }
  };

  const handleSave = async () => {
    if (!postId || !commentId) {
      showToastify("error", "Post ID or Comment ID missing!");
      return;
    }
    if (!updatedContent.trim()) {
      showToastify("error", "Comment cannot be empty!");
      return;
    }

    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        showToastify("error", "You are not logged in");
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseURL}posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      const data = await response.json();

      if (response.ok) {
        showToastify("success", "Comment updated!", () => navigation.goBack());
      } else {
        showToastify("error", data.message || "Failed to update comment");
      }
    } catch (error) {
      showToastify("error", "Error updating comment");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f7f9fa" }}
    >
      <Toast
        visible={showToast}
        type={toastType}
        message={toastMsg}
        onHide={() => setShowToast(false)}
      />
      <View style={styles.container}>
        <Text style={styles.label}>Edit your comment</Text>
        <View style={styles.inputContainer}>
          <Icon name="mode-edit" color="#0ba5a4" size={22} style={{ marginRight: 7 }} />
          <TextInput
            style={styles.input}
            value={updatedContent}
            onChangeText={setUpdatedContent}
            multiline={true}
            placeholder="Update your comment..."
            placeholderTextColor="#aaa"
            editable={!loading}
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!updatedContent.trim() || loading) && { backgroundColor: '#aaa' }
          ]}
          onPress={handleSave}
          disabled={!updatedContent.trim() || loading}
        >
          {loading ? (
            <Icon name="hourglass-empty" size={20} color="#fff" />
          ) : (
            <Icon name="save" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 26,
    justifyContent: 'center',
  },
  label: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1d3938',
    marginBottom: 13,
    textAlign: "center",
    letterSpacing: 0.2
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderColor: "#0ba5a470",
    borderWidth: 1.3,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 19,
    minHeight: 85,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    minHeight: 60,
    color: "#222",
    paddingTop: 2,
    textAlignVertical: 'top',
    fontWeight: "500",
    backgroundColor: "transparent",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0BA5A4",
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 6,
    gap: 7,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.1,
  },
  toast: {
    position: 'absolute',
    top: 42,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 11,
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
});

export default UpdateComment;