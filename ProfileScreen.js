import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation, setIsLoggedIn }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      const response = await fetch('http://162.244.24.16:8000/user/login/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (data.access) {
        await AsyncStorage.setItem('access_token', data.access);
        return data.access;
      } else {
        throw new Error('Unable to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      Alert.alert('Error', 'Session expired, please log in again.');
      setIsLoggedIn(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let token = await AsyncStorage.getItem('access_token');
      const response = await fetch('http://162.244.24.16:8000/user/user-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user || null);
      } else if (response.status === 401) {
        token = await refreshToken();
        const retryResponse = await fetch('http://162.244.24.16:8000/user/user-details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          setProfile(data.user || null);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          setLoading(true);
          try {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            setIsLoggedIn(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.profileText}>{item.username}</Text>
      <Text style={{}}>{item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#fff' }}>
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/images/first.jpg')}
          style={styles.profileImage}
        />
        {profile ? (
          <FlatList
            data={[profile]}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <Text style={styles.profileText}>No profile information available.</Text>
        )}
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={() => setModalVisible(true)}>
          <View style={styles.optionIcon}>
            <Text style={styles.icon}>✏️</Text>
          </View>
          <Text style={styles.optionText}>Edit Profile</Text>
          <View style={styles.arrow}>
            <Text style={styles.icon}>›</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionIcon}>
            <Text style={styles.icon}>⚙️</Text>
          </View>
          <Text style={styles.optionText}>Settings</Text>
          <View style={styles.arrow}>
            <Text style={styles.icon}>›</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <View style={styles.optionIcon}>
            <Text style={styles.icon}>👥</Text>
          </View>
          <Text style={styles.optionText}>Invite a friend</Text>
          <View style={styles.arrow}>
            <Text style={styles.icon}>›</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit your profile</Text>
            <TextInput style={styles.input} placeholder="Update name" placeholderTextColor="#999" />
            <TextInput
              style={styles.input}
              placeholder="Update email"
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity style={styles.postButton}>
              <Text style={styles.postButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  itemContainer: {
    padding: 20,
    borderBottomColor: '#ccc',
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderBottomRightRadius: 200,
    borderBottomLeftRadius: 200,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ff7e5f',
  },
  profileText: {
    fontSize: 20,
    alignItems: 'center',
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: '10'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  input: {
    height: 40,
    borderColor: '#222',
    borderWidth: 0.5,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: '#222'
  },

  postButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalContainer: {
    width: 350,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'white'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#111',
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  arrow: {
    marginLeft: 10,
  },
  icon: {
    fontSize: 20,
    color: '111'
  },
  logoutButton: {
    backgroundColor: '#ff7e5f',
    padding: 15,
    borderRadius: 7,
    marginHorizontal: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 17,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
});



export default ProfileScreen;
