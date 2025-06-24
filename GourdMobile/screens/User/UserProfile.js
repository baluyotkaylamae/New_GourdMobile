import { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Image,
  TouchableOpacity, Alert, TextInput, Modal, TouchableWithoutFeedback, ScrollView, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Menu, Provider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const formatDateOrTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = diffMs / (1000 * 60 * 60);

  if (diffHrs > 24) {
    return date.toLocaleDateString();
  } else {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

const Profile = ({ navigation }) => {
  const context = useContext(AuthGlobal);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // For per-post menu (paper Menu)
  const [visibleMenuId, setVisibleMenuId] = useState(null);

  const currentUserId =
    context?.stateUser?.user?.userId ||
    context?.user?.userId ||
    context?.user?._id ||
    null;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedToken = await AsyncStorage.getItem('jwt');
      setToken(storedToken);
      const userId = context?.stateUser?.user?.userId;
      if (userId && storedToken) {
        try {
          const userProfileResponse = await fetch(`${baseURL}users/${userId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const userData = await userProfileResponse.json();
          setUserInfo(userData);
        } catch (error) {
          setUserInfo(null);
        }
      }
    };

    const fetchUserPosts = async () => {
      const storedToken = await AsyncStorage.getItem('jwt');
      try {
        const userId = context?.stateUser?.user?.userId;
        if (userId && storedToken) {
          const postsResponse = await fetch(`${baseURL}posts/user/${userId}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await postsResponse.json();
          setPosts(data.posts || data);
        }
      } catch (error) {
        setError('Error fetching posts');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
    fetchUserPosts();
  }, [refresh]);

  const triggerRefresh = () => setRefresh(prev => !prev);

  const handleLikePost = async (postId) => {
    try {
      const storedToken = token || await AsyncStorage.getItem('jwt');
      const response = await fetch(`${baseURL}posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? { ...post, likes: data.likes, likedBy: data.likedBy }
              : post
          )
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Could not like the post.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not like the post.');
    }
  };

  const handleAddComment = async (postId) => {
    if (!comment.trim()) return;
    try {
      const response = await fetch(`${baseURL}posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });
      if (response.ok) {
        setComment('');
        triggerRefresh();
      }
    } catch {
      Alert.alert('Error', 'Could not add comment.');
    }
  };

  const handleAddReply = async () => {
    if (!reply.trim()) return;
    try {
      const response = await fetch(`${baseURL}posts/${selectedPostId}/comments/${selectedCommentId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: reply }),
      });
      if (response.ok) {
        setReply('');
        setShowReplyModal(false);
        triggerRefresh();
      }
    } catch {
      Alert.alert('Error', 'Could not add reply.');
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      case 'Pending': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      setToken(storedToken);
      const userId = context?.stateUser?.user?.userId;
      if (userId && storedToken) {
        // Fetch user info
        const userProfileResponse = await fetch(`${baseURL}users/${userId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const userData = await userProfileResponse.json();
        setUserInfo(userData);

        // Fetch posts
        const postsResponse = await fetch(`${baseURL}posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await postsResponse.json();
        setPosts(data.posts || data);
      }
    } catch (error) {
      setError('Error refreshing data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleEditPost = (postId) => {
    setVisibleMenuId(null);
    navigation.navigate('UpdatePost', { postId });
  };

  const handleDeletePost = async (postId) => {
    setVisibleMenuId(null);
    try {
      const storedToken = token || await AsyncStorage.getItem('jwt');
      const response = await fetch(`${baseURL}posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        triggerRefresh();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Could not delete the post.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not delete the post.');
    }
  };

  const renderUserInfo = () => {
    if (!userInfo) {
      return <Text>Loading user info...</Text>;
    }
    const { _id } = userInfo.user;

    return (
      <View style={styles.userInfoCard}>
        {userInfo.user?.image ? (
          <Image source={{ uri: userInfo.user.image }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Icon name="user" size={48} color="#c1c7cd" />
          </View>
        )}
        <Text style={styles.userName}>{userInfo.user.name}</Text>
        <Text style={styles.userEmail}>{userInfo.user.email}</Text>
        {_id && (
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate("User Details", { userId: _id })}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderForumItem = ({ item }) => (
    <View style={styles.forumCard}>
      {/* HEADER: User, status, menu */}
      <View style={styles.postHeader}>
        <View style={styles.postUserRow}>
          {item.user?.image ? (
            <Image source={{ uri: item.user.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="user" size={19} color="#c1c7cd" />
            </View>
          )}
          <Text style={styles.postUser}>{item.user?.name || 'Unknown'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>
        {/* Paper Menu for edit/delete */}
        <Menu
          visible={visibleMenuId === item._id}
          onDismiss={() => setVisibleMenuId(null)}
          anchor={
            <TouchableOpacity
              onPress={() => setVisibleMenuId(visibleMenuId === item._id ? null : item._id)}
              style={styles.ellipsisIconContainer}
            >
              <Icon name="ellipsis-h" size={20} color="#7b8a97" />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={() => handleEditPost(item._id)} title="Edit" />
          <Menu.Item onPress={() => handleDeletePost(item._id)} title="Delete" titleStyle={{ color: "#e74c3c" }} />
        </Menu>
      </View>
      <Text style={styles.postDate}>{formatDateOrTime(item.createdAt)}</Text>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.images && item.images.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.postImage} />
      )}

      {/* Likes & Comments Row - COPY DESIGN FROM HomeScreen */}
      <View style={styles.likesCommentsContainer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLikePost(item._id)}
        >
          <Icon
            name="thumbs-up"
            size={16}
            color={
              item.likedBy && item.likedBy.includes(currentUserId)
                ? "#A4B465"
                : "#ccc"
            }
            style={styles.likeIcon}
          />
          <Text style={{ width: 6 }} />
          <Text style={styles.likesText}>
            {item.likes} {item.likes === 1 || item.likes === 0 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <Text style={styles.commentCountText}>{item.comments.length} Comments</Text>
      </View>

      {/* Comments */}
      <View style={styles.commentsContainer}>
        {item.comments.map((comment, index) => {
          if (!expandedComments[item._id] && index >= 1) return null;
          return (
            <View key={comment._id} style={styles.comment}>
              {comment.user?.image && (
                <Image source={{ uri: comment.user.image }} style={styles.commentUserImage} />
              )}
              <View style={styles.commentTextContainer}>
                <Text style={styles.commentUser}>{comment.user?.name || 'Anonymous'}</Text>
                <Text style={styles.commentDate}>{formatDateOrTime(comment.createdAt)}</Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <TouchableOpacity onPress={() => {
                  setSelectedPostId(item._id);
                  setSelectedCommentId(comment._id);
                  setShowReplyModal(true);
                }}>
                  <Text style={styles.replyLink}>Reply</Text>
                </TouchableOpacity>
                {(expandedReplies[comment._id] ? comment.replies : comment.replies.slice(0, 1)).map(reply => (
                  <View key={reply._id} style={styles.reply}>
                    {reply.user?.image && (
                      <Image source={{ uri: reply.user.image }} style={styles.replyUserImage} />
                    )}
                    <View style={styles.replyTextContainer}>
                      <Text style={styles.replyUser}>{reply.user?.name || 'Anonymous'}</Text>
                      <Text style={styles.replyDate}>{formatDateOrTime(reply.createdAt)}</Text>
                      <Text style={styles.replyContent}>{reply.content}</Text>
                    </View>
                  </View>
                ))}
                {comment.replies.length > 1 && (
                  <TouchableOpacity onPress={() => toggleReplies(comment._id)}>
                    <Text style={styles.replyButton}>
                      {expandedReplies[comment._id] ? 'See Less Replies' : `See More Replies (${comment.replies.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
      {item.comments.length > 2 && (
        <TouchableOpacity onPress={() => toggleComments(item._id)}>
          <Text style={styles.replyButton}>{expandedComments[item._id] ? 'See Less Comments' : 'See More Comments'}</Text>
        </TouchableOpacity>
      )}
      {/* Modern comment input */}
      <View style={styles.commentInputContainerModern}>
        <TextInput
          style={styles.commentInputModern}
          placeholder="Add a comment..."
          value={comment}
          onChangeText={setComment}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.commentSendButton}
          onPress={() => handleAddComment(item._id)}
          disabled={!comment.trim()}
        >
          <MaterialIcons name="send" size={22} color={comment.trim() ? "#007AFF" : "#ccc"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    loading
      ? <ActivityIndicator size="large" color="#207868" />
      : error
        ? <Text style={styles.errorText}>{error}</Text>
        : <Provider>
          <View style={styles.container}>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#207868"]}
                  tintColor="#207868"
                />
              }
            >
              {renderUserInfo()}
              <FlatList
                data={posts}
                renderItem={renderForumItem}
                keyExtractor={item => item._id}
                scrollEnabled={false}
              />
            </ScrollView>
            <Modal
              visible={showReplyModal}
              animationType="slide"
              transparent
              onRequestClose={() => setShowReplyModal(false)}
            >
              <TouchableWithoutFeedback onPress={() => setShowReplyModal(false)}>
                <View style={styles.replyModalOverlay}>
                  <TouchableWithoutFeedback onPress={() => { }}>
                    <View style={styles.replyModalContainer}>
                      <View style={styles.commentInputContainerModern}>
                        <TextInput
                          style={styles.commentInputModern}
                          placeholder="Write a reply..."
                          value={reply}
                          onChangeText={setReply}
                          placeholderTextColor="#888"
                        />
                        <TouchableOpacity
                          style={styles.commentSendButton}
                          onPress={handleAddReply}
                          disabled={!reply.trim()}
                        >
                          <MaterialIcons name="send" size={22} color={reply.trim() ? "#007AFF" : "#ccc"} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowReplyModal(false)}
                        style={styles.closeReplyModalButton}
                      >
                        <Text style={styles.closeReplyModalText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  userInfoCard: {
    alignItems: 'center',
    marginBottom: 22,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#207868",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#9EBC8A',
    backgroundColor: '#e7f7f3',
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#9EBC8A',
    backgroundColor: '#f1f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#73946B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#9EBC8A',
    marginBottom: 3,
  },
  viewDetailsButton: {
    marginTop: 10,
    backgroundColor: '#9EBC8A',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  viewDetailsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  forumCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    marginHorizontal: 15,
    padding: 18,
    shadowColor: "#207868",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    backgroundColor: "#e7f7f3",
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    backgroundColor: "#f1f4f8",
    alignItems: 'center',
    justifyContent: 'center',
  },
  postUser: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#207868',
  },
  statusBadge: {
    marginLeft: 10,
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 13,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  ellipsisIconContainer: {
    padding: 7,
  },
  postDate: {
    fontSize: 11,
    color: '#8e99a4',
    marginBottom: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#505c66',
    marginBottom: 7,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#e3f1eb",
  },
  likesCommentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexShrink: 1,
  },
  likeIcon: {
    marginRight: 5,
  },
  likesText: {
    color: '#A4B465',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  commentCountText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
    textAlign: 'right',
  },
  commentsContainer: {
    marginTop: 10,
  },
  comment: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  commentUserImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 13,
    color: '#888',
  },
  commentContent: {
    fontSize: 14,
  },
  repliesContainer: {
    marginLeft: 40,
  },
  reply: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  replyUserImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  replyTextContainer: {
    flex: 1,
  },
  replyUser: {
    fontWeight: 'bold',
  },
  replyDate: {
    fontSize: 12,
    color: '#888',
  },
  replyContent: {
    fontSize: 14,
  },
  replyButton: {
    color: '#A4B465',
    marginTop: 5,
  },
  replyLink: {
    color: '#A4B465',
    marginTop: 5,
  },
  commentInputContainerModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  commentInputModern: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#222',
  },
  commentSendButton: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "#fff",
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  replyModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  replyModalContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingHorizontal: 20,
    elevation: 10,
  },
  closeReplyModalButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
  closeReplyModalText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default Profile;