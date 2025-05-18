import React, { useContext, useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons'; // Import an icon library
import MainTabs from './MainTabs';
import AdminNavigator from './AdminNavigator';
import UserNavigator from './UserNavigator';
import Monitoring from '../screens/Monitoring';
import PastMonitoring from '../screens/PastMonitoring';
import AuthGlobal from '../Context/Store/AuthGlobal';
import CustomDrawerContent from './CustomDrawerContent';
import CreatePost from '../screens/Post/createPost';
import Dashboard from '../screens/User/DashboardScreen';
const Drawer = createDrawerNavigator();
import { registerForPushNotificationsAsync } from '../utils/Notification';
import baseURL from '../assets/common/baseurl';

const DrawerNavigator = () => {
  const context = useContext(AuthGlobal);
  const isAdmin = context.stateUser && context.stateUser.user && context.stateUser.user.isAdmin;
  const [user, setUser] = useState(context.stateUser && context.stateUser.user);

  // console.log("User in DrawerNavigator:", user);
  useEffect(() => {
    const registerForPushNotifications = async () => {
      try {
        await registerForPushNotificationsAsync(baseURL, user.pushToken, user.userId);
      } catch (error) {
        console.error("Error registering for push notifications:", error);
      }
    }
    registerForPushNotifications()
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#9EBC8A', // Active label and icon color
        drawerInactiveTintColor: '#888',  // Inactive color (optional)
      }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{
          headerTitle: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      {isAdmin && (
        <Drawer.Screen
          name="Admin Panel"
          component={AdminNavigator}
          options={{
            headerTitle: 'Admin Panel',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      <Drawer.Screen
        name="Profile"
        component={UserNavigator}
        options={{
          headerTitle: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="MyDashboard"
        component={Dashboard}
        options={{
          headerTitle: 'MyDashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Monitoring"
        component={Monitoring}
        options={{
          headerTitle: 'Monitoring',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="eye-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Harvest"
        component={PastMonitoring}
        options={{
          headerTitle: 'Harvest',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CreatePost"
        component={CreatePost}
        options={{
          headerTitle: 'Create Post',
          drawerItemStyle: { display: 'none' },
          drawerIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
