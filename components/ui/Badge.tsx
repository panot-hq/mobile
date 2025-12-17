import { Text, View } from "react-native";

interface BadgeProps {
  title?: string;
  color?: string;
  textColor?: string;
  textSize?: number;
  marginBottom?: number;
  borderColor?: string;
  borderWidth?: number;
}
export default function Badge({
  title,
  color,
  textColor,
  textSize,
  marginBottom,
  borderColor,
  borderWidth,
}: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 20,
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 6,
        minWidth: 32,
        minHeight: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: marginBottom,
        borderColor: borderColor,
        borderWidth: borderWidth,
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: textSize,

          textAlign: "center",
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {title}
      </Text>
    </View>
  );
}
