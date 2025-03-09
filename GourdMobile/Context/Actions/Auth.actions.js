import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import baseURL from "../../assets/common/baseurl";

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
    console.log("Sending login request with user:", user); // Log the user data being sent
    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => {
        console.log("Response status:", res.status); // Log the response status
        return res.json();
    })
    .then((data) => {
        console.log("Response data:", data); // Log the response data
        if (data && data.token) {
            const token = data.token;
            console.log("Token received:", token); // Log the token
            AsyncStorage.setItem("jwt", token);
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded); // Log the decoded token
                dispatch(setCurrentUser(decoded, user));
            } catch (error) {
                console.error("Token decoding error:", error); // Log any decoding errors
                logoutUser(dispatch);
            }
        } else {
            console.error("No token received. Response data:", data); // Log if no token is received
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Login failed",
                text2: "No token received from server"
            });
            logoutUser(dispatch);
        }
    })
    .catch((err) => {
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "Please provide correct credentials",
            text2: err.message || ""
        });
        console.error("Login error:", err); // Log the error
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
    AsyncStorage.removeItem("jwt");
    dispatch(setCurrentUser({}));
};

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    };
};