import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';

// Avatar placeholder
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=8e44ad&color=fff&name=User';

// Helper function for formatting chat timestamps
function formatChatTimestamp(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const msgDate = new Date(dateString);

  const nowDay = now.getDate();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  const msgDay = msgDate.getDate();
  const msgMonth = msgDate.getMonth();
  const msgYear = msgDate.getFullYear();

  // If same year, month, and day: show time
  if (nowYear === msgYear && nowMonth === msgMonth && nowDay === msgDay) {
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Check for 'Yesterday'
  const yesterday = new Date(now);
  yesterday.setDate(nowDay - 1);
  if (
    msgYear === yesterday.getFullYear() &&
    msgMonth === yesterday.getMonth() &&
    msgDay === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  // Check if this week (but not today/yesterday)
  // Get Sunday as first day of week
  const weekStart = new Date(now);
  weekStart.setDate(nowDay - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  if (
    msgDate > weekStart &&
    !(nowYear === msgYear && nowMonth === msgMonth && nowDay === msgDay) &&
    !(
      msgYear === yesterday.getFullYear() &&
      msgMonth === yesterday.getMonth() &&
      msgDay === yesterday.getDate()
    )
  ) {
    // e.g., Monday, Tuesday, etc.
    return msgDate.toLocaleDateString([], { weekday: 'long' });
  }

  // Else: show Month Day, e.g., May 15
  return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const ChatScreen = ({ navigation }) => {
  const context = useContext(AuthGlobal);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [searchText, setSearchText] = useState('');

  const currentUserId = context.stateUser?.user?.userId;

  // Fetch users and chats
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) throw new Error('No token found');
      setToken(storedToken);

      const [usersResponse, chatsResponse] = await Promise.all([
        fetch(`${baseURL}users`, { headers: { Authorization: `Bearer ${storedToken}` } }),
        fetch(`${baseURL}chat/chats`, { headers: { Authorization: `Bearer ${storedToken}` } }),
      ]);

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      if (!chatsResponse.ok) throw new Error('Failed to fetch chats');

      const usersData = await usersResponse.json();
      setUsers(usersData);
      setFilteredUsers(usersData);

      const chatsData = await chatsResponse.json();
      setChats(consolidateChats(chatsData.chats || []));
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Consolidate chats by user
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

  // Search/filter users
  const handleSearchChange = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = text.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) => u.name && u.name.toLowerCase().includes(query)
        )
      );
    }
  };

  // Navigation handlers
  const handleUserClick = (userId, userName) =>
    navigation.navigate('UserChatScreen', { userId, name: userName });
  const handleChatClick = (chatId, userId, userName) =>
    navigation.navigate('UserChatScreen', { chatId, userId, name: userName });

  // Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // UI Components
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleUserClick(item._id, item.name)}
      style={styles.userCard}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.image || AVATAR_PLACEHOLDER }}
          style={styles.userAvatar}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChatClick(item._id, item.otherUser._id, item.otherUser.name)}
      style={[
        styles.chatCard,
        !item.lastMessageIsRead && styles.unreadChatCard,
      ]}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.otherUser.image || AVATAR_PLACEHOLDER }}
        style={styles.chatAvatar}
      />
      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatUser} numberOfLines={1}>{item.otherUser.name}</Text>
          <Text style={styles.chatTimestamp}>
            {item.lastMessageTimestamp
              ? formatChatTimestamp(item.lastMessageTimestamp)
              : ''}
          </Text>
        </View>
        <Text
          style={[
            styles.chatMessage,
            !item.lastMessageIsRead && styles.chatMessageUnread
          ]}
          numberOfLines={1}
        >
          {item.lastMessage || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchText}
        onChangeText={handleSearchChange}
        placeholderTextColor="#b2bec3"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#388E3C" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id || item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.userList}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
          <View style={{ marginVertical: 12 }} />
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => `${item._id}-${item.otherUser._id}`}
            contentContainerStyle={chats.length === 0 && { flex: 1, justifyContent: 'center' }}
            ListEmptyComponent={
              <Text style={styles.emptyChatsText}>No recent chats. Start a conversation!</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8e44ad" />
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // light green
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#73946B', // dark green
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  searchInput: {
    height: 44,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderColor: '#73946B', // light green border
    borderWidth: 1,
    paddingLeft: 18,
    fontSize: 15,
    shadowColor: '#73946B', // green shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userList: {
    minHeight: 95,
    paddingLeft: 10,
  },
  userCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 75,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  userAvatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#73946B', // green border
    backgroundColor: '#73946B', // light green
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#2ecc71', // accent green
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222831', // dark green
    textAlign: 'center',
    maxWidth: 70,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 13,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadChatCard: {
    backgroundColor: '#C8E6C9', // light green for unread
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 11,
    borderWidth: 2,
    borderColor: '#73946B', // green border
    backgroundColor: '#73946B', // light green
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#537D5D', // dark green
    flex: 1,
    marginRight: 8,
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#222831', // medium green
    minWidth: 52,
    textAlign: 'right',
  },
  chatMessage: {
    fontSize: 14,
    color: '#222831', // dark green
    marginTop: 3,
  },
  chatMessageUnread: {
    fontWeight: 'bold',
    color: '#73946B', // primary green
  },
  emptyChatsText: {
    color: '#9EBC8A', // medium green
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 32,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatScreen;