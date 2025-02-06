import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axiosClient from "../network/axiosClient.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_LOGIN } from "../network/api.js";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosClient.post(API_LOGIN, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save the token in AsyncStorage
      await AsyncStorage.setItem("userToken", token);

      Alert.alert("Success", "Login successful!");
      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back</Text>
      <Image
        source={require("../assets/login-image.jpg")}
        style={styles.image}
      />

      <TextInput
        placeholder="Enter your Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.forgotText}>Forgot password ?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("Register")}
        >
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F8F9",
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  forgotText: {
    color: "#48CAE4",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#48CAE4",
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    fontSize: 14,
    color: "#444",
  },
  signupLink: {
    color: "#48CAE4",
    fontWeight: "bold",
  },
});

export default LoginScreen;
