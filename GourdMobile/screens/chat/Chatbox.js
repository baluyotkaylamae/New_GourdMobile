import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import baseURL from '../../assets/common/baseurl';
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/FontAwesome';
import { filterBadWords } from '../filteredwords';
import { socket } from '../../socket/index';

const Chatbox = ({ route }) => {
  const { userId: receiverId } = route.params;
  const context = useContext(AuthGlobal);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const handleLongPress = (messageId, senderId) => {
    // Only allow delete if the message was sent by the current user
    if (senderId === context.stateUser?.user?.userId) {
      setSelectedMessageId(messageId);
      setModalVisible(true);
    }
  };

  const confirmDeleteMessage = () => {
    deleteMessage(selectedMessageId);
    setModalVisible(false);
    setSelectedMessageId(null);
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Handle both string and Date objects
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Just now';
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      // Return relative time for recent messages
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

      // For older messages, show date/time
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return '';
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      const senderId = context.stateUser?.user?.userId;

      if (!senderId || !storedToken) throw new Error('Authentication failed');

      const response = await axios.get(
        `${baseURL}chat/messages/${senderId}/${receiverId}`,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      // Sort messages by date (oldest first)
      const sortedMessages = (response.data.messages || [])
        .map(message => ({
          ...message,
          message: filterBadWords(message.message),
          createdAt: message.createdAt || new Date()
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(sortedMessages);
      await markMessagesAsRead(sortedMessages);

    } catch (err) {
      if (err.response?.status === 404) {
        setMessages([]);
      } else {
        setError(err.message || 'Failed to load messages');
      }
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [receiverId, context.stateUser]);

  const markMessagesAsRead = async (messages) => {
    const storedToken = await AsyncStorage.getItem('jwt');
    const senderId = context.stateUser?.user?.userId;

    if (!storedToken || !senderId) return;

    try {
      await axios.put(
        `${baseURL}chat/messages/read`,
        { messages: messages.map(msg => msg._id) },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setMessages(prevMessages =>
        prevMessages.map(msg => ({ ...msg, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking messages as read:', err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const storedToken = AsyncStorage.getItem('jwt');

      socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      socket.emit('joinRoom', { userId: context.stateUser?.user?.userId, receiverId });

      socket.on('message', (message) => {
        setMessages(prev => {
          const newMessages = [...prev, {
            ...message,
            message: filterBadWords(message.message),
            createdAt: message.createdAt || new Date()
          }];
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          return newMessages;
        });
      });

      return () => {
        socket.disconnect();
      };
    }, [receiverId])
  );

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const filteredMessage = filterBadWords(newMessage.trim());
    if (filteredMessage !== newMessage.trim()) {
      Alert.alert('Warning', 'Your message contains inappropriate content');
      return;
    }

    const tempMessage = {
      _id: new Date().getTime().toString(),
      sender: { _id: context.stateUser?.user?.userId },
      message: filteredMessage,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      const senderId = context.stateUser?.user?.userId;

      if (!storedToken || !senderId) throw new Error('Authentication failed');

      const messageData = {
        sender: senderId,
        user: receiverId,
        message: filteredMessage,
      };

      const response = await axios.post(
        `${baseURL}chat/messages`,
        messageData,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      socket.emit('sendMessage', {
        ...response.data.chat,
        userId: response.data.chat.user,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error sending message:', err.message);
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages(prev => {
        const newMessages = [...prev, {
          ...message,
          message: filterBadWords(message.message),
          createdAt: message.createdAt || new Date()
        }];
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        return newMessages;
      });
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const deleteMessage = async (messageId) => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt');

      if (!storedToken) throw new Error('Authentication failed');

      const response = await axios.delete(`${baseURL}chat/${messageId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (response.data.success) {
        setMessages(prev => prev.filter(chat => chat._id !== messageId));
      }
    } catch (err) {
      console.error('Error deleting message:', err.message);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender?._id === context.stateUser?.user?.userId;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item._id, item.sender?._id)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.messageWrapper,
          isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper,
        ]}>
          {!isMyMessage && (
            <Image
              source={{ uri: item.sender?.image || 'https://via.placeholder.com/50' }}
              style={styles.userAvatar}
            />
          )}
          <View style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}>
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestampText}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchMessages} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id?.toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: newMessage.trim() ? '#4CAF50' : '#CCCCCC' }
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Icon name="paper-plane" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Message</Text>
            <Text style={styles.modalText}>Are you sure you want to delete this message?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDeleteMessage}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageContainer: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  timestampText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#EEEEEE',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Chatbox;