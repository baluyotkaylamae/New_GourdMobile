import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import InputUser from "../../Shared/Form/InputUser";
import FormContainer from "../../Shared/Form/FormContainer";
import { useNavigation } from '@react-navigation/native';
import Error from '../../Shared/Error';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { loginUser } from '../../Context/Actions/Auth.actions';
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Google logo and app logo (replace with your logo path)
import googleLogo from "../../assets/google.png";
import appLogo from "../../assets/NoBG.png"; // <-- Use your actual logo path

const Login = (props) => {
  const context = useContext(AuthGlobal);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  WebBrowser.maybeCompleteAuthSession();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  // Navigate to UserProfile after successful login
  useEffect(() => {
    if (context && context.stateUser && context.stateUser.isAuthenticated) {
      navigation.navigate("User Profile");
    }
  }, [context.stateUser.isAuthenticated, navigation]);

  const handleSubmit = async () => {
    const user = {
      email,
      password,
    };
  
    if (email === "" || password === "") {
      setError("Please fill in your credentials");
    } else if (context && context.dispatch) {
      const response = await loginUser(user, context.dispatch); // Assuming loginUser returns a token
      if (response && response.token) {
        await AsyncStorage.setItem('jwt', response.token); // Store the token
      }
    } else {
      console.error('Context or Dispatch is undefined');
    }
  };
  
  const handleGoogleSignIn = () => {
    if (request) {
      promptAsync();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#E0F8E6" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FormContainer style={styles.outerContainer}>

        <View style={styles.formContent}>
          <Image source={appLogo} style={styles.logo} />
          <Text style={styles.cardTitle}>Sign In</Text>
          <InputUser
            placeholder={"Email"}
            name={"email"}
            id={"email"}
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputUser
            placeholder={"Password"}
            name={"password"}
            id={"password"}
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
          />
          {/* <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
            <Text style={styles.forgetPassword}>Forget Your Password?</Text>
          </TouchableOpacity> */}
          <View style={styles.buttonGroup}>
            {error ? <Error message={error} /> : null}
            <EasyButton
              login
              primary
              onPress={handleSubmit}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Sign in</Text>
            </EasyButton>
          </View>
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerButton}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FormContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#E0F8E6",
  },
  logoHeaderWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    marginBottom: 15,
    flexDirection: "column",
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 6,
  },
  logoText: {
    fontSize: 29,
    fontWeight: "bold",
    color: "#A4B465",
    letterSpacing: 1.5,
    fontFamily: 'serif',
  },
  formContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginVertical: 24,
    width: "95%",
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#207868",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#A4B465",
    marginBottom: 12,
    letterSpacing: 0.5,
    alignSelf: "flex-start",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#A4B465",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A4B465",
    paddingHorizontal: 12,
    fontSize: 16,
    width: "100%",
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: "#A4B465",
    borderRadius: 10,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: 17,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 8,
  },
  registerText: {
    color: "#555",
    fontSize: 15,
    marginRight: 5,
  },
  registerButton: {
    color: "#A4B465",
    fontWeight: "bold",
    fontSize: 15.5,
    textDecorationLine: "underline",
  },
  socialDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1.1,
    backgroundColor: "#A4B465",
    marginHorizontal: 6,
    borderRadius: 2,
  },
  middleText: {
    color: "#664229",
    fontWeight: "bold",
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  googleButtonContainer: {
    backgroundColor: "#E0F8E6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#b9e7d6",
  },
  googleIcon: {
    width: 28,
    height: 28,
  },
  forgetPassword: {
    color: "#118a7e",
    marginTop: 5,
    textAlign: "center",
  },
});

export default Login;