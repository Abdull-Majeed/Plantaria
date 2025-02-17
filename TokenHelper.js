// tokenHelpers.js

import AsyncStorage from '@react-native-async-storage/async-storage';

export const retrieveToken = async () => {
  const accessToken = await AsyncStorage.getItem('access_token');
  return accessToken;
};
