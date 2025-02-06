import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import axiosClient from "../network/axiosClient";
import { API_CHECK_IN, API_GET_USER_DATA, API_CHECK_OUT } from "../network/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHECK_IN_RADIUS_METERS = 1500;

const HomeScreen = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [checkOutLocation, setCheckOutLocation] = useState(null);
  const [checkOutLocationName, setCheckOutLocationName] = useState("");
  const [officeLocation, setOfficeLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [userData, setUserData] = useState(null);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  useEffect(() => {
    // Fetch the token from AsyncStorage
    const fetchTokenAndUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("Error", "User not logged in.");
          return;
        }

        // Fetch user data from the API
        const response = await axiosClient.get(API_GET_USER_DATA, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("User Data:", response.data);
        const userData = response.data;
        setUserData(userData);
        setOfficeLocation({
          latitude: userData.office_latitude,
          longitude: userData.office_longitude,
        });
        setIsUserDataLoaded(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response) {
          Alert.alert("Error", `Server Error: ${error.response.status}`);
        } else if (error.request) {
          Alert.alert("Error", "No response from server.");
        } else {
          Alert.alert("Error", `Error: ${error.message}`);
        }
      }
    };

    fetchTokenAndUserData();

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // location permission
  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Allow location access to use this feature"
      );
      return false;
    }
    return true;
  };

  // distance formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // location name from the cordinates
  const getLocationName = async (
    latitude,
    longitude,
    setLocationNameCallback
  ) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (reverseGeocode.length > 0) {
        const { city, region, country } = reverseGeocode[0];
        setLocationNameCallback(`${city}, ${region}, ${country}`);
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
    }
  };

  // check in
  const handleCheckIn = async () => {
    if (!officeLocation) {
      Alert.alert("Error", "Office location not loaded yet.");
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;
    const distance = getDistance(
      latitude,
      longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    if (distance > CHECK_IN_RADIUS_METERS) {
      Alert.alert("Out of Range", "You are not within the check-in location.");
      return;
    }
    // Update the local state
    setLocation(location);
    setIsCheckedIn(true);
    setCheckInTime(new Date().toLocaleTimeString());

    // Get location name
    getLocationName(latitude, longitude, setLocationName);

    // Call the check-in API
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      await axiosClient.post(
        API_CHECK_IN,
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Checked in successfully.");
    } catch (error) {
      console.error("Error checking in:", error);
      if (error.response) {
        Alert.alert("Error", `Server Error: ${error.response.status}`);
      } else if (error.request) {
        Alert.alert("Error", "No response from server.");
      } else {
        Alert.alert("Error", `Error: ${error.message}`);
      }
    }
  };

  // check out
  const handleCheckOut = async () => {
    if (!isCheckedIn) {
      Alert.alert("Error", "You are not checked in.");
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;

    setCheckOutTime(new Date().toLocaleTimeString());
    setCheckOutLocation(location);
    getLocationName(latitude, longitude, setCheckOutLocationName);
    setIsCheckedIn(false);
    setTimer(0);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      await axiosClient.post(
        API_CHECK_OUT,
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Checked out successfully.");
    } catch (error) {
      console.error("Error checking out:", error);
      if (error.response) {
        Alert.alert("Error", `Server Error: ${error.response.status}`);
      } else if (error.request) {
        Alert.alert("Error", "No response from server.");
      } else {
        Alert.alert("Error", `Error: ${error.message}`);
      }
    }
  };

  // check location every 1 min
  useEffect(() => {
    let timerInterval;
    let locationInterval;

    if (isCheckedIn) {
      timerInterval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      locationInterval = setInterval(async () => {
        const location = await Location.getCurrentPositionAsync({});

        const { latitude, longitude } = location.coords;
        const distance = getDistance(
          latitude,
          longitude,
          officeLocation.latitude,
          officeLocation.longitude
        );

        if (distance > CHECK_IN_RADIUS_METERS) {
          Alert.alert(
            "Warning!",
            "You moved out of range. Auto check-out activated."
          );

          setTimeout(() => {
            handleCheckOut();
          }, 3000);

          // handleCheckOut();
          clearInterval(timerInterval);
          clearInterval(locationInterval);
        }
      }, 60000);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(locationInterval);
    };
  }, [isCheckedIn, officeLocation]);

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Check-In</Text>
      <Text>🕒 Current Time: {currentTime}</Text>
      {userData && <Text>{`Hello, ${userData.name}`}</Text>}

      {isCheckedIn ? (
        <>
          <Text>✅ Checked In</Text>
          <Text>⏳ Timer: {formatTimer(timer)}</Text>
          <Text>
            📍 Location: {location?.coords.latitude},{" "}
            {location?.coords.longitude}
          </Text>
          <Text>📍 Address: {locationName || "Fetching..."}</Text>
          <Text>🕒 Check-in Time: {checkInTime}</Text>
          <Button title="Check Out" onPress={handleCheckOut} />
        </>
      ) : (
        <>
          <Button
            title="Check In"
            onPress={handleCheckIn}
            disabled={!isUserDataLoaded}
          />
          {checkOutTime && (
            <>
              <Text>🚪 Last Check-Out Time: {checkOutTime}</Text>
              <Text>
                📍 Last Check-Out Location: {checkOutLocation?.coords.latitude},{" "}
                {checkOutLocation?.coords.longitude}
              </Text>
              <Text>
                📍 Last Check-Out Address:{" "}
                {checkOutLocationName || "Fetching..."}
              </Text>
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;
