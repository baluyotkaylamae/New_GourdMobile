import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';

const ChatScreen = ({ navigation }) => {
  const context = useContext(AuthGlobal);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [triggerRefresh, setTriggerRefresh] = useState(false);  // Add triggerRefresh state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchText, setSearchText] = useState('');  // State for search text

  const currentUserId = context.stateUser?.user?.userId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedToken = await AsyncStorage.getItem('jwt');
        if (!storedToken) throw new Error('No token found');
        setToken(storedToken);

        const usersResponse = await fetch(`${baseURL}users`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData);
        setFilteredUsers(usersData); // Set the users initially

        const chatsResponse = await fetch(`${baseURL}chat/chats`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!chatsResponse.ok) throw new Error('Failed to fetch chats');
        const chatsData = await chatsResponse.json();
        setChats(consolidateChats(chatsData.chats || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId, triggerRefresh]);  // Depend on triggerRefresh to refresh data

  const consolidateChats = (chatsList) => {
    const chatPairMap = new Map();
    chatsList.forEach((chat) => {
      if (!chat.sender || !chat.user) return;
      if (chat.sender._id !== currentUserId && chat.user._id !== currentUserId) return;

      const otherUser = chat.sender._id === currentUserId ? chat.user : chat.sender;
      const chatPairKey = otherUser._id;

      if (!chatPairMap.has(chatPairKey)) {
        chatPairMap.set(chatPairKey, { ...chat, otherUser });
      } else {
        const existingChat = chatPairMap.get(chatPairKey);
        if (new Date(chat.lastMessageTimestamp) > new Date(existingChat.lastMessageTimestamp)) {
          chatPairMap.set(chatPairKey, { ...chat, otherUser });
        }
      }
    });

    return Array.from(chatPairMap.values()).sort(
      (a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp)
    );
  };

  const handleUserClick = (userId, userName) => navigation.navigate('UserChatScreen', { userId, name: userName });
  const handleChatClick = (chatId, userId, userName) => navigation.navigate('UserChatScreen', { chatId, userId, name: userName });

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserClick(item._id, item.name)} style={styles.userCard}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/50' }}
          style={styles.userAvatar}
        />
        {item.isOnline && <View style={styles.onlineIndicator}></View>}
      </View>
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChatClick(item._id, item.otherUser._id, item.otherUser.name)}
      style={[
        styles.chatCard,
        item.lastMessageIsRead === false && styles.unreadChatCard,  // Apply highlight if message is unread
      ]}
    >
      <Image
        source={{ uri: item.otherUser.image || 'https://via.placeholder.com/50' }}
        style={styles.chatAvatar}
      />
      <View style={styles.chatContent}>
        <Text style={styles.chatUser}>{item.otherUser.name}</Text>
        <Text style={styles.chatMessage}>{item.lastMessage}</Text>
        <Text style={styles.chatTimestamp}>
          {new Date(item.lastMessageTimestamp).toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Trigger refresh whenever the data is required to be refreshed
  const handleRefresh = () => {
    setTriggerRefresh((prev) => !prev);  // Toggle refresh state
  };

  // Handle search text change and filter users
  const handleSearchChange = (text) => {
    setSearchText(text);
  
    if (text === '') {
      setFilteredUsers(users); // Show all users if search text is empty
    } else {
      const filtered = users.filter((user) => {
        // Check if the characters in searchText appear anywhere in the user name
        const userName = user.name.toLowerCase();
        const searchQuery = text.toLowerCase();
        return searchQuery.split('').every(char => userName.includes(char));
      });
      setFilteredUsers(filtered); // Show filtered users based on name
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Chats</Text> */}

      {/* Search Box */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search for users..."
        value={searchText}
        onChangeText={handleSearchChange} // Trigger filtering
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0078d4" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {/* User List with Search Functionality */}
          <FlatList
            data={filteredUsers} // Use filtered users for display
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id || item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            refreshing={loading}
            onRefresh={handleRefresh}
          />

          {/* Spacer */}
          <View style={{ marginVertical: 10 }} />

          {/* Chats List */}
          <FlatList
            data={chats} // Use chats data here
            renderItem={renderChatItem}
            keyExtractor={(item) => `${item.chatId}-${item.otherUser._id}`}
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background for a clean look
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50', // Darker text for better contrast
    textAlign: 'center',
  },
  searchInput: {
    height: 45,
    borderColor: '#dcdde1',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#ffffff', // White background for input
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  userCard: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3498db', // Blue border for a modern touch
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    textAlign: 'center',
    marginTop: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ecc71', // Green for online status
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  unreadChatCard: {
    backgroundColor: '#eafaf1', // Light green for unread messages
  },
  chatAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#8e44ad', // Purple border for a modern look
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chatMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    fontStyle: 'italic', // Italic for message preview
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
    textAlign: 'right',
  },
  errorText: {
    color: '#e74c3c', // Red for error messages
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
