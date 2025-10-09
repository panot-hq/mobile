import React from "react";
import { Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "90%",
        height: 52,
        borderWidth: 1,
        borderColor: "#D92D20",
        backgroundColor: "#FEF3F2",
        padding: 12,
        borderRadius: 8,
      }}
    >
      {text1 && (
        <Text
          style={{
            color: "#D92D20",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{
            color: "white",
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
  success: ({ text1, text2 }: CustomToastProps) => (
    <View
      style={{
        position: "absolute",
        top: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "90%",
        height: 52,
        borderWidth: 1,
        borderColor: "#ABEFC6",
        backgroundColor: "#ECFDF3",
        padding: 12,
        borderRadius: 8,
      }}
    >
      {text1 && (
        <Text
          style={{
            color: "#067647",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{
            color: "white",
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
  delete: ({ text1, text2 }: CustomToastProps) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "90%",
        height: 52,
        borderWidth: 1,
        borderColor: "#D92D20",
        backgroundColor: "#FEF3F2",
        padding: 12,
        borderRadius: 8,
      }}
    >
      {text1 && (
        <Text
          style={{
            color: "#D92D20",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{
            color: "white",
          }}
        >
          {text2}
        </Text>
      )}
    </View>
  ),
};

export default toastConfig;
