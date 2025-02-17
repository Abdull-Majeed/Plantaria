import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation, setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
        Toast.show({ type: 'error', text1: 'Username and Password are required!' });
        return;
    }

    setLoading(true);
    try {
        const response = await fetch('http://162.244.24.16:8000/user/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json(); 
        console.log('Login Data:', data);

        if (response.ok) {
            if (data.access && data.refresh) { 
                await AsyncStorage.setItem('access_token', data.access);
                await AsyncStorage.setItem('refresh_token', data.refresh);
                setIsLoggedIn(true);
                Toast.show({ type: 'success', text1: 'Login successful!' });
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Bottom' }],
                });
            } else {
                throw new Error('Access and Refresh tokens are missing in the response');
            }
        } else {
            Toast.show({
                type: 'error',
                text1: 'Login failed!',
                text2: data.detail || 'Invalid credentials.',
            });
        }
    } catch (error) {
        console.error('Login error:', error); // Log the error for debugging
        Toast.show({
            type: 'error',
            text1: 'Network error!',
            text2: error.message || 'Please check your connection and try again.',
        });
    } finally {
        setLoading(false);
    }
};

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/app-logo.jpg')} style={styles.logo} />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#999"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
            style={styles.iconContainer}
          >
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
      <View style={styles.signup}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')} >
          <Text style={{ fontWeight: '600', fontSize: 16, }}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 85,
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 0.5,
    backgroundColor: 'transparent',
    color: '#333',
    marginBottom: 15,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 40,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: 'green',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signup: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  iconContainer: {
    position: 'absolute',
    right: 10, // Position it inside the input field
    top: 15, // Center vertically
  },
});

export default LoginScreen;
