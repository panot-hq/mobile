import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.jpg")}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff", // Match your app's background
  },
  icon: {
    width: 120,
    height: 120,
  },
});
