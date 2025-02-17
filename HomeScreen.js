import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Handle Image Capture
  const handleTakePhoto = async () => {
    try {
      const response = await launchCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: 300,
        maxHeight: 300,
      });
      console.log('Camera Response:', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera Error:', error);
      Alert.alert('Error', 'Something went wrong while accessing the camera.');
    }
  };

  // Handle Image Selection from Gallery
  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: 300,
        maxHeight: 300,
      },
      (response) => {
        console.log('Image Library Response:', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setSelectedImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleDetectDisease = async () => {
    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'No Image',
        text2: 'Please select or capture an image first.',
      });
      return;
    }
    setLoading(true);
    setModalVisible(true);
    try {
      const formData = new FormData();
      const imageDetails = {
        uri: selectedImage,
        type: 'image/jpeg',
        name: `plant_image_${new Date().getTime()}.jpg`,
      };
      formData.append('image', imageDetails);
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        Toast.show({
          type: 'error',
          text1: 'Authentication required',
          text2: 'Please log in to continue.',
        });
        return;
      }
      const response = await fetch('http://162.244.24.16:8000/scanner/scanner_main', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('Response Status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Parsed Data:', data);
        setDiseaseResult(data);
      } else {
        const errorText = await response.text();
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorText,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };


  // Result Modal
  const renderResult = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#111" />;
    }
    if (diseaseResult) {
      return (
        <View>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Text style={styles.boldText}>Detected: </Text>
            <Text style={styles.resTxt}>{diseaseResult["class name"]}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Text style={styles.boldText}>Confidence: </Text>
            <Text style={styles.resTxt}>{diseaseResult.confidence}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Text style={styles.boldText}>Common Treatments: </Text>
            <Text style={styles.resTxt}>{diseaseResult.common_treatments}</Text>
          </View>
          <Text style={styles.boldText}>Details: </Text>
          <Text style={styles.resTxt}>{diseaseResult.gemini_ai}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        <Text style={styles.title}>Welcome to Plantaria</Text>
      </View>
      <View style={styles.container}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Text style={[styles.placeholder, styles.image]}>No image selected</Text>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handlePickImage}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, styles.diseaseBtn]} onPress={handleDetectDisease}>
          <Text style={styles.buttonText}>Detect Disease</Text>
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ textAlign: 'center', marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Result</Text>
              {renderResult()}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  image: {
    width: 330,
    height: 230,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  button: {
    backgroundColor: '#6a994e',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  diseaseBtn: {
    marginTop: 15
  },
  resTxt: {
    fontSize: 17
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 17
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    marginTop: 12,
    borderRadius: 5,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});