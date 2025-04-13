import React, { useEffect, useState, useContext } from 'react';
import { Modal, View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const UserProfile = ({ navigation }) => {
    const context = useContext(AuthGlobal);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [reply, setReply] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {

        const fetchUserProfile = async () => {
            const storedToken = await AsyncStorage.getItem('jwt');
            const userId = context.stateUser.user?.userId;
            if (userId && storedToken) {
                try {
                    // Fetch user profile details
                    const userProfileResponse = await axios.get(`${baseURL}users/${userId}`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });

                    console.log('User Profile Data:', userProfileResponse.data);

                    setUserInfo(userProfileResponse.data);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        const fetchUserPosts = async () => {
            const storedToken = await AsyncStorage.getItem('jwt');
            try {
                const userId = context.stateUser.user?.userId;
                if (userId && storedToken) {
                    const postsResponse = await axios.get(`${baseURL}posts/user/${userId}`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    setUserPosts(postsResponse.data.posts || postsResponse.data);
                } else {
                    Alert.alert('Error', 'User not authenticated');
                }
            } catch (error) {
                setError('Error fetching user posts');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
        fetchUserPosts();
    }, [refresh]);

    const triggerRefresh = () => setRefresh(!refresh);

    const handleLikePost = async (postId) => {
        try {
            const storedToken = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${baseURL}posts/${postId}/like`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserPosts((prevPosts) =>
                    prevPosts.map((post) =>
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
        if (!comment) return Alert.alert('Error', 'Comment cannot be empty');
        try {
            const storedToken = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${baseURL}posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
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
        if (!reply) return Alert.alert('Error', 'Reply cannot be empty');
        try {
            const storedToken = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${baseURL}posts/${selectedPostId}/comments/${selectedCommentId}/replies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: reply }),
            });
            if (response.ok) {
                setReply('');
                setShowReplyModal(false);

                // Update the state with new reply
                setExpandedReplies((prev) => ({
                    ...prev,
                    [selectedCommentId]: true, // Auto-expand to show the new reply
                }));

                triggerRefresh();
            }
        } catch {
            Alert.alert('Error', 'Could not add reply.');
        }
    };

    const toggleReplies = (commentId) => {
        setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const toggleComments = (postId) => {
        setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };
    
    

    const renderUserInfo = () => {
        console.log('Rendering User Info:', userInfo);
        if (!userInfo) {
            return <Text>Loading user info...</Text>;
        }
        const { _id } = userInfo.user;

        return (
            <View style={styles.userInfoContainer}>
                {userInfo.user?.image ? (
                    <Image source={{ uri: userInfo.user.image }} style={styles.profileImage} />
                ) : (
                    <Text>No profile image</Text>
                )}
                <Text style={styles.userName}>{userInfo.user.name}</Text>
                <Text style={styles.userEmail}>{userInfo.user.email}</Text>

                {_id && (
                    <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => navigation.navigate("User Details", { userId: _id })} // Pass the userId to UserDetails
                    >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const handleEditPost = async (postId) => {
        navigation.navigate('UpdatePost', { postId });
    };

    const handleDeletePost = async (postId) => {
        try {
            const storedToken = await AsyncStorage.getItem('jwt');
            const response = await fetch(`${baseURL}posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'Post deleted successfully.');
                triggerRefresh();
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Could not delete the post.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not delete the post.');
        }
    };

    const renderForumItem = ({ item }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'Approved':
                    return 'green';
                case 'Rejected':
                    return 'red';
                case 'Pending':
                    return 'orange';
                default:
                    return 'black'; // Default color if status is unknown
            }
        };
    
        return (
            <View style={styles.forumCard}>
                <View style={styles.userContainer}>
                    {item.user?.image ? (
                        <Image source={{ uri: item.user.image }} style={styles.userImage} />
                    ) : (
                        <Text>No profile image</Text>
                    )}
                    <Text style={styles.forumUser}>{item.user?.name || 'Unknown'}</Text>
                </View>
                <Text style={styles.forumDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                {/* Apply the color based on the status */}
                <Text style={[styles.postStatus, { color: getStatusColor(item.status) }]}>
                    {item.status}
                </Text>
                <Text style={styles.forumTitle}>{item.title}</Text>
                <Text style={styles.forumContent}>{item.content}</Text>
        
                {/* Ellipsis Icon Positioned to the Upper Left Corner */}
                <TouchableOpacity
                    onPress={() => {
                        setSelectedPost(item); // Set the current post
                        setActionModalVisible(true); // Show the modal
                    }}
                    style={styles.ellipsisIconContainer}
                >
                    <Icon name="ellipsis-h" size={20} color="#007AFF" />
                </TouchableOpacity>
        
                {item.images.length > 0 && (
                    <Image source={{ uri: item.images[0] }} style={styles.forumImage} />
                )}
                <View style={styles.likesCommentsContainer}>
                    <TouchableOpacity style={styles.likeButton} onPress={() => handleLikePost(item._id)}>
                        <Icon name="thumbs-up" size={16} color="#007AFF" style={styles.likeIcon} />
                        <Text style={styles.likesText}>{item.likes} Likes</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <Text style={styles.commentCountText}>{item.comments.length} Comments</Text>
                </View>
                <View style={styles.commentsContainer}>
                    <Text style={styles.commentsHeader}>Comments:</Text>
                    {item.comments.map((comment, index) => {
                        if (!expandedComments[item._id] && index >= 1) return null;
                        return (
                            <View key={comment._id} style={styles.comment}>
                                {comment.user?.image && (
                                    <Image source={{ uri: comment.user.image }} style={styles.commentUserImage} />
                                )}
                                <View style={styles.commentTextContainer}>
                                    <Text style={styles.commentUser}>{comment.user?.name || 'Anonymous'}</Text>
                                    <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</Text>
                                    <Text style={styles.commentContent}>{comment.content}</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedPostId(item._id);
                                            setSelectedCommentId(comment._id);
                                            setShowReplyModal(true);
                                        }}
                                    >
                                        <Text style={styles.replyLink}>Reply</Text>
                                    </TouchableOpacity>
                                    {comment.replies && comment.replies.length > 0 && (
                                        <View style={styles.repliesContainer}>
                                            {comment.replies
                                                .slice(0, expandedReplies[comment._id] ? comment.replies.length : 1)
                                                .map((reply) => (
                                                    <View key={reply._id} style={styles.reply}>
                                                        {reply.user?.image && (
                                                            <Image source={{ uri: reply.user.image }} style={styles.replyUserImage} />
                                                        )}
                                                        <View style={styles.replyTextContainer}>
                                                            <Text style={styles.replyUser}>{reply.user?.name || 'Anonymous'}</Text>
                                                            <Text style={styles.replyDate}>
                                                                {new Date(reply.createdAt).toLocaleString()}
                                                            </Text>
                                                            <Text style={styles.replyContent}>{reply.content}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            <TouchableOpacity onPress={() => toggleReplies(comment._id)}>
                                                <Text style={styles.show}>
                                                    {expandedReplies[comment._id] ? 'Hide Replies' : 'Show More Replies'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                    {item.comments.length > 2 && (
                        <TouchableOpacity onPress={() => toggleComments(item._id)}>
                            <Text style={styles.show}>{expandedComments[item._id] ? 'See Less Comments' : 'See More Comments'}</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            value={comment}
                            onChangeText={setComment}
                        />
                        <Button title="Comment" onPress={() => handleAddComment(item._id)} />
                    </View>
                </View>
            </View>
        );
    };

    return (
        loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
            <Text>{error}</Text>
        ) : (
            <View style={styles.container}>
                {renderUserInfo()}
                {userPosts.length === 0 ? (
                    <Text style={styles.noPostsText}>You have no posts yet. Start sharing your thoughts!</Text>
                ) : (
                    <FlatList
                        data={userPosts}
                        renderItem={renderForumItem}
                        keyExtractor={(item) => item._id}
                        onRefresh={triggerRefresh}
                        refreshing={loading}
                    />
                )}
                <Modal visible={showReplyModal} animationType="slide">
                    <View style={styles.modalContainer}>
                        <TextInput
                            style={styles.replyInput}
                            placeholder="Write a reply..."
                            value={reply}
                            onChangeText={setReply}
                        />
                        <Button title="Send Reply" onPress={handleAddReply} />
                        <Button title="Close" onPress={() => setShowReplyModal(false)} />
                    </View>
                </Modal>
                <Modal
                    visible={actionModalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setActionModalVisible(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.actionModal}>
                            <TouchableOpacity
                                style={styles.actionOption}
                                onPress={() => {
                                    setActionModalVisible(false);
                                    // Call edit function or open an edit screen
                                    handleEditPost(selectedPost._id, selectedPost.content);
                                }}
                            >
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionOption}
                                onPress={() => {
                                    setActionModalVisible(false);
                                    // Call delete function
                                    handleDeletePost(selectedPost._id);
                                }}
                            >
                                <Text style={styles.actionText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionOption}
                                onPress={() => setActionModalVisible(false)}
                            >
                                <Text style={styles.actionText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>


            </View>




        )
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Light background for a clean look
        padding: 10,
    },
    noPostsText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#7F8C8D', // Neutral gray for no posts text
        marginTop: 20,
    },
    userInfoContainer: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FFFFFF', // White card for user info
        borderRadius: 10,
        elevation: 3, // Shadow for modern look
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#3498DB', // Blue border for profile image
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50', // Darker text for better contrast
    },
    userEmail: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    viewDetailsButton: {
        marginTop: 10,
        backgroundColor: '#3498DB', // Blue button
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    forumCard: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#FFFFFF', // White card for posts
        elevation: 3, // Shadow for modern look
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#BDC3C7', // Light gray border for user image
    },
    forumUser: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2C3E50',
    },
    forumDate: {
        fontSize: 12,
        color: '#95A5A6',
    },
    forumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495E',
        marginVertical: 5,
    },
    forumContent: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 10,
    },
    forumImage: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
    likesCommentsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        alignItems: 'center',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeIcon: {
        marginRight: 5,
    },
    likesText: {
        fontSize: 14,
        color: '#3498DB',
    },
    divider: {
        width: 1,
        height: 15,
        backgroundColor: '#BDC3C7',
    },
    commentCountText: {
        fontSize: 14,
        color: '#3498DB',
    },
    commentsContainer: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ECF0F1', // Light gray border for separation
    },
    commentsHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2C3E50',
        marginBottom: 10,
    },
    comment: {
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    commentUserImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#BDC3C7',
    },
    commentTextContainer: {
        flex: 1,
        backgroundColor: '#F9F9F9', // Light gray background for comments
        padding: 10,
        borderRadius: 10,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#2C3E50',
    },
    commentDate: {
        fontSize: 12,
        color: '#95A5A6',
        marginBottom: 5,
    },
    commentContent: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    replyLink: {
        color: '#3498DB',
        marginTop: 5,
        fontSize: 14,
    },
    repliesContainer: {
        marginLeft: 40,
        marginTop: 10,
    },
    reply: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    replyUserImage: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#BDC3C7',
    },
    replyTextContainer: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 10,
        borderRadius: 10,
    },
    replyUser: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#2C3E50',
    },
    replyDate: {
        fontSize: 12,
        color: '#95A5A6',
        marginBottom: 5,
    },
    replyContent: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 10,
        elevation: 3,
    },
    commentInput: {
        flex: 1,
        borderWidth: 0,
        padding: 10,
        fontSize: 14,
        color: '#2C3E50',
    },
    addCommentButton: {
        backgroundColor: '#3498DB',
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
    },
    addCommentButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        elevation: 5,
    },
    actionOption: {
        padding: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ECF0F1',
    },
    actionText: {
        fontSize: 16,
        color: '#3498DB',
    },
    postStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 5,
    },
});
export default UserProfile;
