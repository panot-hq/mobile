import { changeLanguage } from "@/lib/i18n";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import BaseButton from "../ui/BaseButton";

interface Language {
  code: string;
  name: string;
}

const LANGUAGES: Language[] = [
  { code: "es-ES", name: "Spanish" },
  { code: "en-US", name: "English" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  label?: string;
}

export default function AppLanguageSelector({
  selectedLanguage,
  label,
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const getLanguageName = (code: string) => t(`languages.${code}`);

  const selectedLanguageName = getLanguageName(selectedLanguage);
  const displayedLabel = label || t("language_selector.label");

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    rotation.value = withSpring(toValue, {
      duration: 550,
      dampingRatio: 1,
      mass: 4,
    });
    height.value = withSpring(toValue === 1 ? 1 : 0, {
      duration: 550,
      dampingRatio: 1,
      mass: 4,
    });
    setIsExpanded(!isExpanded);
  };

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(rotation.value, [0, 1], [0, 90])}deg`,
        },
      ],
    };
  });

  const expandableStyle = useAnimatedStyle(() => {
    return {
      maxHeight: interpolate(height.value, [0, 1], [0, 300]),
      opacity: height.value,
    };
  });

  const handleLanguageSelect = (languageCode: string) => {
    changeLanguage(languageCode);
    toggleExpanded();
  };

  return (
    <View>
      <BaseButton
        onPress={toggleExpanded}
        backgroundColor="transparent"
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <MaterialIcons
            name="language"
            size={20}
            color="#CCCCCC"
            style={{ marginRight: 16 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "300",
                color: "#FFFFFF",
                marginBottom: 2,
              }}
            >
              {displayedLabel}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#CCCCCC",
                fontWeight: "200",
              }}
            >
              {t("language_selector.currently_set_to", {
                language: selectedLanguageName,
              })}
            </Text>
          </View>
        </View>
        <Animated.View style={chevronStyle}>
          <MaterialIcons name="chevron-right" size={20} color="#666666" />
        </Animated.View>
      </BaseButton>

      <Animated.View
        style={[
          {
            overflow: "hidden",
          },
          expandableStyle,
        ]}
      >
        {LANGUAGES.map((language, index) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleLanguageSelect(language.code)}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              paddingLeft: 56,

              backgroundColor:
                selectedLanguage === language.code ? "#2A2A2A" : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: selectedLanguage === language.code ? "600" : "400",
                color:
                  selectedLanguage === language.code ? "#FFFFFF" : "#CCCCCC",
              }}
            >
              {getLanguageName(language.code)}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}
