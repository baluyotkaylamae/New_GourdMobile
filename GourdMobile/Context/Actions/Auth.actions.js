import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import baseURL from "../../assets/common/baseurl";

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => res.json())
    .then((data) => {
        console.log("Login API response:", data);
        if (data && data.token) {
            const token = data.token;
            AsyncStorage.setItem("jwt", token); // Save the token
            try {
                const decoded = jwtDecode(token); // Decode the token
                dispatch(setCurrentUser(decoded, user)); // Update the authentication state
            } catch (error) {
                console.error("Token decoding error:", error);
                logoutUser(dispatch); // Logout if decoding fails
            }
        } else {
            console.error("No token received.");
            logoutUser(dispatch);
        }
    })
    .catch((err) => {
        console.error("Login error:", err);
        logoutUser(dispatch);
    });
};

export const getUserProfile = (id) => {
    fetch(`${baseURL}users/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((data) => console.log(data));
};

export const logoutUser = (dispatch) => {
    AsyncStorage.removeItem("jwt"); // Remove the token
    dispatch(setCurrentUser({})); // Clear the authentication state
};

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    };
};