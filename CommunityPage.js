import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

export default function CommunityPage({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [currentComment, setCurrentComment] = useState('');
  const [currentPostIndex, setCurrentPostIndex] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [postData, setPostData] = useState({
    id: null,
    title: '',
    description: '',
    body: '',
    image: null,
  });
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const API_URL = 'http://162.244.24.16:8000/community';

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };
    checkToken();
    fetchPosts();
    fetchProfile();
  }, []);

  // Fetch Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch('http://162.244.24.16:8000/user/user-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setProfile(data.user);
        }
      }
    } catch (error) {
      ToastAndroid.show('Error fetching profile!', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        ToastAndroid.show('Please log in to view posts!', ToastAndroid.SHORT);
        return;
      }

      const response = await fetch(`${API_URL}/post_list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        ToastAndroid.show('Failed to fetch posts!', ToastAndroid.SHORT);
        return;
      }

      const data = await response.json();
      console.log('Fetched posts:', data); // Log the fetched posts

      if (Array.isArray(data) && data.length > 0) {
        const postsWithUserDetails = await Promise.all(
          data.map(async (post) => {
            const userResponse = await fetch(`http://162.244.24.16:8000/user/consultant-profile-detail/${post.author_id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log('Fetched user data for post:', post.id, userData); // Log user data
              return { ...post, user: userData };
            } else {
              return post;
            }
          })
        );

        console.log('Posts with user details:', postsWithUserDetails); // Log posts with user details
        setPosts(postsWithUserDetails);

        // Fetch comments for each post
        postsWithUserDetails.forEach(post => {
          fetchComments(post.id);
        });
      } else {
        ToastAndroid.show('No post available!', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Network error!', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const response = await fetch(`http://162.244.24.16:8000/community/post/${postId}/comments/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const commentsData = await response.json();
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: commentsData,
      }));
    } catch (error) {
      ToastAndroid.show('Failed to load comments!', ToastAndroid.SHORT);
    }
  };

  const toggleComments = (index, postId) => {
    setCurrentPostIndex(index);
    setCommentModalVisible(true);
  };

  const handleCreatePost = async () => {
    if (!isLoggedIn) {
      ToastAndroid.show('Please log in to create a post!', ToastAndroid.SHORT);
      return;
    }
    const accessToken = await AsyncStorage.getItem('access_token');
    if (!accessToken) {
      ToastAndroid.show('Authentication required!', ToastAndroid.SHORT);
      return;
    }
    if (!title || !description || !body) {
      ToastAndroid.show('All fields are required!', ToastAndroid.SHORT);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('body', body);
      formData.append('author', 'Plantaria');
      if (postImage) {
        formData.append('image', {
          uri: postImage.uri,
          type: postImage.type,
          name: postImage.fileName,
        });
      }
      const response = await fetch(`${API_URL}/create_post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });
      if (response.ok) {
        ToastAndroid.show('Post created successfully!', ToastAndroid.SHORT);
        fetchPosts();
        setModalVisible(false);
        resetForm();
      } else {
        const data = await response.json();
        ToastAndroid.show('Error creating post!', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Network error!', ToastAndroid.SHORT);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBody('');
    setPostImage(null);
  };

  const toggleLike = async (index) => {
    const post = posts[index];
    const accessToken = await AsyncStorage.getItem('access_token');
    if (!accessToken) {
      ToastAndroid.show('Authentication required!', ToastAndroid.SHORT);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/post/${post.id}/like/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const updatedPosts = [...posts];
        updatedPosts[index].likes += likedPosts[index] ? -1 : 1;
        setPosts(updatedPosts);
        setLikedPosts((prevState) => ({
          ...prevState,
          [index]: !prevState[index],
        }));
      } else {
        const errorData = await response.json();
        ToastAndroid.show('Error updating like', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Network error!', ToastAndroid.SHORT);
    }
  };

  const handlePostComment = async () => {
    if (!currentComment) {
      return;
    }
    const accessToken = await AsyncStorage.getItem('access_token');
    if (!accessToken) {
      ToastAndroid.show('Authentication required!', ToastAndroid.SHORT);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/post/${posts[currentPostIndex].id}/comment/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ body: currentComment }),
      });
      if (response.ok) {
        const newComments = { ...comments };
        newComments[posts[currentPostIndex].id] = [...(newComments[posts[currentPostIndex].id] || []), { body: currentComment }];
        setComments(newComments);
        setCurrentComment('');
      } else {
        const data = await response.json();
        ToastAndroid.show('Error posting comment ', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Unable to connect to server ', error, ToastAndroid.SHORT);
    }
  };

  const handleCloseMenuModal = () => {
    setIsMenuModalVisible(false);
    setSelectedPost(null);
  };

  const handleCancelComment = () => {
    setCurrentComment('');
    setCommentModalVisible(false);
  };

  const handleUpdatePost = async () => {
    if (!title || !description || !body) {
      ToastAndroid.show('All fields are required!', ToastAndroid.SHORT);
      return;
    }
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('body', body);
      if (postImage) {
        formData.append('image', {
          uri: postImage.uri,
          type: postImage.type,
          name: postImage.fileName,
        });
      }
      const response = await fetch(`${API_URL}/post/${selectedPost.id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error('Invalid JSON response');
      }
      if (response.ok) {
        ToastAndroid.show('Post updated successfully!', ToastAndroid.SHORT);

        fetchPosts();
        setIsUpdateModalVisible(false);
        setModalVisible(false);
        setIsMenuModalVisible(false);
        resetForm();
      } else {
        Toast.show({ type: 'error', text1: 'Failed to update post!', text2: data.detail || 'Unknown error' });
      }
    } catch (error) {
      ToastAndroid.show('Network error!', ToastAndroid.SHORT);
    }
  };

  const handleMenuClick = (post) => {
    if (profile && profile.id === post.author) {
      setSelectedPost(post);
      setIsMenuModalVisible(true);
    } else {
      ToastAndroid.show('You can only edit or delete your own posts!', ToastAndroid.SHORT);
    }
  };

  const handleEdit = (post) => {
    if (profile && profile.id === post.author) {
      setPostData({
        id: post.id,
        title: post.title,
        description: post.description,
        body: post.body,
        image: post.image,
      });
      setIsUpdateModalVisible(true);
    } else {
      ToastAndroid.show('You can only edit your own posts!', ToastAndroid.SHORT);
    }
  };

  const handleDelete = async () => {
    if (selectedPost && profile && profile.id === selectedPost.author) {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        Toast.show({ type: 'error', text1: 'You must be logged in to perform this action' });
        return;
      }
      try {
        const response = await fetch(`${API_URL}/post/${selectedPost.id}/delete_post/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete post');
        }
        Toast.show({ type: 'success', text1: 'Post deleted successfully' });
        fetchPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
        Toast.show({ type: 'error', text1: error.message || 'Network request failed' });
      } finally {
        handleCloseMenuModal();
      }
    } else {
      Toast.show({ type: 'error', text1: "You can only delete your own posts!" });
    }
  };

  const openImagePicker = () => {
    launchImageLibrary({}, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker error: ', response.errorMessage);
        Toast.show({ type: 'error', text1: 'Failed to pick image.' });
      } else {
        const asset = response.assets[0];
        setPostImage({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        });
      }
    });
  };


  return (
    <View style={styles.containers}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.textField}
          onPress={() => {
            if (isLoggedIn) {
              setModalVisible(true);
            } else {
              ToastAndroid.show('You must be logged in to create a post!', ToastAndroid.SHORT);
              navigation.navigate('LoginScreen');
            }
          }}
        >
          <View style={styles.innerTextField}>
            <View style={styles.circle} />
            <Text style={styles.textFieldText}>Write something</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007acc" style={{ flex: 1, marginTop: 20, alignItems: 'center', justifyContent: 'center' }} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={posts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.postContainer}>
              <View style={styles.profileSection}>
                <Image
                  source={item.authorImage ? { uri: item.authorImage } : require('../assets/images/first.jpg')}
                  style={styles.profilePic}
                />
                <View>
                  <Text style={styles.profileName}>{item.author_username}</Text>
                  <Text style={styles.postDate}>{item.createdAt}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', }}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingLeft: 20, marginRight: 20 }}
                    onPress={() => navigation.navigate('Chat', { roomId: item.id, chatPartnerName: item.author_username })} 
                  >
                    <Image source={require('../assets/images/chat.png')} style={styles.chatImage} />
                    {/* </TouchableOpacity>                    <Image source={require('../assets/images/chat.png')} style={styles.chatImage} /> */}
                  </TouchableOpacity>
                  <TouchableOpacity style={{}} onPress={() => handleMenuClick(item)}>
                    <Image source={require('../assets/images/menu.png')} style={{ width: 24, height: 24 }} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postDescription}>{item.description}</Text>
              <Text style={styles.postBody}>{item.body}</Text>
              <View style={styles.likeSection}>
                <TouchableOpacity style={styles.likeButton} onPress={() => toggleLike(index)}>
                  <Text style={{ fontSize: 22 }}>{likedPosts[index] ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
                <Text style={styles.likeCount}>({item.likes})</Text>
                <TouchableOpacity style={styles.commentButton} onPress={() => toggleComments(index, item.id)}>
                  <Text style={{ fontSize: 16, color: '#666' }}>💬 Comment</Text>
                  <Text style={styles.commentButtonText}>
                    ({comments[item.id] ? comments[item.id].length : (item.comments || []).length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}


      {/* Menu Modal for Edit/Delete */}
      <Modal transparent animationType="fade" visible={isMenuModalVisible} onRequestClose={handleCloseMenuModal}>
        <TouchableOpacity style={styles.modalOverlay2} activeOpacity={1} onPress={handleCloseMenuModal}>
          <View style={styles.modalContainer2}>
            <TouchableOpacity onPress={() => handleEdit(selectedPost)}>
              <Text style={styles.optionText2}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.optionText2}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Update Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUpdateModalVisible}
        onRequestClose={() => setIsUpdateModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update your post</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Body"
              value={body}
              onChangeText={setBody}
            />
            <TouchableOpacity onPress={openImagePicker} style={styles.input}>
              <Text style={{ paddingTop: 10 }}>Select Image</Text>
            </TouchableOpacity>
            {postImage && <Image source={{ uri: postImage.uri }} style={styles.selectedImage} />}
            <TouchableOpacity onPress={handleUpdatePost} style={styles.postButton2}>
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Update Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsUpdateModalVisible(false)} style={{ marginTop: 10, marginBottom: 5, paddingTop: 10 }}>
              <Text style={{ textAlign: 'center', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create a New Post</Text>
            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
            <TextInput
              placeholder="Body"
              value={body}
              onChangeText={setBody}
              style={[styles.input]}
              multiline
            />
            <TouchableOpacity onPress={openImagePicker} style={styles.input}>
              <Text style={{ color: '#000', paddingTop: 10 }}>Select Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postButton2} onPress={handleCreatePost}>
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, marginBottom: 5 }} onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: 'center', fontSize: 16, paddingTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Comments</Text>
            <ScrollView style={styles.commentsList}>
              {comments[posts[currentPostIndex]?.id]?.map((comment, index) => (
                <View key={index} style={styles.commentWrapper}>
                  <Text style={styles.commentText}>{comment.body}</Text>
                </View>
              ))}
            </ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Write a comment"
              value={currentComment}
              onChangeText={setCurrentComment}
            />
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelComment}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postButton} onPress={handlePostComment}>
                <Image source={require('../assets/images/post.png')} style={{ width: 35, height: 35 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
}


const styles = StyleSheet.create({
  containers: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingVertical: 10,
  },
  textField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3f4',
    borderRadius: 5,
    padding: 10,
  },
  textFieldText: {
    color: '#333',
    fontSize: 15,
  },
  innerTextField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: '100%',
    backgroundColor: 'black',
    marginRight: 10,
  },
  postsList: {
    paddingTop: 0,
  },
  postContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },/////////////////////////////////////////////////////
  chatImage: {
    width: 24,
    height: 24,
  },
  postDate: {
    fontSize: 12,
    color: '#777',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postDescription: {
    marginTop: 10,
    fontSize: 15,
    color: '#333',
  },
  postBody: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 10,
    fontSize: 17,
    color: '#333',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  commentButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    padding: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  commentsList: {
    marginBottom: 20,
  },
  commentWrapper: {
    marginBottom: 10,
    borderBottomWidth: 0.3,
    borderColor: 'grey',
    paddingBottom: 10,
  },
  commentText: {
    fontSize: 16,
    color: '#111',
  },
  input: {
    height: 40,
    borderColor: '#333',
    borderWidth: 0.5,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: '#333',
  },
  modalContainer3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent3: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input3: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectedImage3: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#222',
    fontSize: 16,
  },
  postButton: {
    padding: 10,
  },
  postButton2: {
    padding: 13,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  postButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
  menuButton2: {
    flex: 1,
    alignItems: 'flex-end',
  },
  menuImage2: {
    width: 20,
    height: 20,
  },
  modalOverlay2: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly transparent overlay
    justifyContent: 'center', // Center modal vertically
    alignItems: 'center', // Center modal horizontally
  },
  modalContainer2: {
    position: 'absolute', // Position it absolutely on the screen
    backgroundColor: '#fff', // White background for modal
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: 170,
    height: 130,
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
  closeButton2: {
    position: 'absolute',
    top: 5,
    right: 8,
    marginBottom: 10,
    padding: 5,
  },
  optionText2: {
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  modalTextArea: {
    width: '100%',
    height: 80,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  postButtonModal: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  postButtonTextModal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton2: {
    position: 'absolute',
    top: 5,
    right: 8,
    marginBottom: 10,
    padding: 5,
  },
  menuButton2: {
    flex: 1,
    alignItems: 'flex-end',
  },
  menuImage2: {
    width: 20,
    height: 20,
  },
});