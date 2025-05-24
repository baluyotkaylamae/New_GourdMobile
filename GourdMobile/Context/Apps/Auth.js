import React, { useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "../Reducers/Auth.reducer";
import AuthGlobal from "../Store/AuthGlobal";
import {jwtDecode} from "jwt-decode";

const Auth = (props) => {
  const [stateUser, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: {},
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem("jwt");
      console.log("Retrieved token:", token); // Log the token
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("Decoded token:", decoded); // Log the decoded token
          dispatch({ type: "SET_CURRENT_USER", payload: decoded });
        } catch (error) {
          console.error("Token decoding error:", error);
          dispatch({ type: "SET_CURRENT_USER", payload: {} });
        }
      } else {
        console.warn("No token found in AsyncStorage.");
        dispatch({ type: "SET_CURRENT_USER", payload: {} });
      }
    };

    loadToken();
  }, []);

  return (
    <AuthGlobal.Provider value={{ stateUser, dispatch }}>
      {props.children}
    </AuthGlobal.Provider>
  );
};

export default Auth;