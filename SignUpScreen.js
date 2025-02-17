import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Select role');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles = ['Farmer', 'Vendor'];

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setShowDropdown(false);
  };

  const handleSignUp = async () => {
    if (!username || !email || !password || !phone || role === 'Select role') {
      Toast.show({ type: 'error', text1: 'All fields are required!' });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'Invalid email format!' });
      return;
    }

    if (!isValidPhone(phone)) {
      Toast.show({ type: 'error', text1: 'Invalid phone number!' });
      return;
    }

    setLoading(true);

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      phone: phone,
      username: username,
      role: role,  
    };

    try {
      console.log('Sending request to register:', payload);
      const response = await fetch('http://162.244.24.16:8000/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        if (data.access && data.refresh) {
          await AsyncStorage.setItem('access_token', data.access);
          await AsyncStorage.setItem('refresh_token', data.refresh);
          await AsyncStorage.setItem('refresh_token', data.role);
        }

        navigation.navigate('LoginScreen');
        Toast.show({ type: 'success', text1: 'Registration successful!', text2: 'Please check your email to activate your account.' });
      } else {
        Toast.show({ type: 'error', text1: 'Registration failed!', text2: data.detail || 'Please try again.' });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Toast.show({ type: 'error', text1: 'Network error!', text2: 'Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <Image source={require('../assets/images/app-logo.jpg')} style={styles.logo} />

      <View style={styles.inputContainer}>
        <TextInput placeholder="Username" placeholderTextColor="#999" style={styles.input} value={username} onChangeText={setUsername} />
        <TextInput placeholder="Email" placeholderTextColor="#999" style={styles.input} value={email} onChangeText={setEmail} />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <TextInput placeholder="Phone no" placeholderTextColor="#999" keyboardType='phone-pad' style={styles.input} value={phone} onChangeText={setPhone} />

        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(!showDropdown)}>
          <Text style={styles.dropdownText}>{role}</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdown}>
            {roles.map((item) => (
              <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => handleRoleSelect(item)}>
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.login}>
          <Text style={{ color: 'grey' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={{ color: 'black', fontWeight: '700' }}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Toast />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 70,
    marginBottom: 50,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 15,
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
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  dropdownButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 8,
    backgroundColor: 'white',
    position: 'absolute',
    top: 210,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  login: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default SignUpScreen;
