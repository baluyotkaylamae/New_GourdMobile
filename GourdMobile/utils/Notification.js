import * as Notifications from "expo-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

// export const registerForPushNotificationsAsync = async (baseUrl, currentPushToken) => {
export const registerForPushNotificationsAsync = async (baseUrl, currentPushToken, id) => {

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return null;
  }

  // const token = (await Notifications.getExpoPushTokenAsync()).data;

  // token = await Notifications.getExpoPushTokenAsync({
  //   projectId: Constants.expoConfig.extra.eas.projectId,
  // });


  let token;
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      throw new Error('Project ID not found');
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (error) {
    console.error('Error retrieving Expo push token:', error);
    return null;
  }


  const storedToken = await AsyncStorage.getItem('jwt');
  console.log("Push token:", token);
  if (token !== currentPushToken) {
    try {
      await axios.put(`${baseUrl}users/update-push-token/${id}`, {
        expoPushToken: token,
      }, { headers: { Authorization: `Bearer ${storedToken}` } });
      console.log("Push token updated successfully");
    } catch (error) {
      console.error("Error updating push token:", error);
    }
  } else {
    console.log("Push token is already up-to-date");
  }

  return token;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});