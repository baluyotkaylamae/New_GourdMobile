import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AuthGlobal from '../Context/Store/AuthGlobal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../assets/common/baseurl';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../Context/Actions/Auth.actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomDrawerContent = (props) => {
  const context = useContext(AuthGlobal);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('jwt');
        const userId = context.stateUser?.user?.userId;
        if (userId && token) {
          const response = await axios.get(`${baseURL}users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserDetails(response.data.user || {});
        } else {
          console.error('User ID or token is missing');
        }
      } catch (error) {
        console.error('Error fetching user details:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    if (context.stateUser.isAuthenticated) {
      fetchUserDetails();
    }
  }, [context.stateUser.isAuthenticated]);

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = context.stateUser?.user?.userId;

      await axios.post(`${baseURL}users/logout`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await AsyncStorage.removeItem('jwt');
      logoutUser(context.dispatch);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home', { screen: 'Home' })}
            style={styles.appNameContainer}
          >
            <Image 
              source={require('../assets/logoNBG.png')} // Replace with your actual logo
              style={styles.logo}
            />
            <Text style={styles.headerText}>Gourdtify</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Image 
            source={{ uri: userDetails?.image || 'https://via.placeholder.com/150' }} 
            style={styles.userImage} 
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{userDetails?.name || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{userDetails?.email || ''}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.menuItemsContainer}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 20,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 25,
    backgroundColor: '#F8F9FA',
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  userTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  menuItemsContainer: {
    marginTop: 10,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomDrawerContent;