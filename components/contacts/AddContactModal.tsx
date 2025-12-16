import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";

import { useTalkAboutThem } from "@/contexts/TalkAboutThemContext";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import BaseButton from "../ui/BaseButton";

interface AddContactModalProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}

export default function AddContactModal({
  bottomSheetModalRef,
}: AddContactModalProps) {
  const { t } = useTranslation();
  const { setIsOverlayVisible, isOverlayVisible } = useTalkAboutThem();

  const handleBackdropPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, [bottomSheetModalRef]);

  const handleManualCreate = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      router.push("/(contacts)/new");
    }, 200);
  }, [bottomSheetModalRef]);

  const handleTalkCreate = useCallback(() => {
    bottomSheetModalRef.current?.close();
    setTimeout(() => {
      setIsOverlayVisible(true);
    }, 300);
  }, [bottomSheetModalRef, setIsOverlayVisible]);

  const handleImportFromContacts = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      router.push("/(contacts)/import");
    }, 200);
  }, [bottomSheetModalRef]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        onPress={handleBackdropPress}
      />
    ),
    [handleBackdropPress]
  );

  if (isOverlayVisible) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={["50%", "48%"]}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableDismissOnClose={true}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#E0E0E0",
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: 20,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            color: "#333",
            textAlign: "center",
            marginBottom: 40,
            marginHorizontal: 50,
          }}
        >
          {t("contacts.add_modal.title")}
        </Text>

        <View style={{ gap: 16 }}>
          <BaseButton
            backgroundColor="#fff"
            borderRadius={25}
            borderColor="#E0E0E0"
            borderWidth={1}
            onPress={handleManualCreate}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <MaterialIcons name="add" size={24} color="black" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "black",
                    marginBottom: 4,
                  }}
                >
                  {t("contacts.add_modal.manual_title")}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  {t("contacts.add_modal.manual_subtitle")}
                </Text>
              </View>
            </View>
          </BaseButton>

          <BaseButton
            backgroundColor="#fff"
            borderRadius={25}
            borderColor="#E0E0E0"
            borderWidth={1}
            onPress={handleImportFromContacts}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <MaterialCommunityIcons name="import" size={24} color="black" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "black",
                    marginBottom: 4,
                  }}
                >
                  {t("contacts.add_modal.import_title")}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  {t("contacts.add_modal.import_subtitle")}
                </Text>
              </View>
            </View>
          </BaseButton>
          <BaseButton
            backgroundColor="#fff"
            borderRadius={25}
            borderColor="#E0E0E0"
            borderWidth={1}
            onPress={handleTalkCreate}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Octicons name="dot-fill" size={24} color="black" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "black",
                    marginBottom: 4,
                  }}
                >
                  {t("contacts.add_modal.talk_title")}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  {t("contacts.add_modal.talk_subtitle")}
                </Text>
              </View>
            </View>
          </BaseButton>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
