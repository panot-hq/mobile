import AssignInteractionButton from "@/components/interactions/AssignInteractionButton";
import NewInteraction, {
  ActionButton,
} from "@/components/recording/NewInteractionPreview";
import RecordButton from "@/components/recording/RecordButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import { ProfilesService } from "@/lib/database/index";
import { useContacts, useInteractions } from "@/lib/hooks/useLegendState";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import PanotSpeechModule from "panot-speech";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface RecordingOverlayProps {
  onInteractionCreated?: () => void;
  contactId?: string;
  recordButtonPosition?: {
    bottom?: number;
    right?: number;
  };
  hideRecordButton?: boolean;
  recordButtonInitialSize?: number;
  recordButtonRecordingSize?: number;
}

export default function RecordingOverlay({
  onInteractionCreated,
  contactId,
  recordButtonPosition = { bottom: 140, right: 25 },
  hideRecordButton = false,
  recordButtonInitialSize = 155,
  recordButtonRecordingSize = 200,
}: RecordingOverlayProps) {
  const { user } = useAuth();
  const { createInteraction } = useInteractions();
  const { getContact } = useContacts();
  const {
    isRecording,
    setIsRecording,
    shouldBlur,
    setShouldBlur,
    assignedContactId,
    setAssignedContactId,
  } = useRecording();

  const [transcript, setTranscript] = useState("");
  const [previousTranscript, setPreviousTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<
    number | undefined
  >();
  const [showInteraction, setShowInteraction] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const blurOpacity = useSharedValue(0);
  const recordButtonOpacity = useSharedValue(1);

  useEffect(() => {
    blurOpacity.value = withSpring(shouldBlur ? 1 : 0, {
      duration: 300,
    });
  }, [shouldBlur, blurOpacity]);

  useEffect(() => {
    if (!isRecording && recordingStartTime && showInteraction) {
      if (!transcript.trim()) {
        setShowInteraction(false);
        setTranscript("");
        setRecordingStartTime(undefined);
        setShowButtons(false);
        setShouldBlur(false);
      } else {
        setShowButtons(true);
        setShouldBlur(true);
      }
    } else if (isRecording) {
      setShowButtons(false);
      setShouldBlur(true);
    }
  }, [
    isRecording,
    recordingStartTime,
    transcript,
    showInteraction,
    setShouldBlur,
  ]);

  useEffect(() => {
    const volumnSub = PanotSpeechModule.addListener(
      "onVolumeChange",
      (event) => {
        setVolume(event.volume);
      }
    );

    return () => {
      volumnSub.remove();
    };
  }, []);

  const startRecording = async () => {
    const result = await PanotSpeechModule.requestPermissions();

    if (result.status === "granted") {
      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setShowInteraction(true);
      PanotSpeechModule.startTranscribing(true, "es-ES");
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    PanotSpeechModule.stopTranscribing();
    setIsRecording(false);
    setPreviousTranscript(transcript);
  };

  const continueRecording = async () => {
    const result = await PanotSpeechModule.requestPermissions();

    if (result.status === "granted") {
      setShowButtons(false);
      setPreviousTranscript(transcript);
      PanotSpeechModule.startTranscribing(true, "es-ES");
      setIsRecording(true);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleCancelRecording = () => {
    stopRecording();
    setTranscript("");
    setPreviousTranscript("");
    setShowInteraction(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
    setAssignedContactId(null);
  };

  const handleAcceptTranscription = useCallback(
    async (acceptedTranscript: string) => {
      if (user) {
        await ProfilesService.getOrCreate(user.id);

        const finalContactId = assignedContactId ?? contactId ?? null;

        try {
          createInteraction({
            raw_content: acceptedTranscript,
            key_concepts: "",
            deleted: false,
            contact_id: finalContactId,
          });

          if (onInteractionCreated) {
            onInteractionCreated();
          }
        } catch (error) {
          console.error("Error creating interaction:", error);
        }

        setTranscript("");
        setPreviousTranscript("");
        setShowInteraction(false);
        setRecordingStartTime(undefined);
        setShowButtons(false);
        setShouldBlur(false);
        setAssignedContactId(null);
      }
    },
    [
      user,
      assignedContactId,
      contactId,
      createInteraction,
      onInteractionCreated,
      setAssignedContactId,
      setShouldBlur,
    ]
  );

  const handleRejectTranscription = useCallback(() => {
    setTranscript("");
    setPreviousTranscript("");
    setShowInteraction(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
    setAssignedContactId(null);
  }, [setAssignedContactId, setShouldBlur]);

  const assignedContact = useMemo(() => {
    if (!assignedContactId) return null;
    return getContact(assignedContactId);
  }, [assignedContactId]);

  const actions: ActionButton[] = useMemo(
    () => [
      {
        label: "Rechazar",
        onPress: () => handleRejectTranscription(),
        variant: "secondary",
        icon: "close",
      },
      {
        label: "Aceptar",
        onPress: (transcript) => handleAcceptTranscription(transcript),
        variant: "primary",
        icon: "check",
      },
    ],
    [handleRejectTranscription, handleAcceptTranscription]
  );

  const animatedBlurStyle = useAnimatedStyle(() => {
    return {
      opacity: blurOpacity.value,
    };
  });

  const animatedRecordButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: recordButtonOpacity.value,
    };
  });

  return (
    <>
      <Animated.View
        style={[
          animatedBlurStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 500,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
          <BlurView
            intensity={40}
            style={{
              flex: 1,
            }}
          />
        </Pressable>
      </Animated.View>

      {showInteraction && (
        <>
          <NewInteraction
            isRecording={isRecording}
            onCancel={handleCancelRecording}
            showButtons={showButtons}
            previousTranscript={previousTranscript}
            onTranscriptUpdate={setTranscript}
            actions={actions}
          />
          {!contactId && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={{
                position: "absolute",
                top: 400,
                alignSelf: "center",
                width: "87%",
                zIndex: 2000,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(245, 245, 245, 0.8)",
                  borderRadius: 22,
                  padding: 20,

                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginBottom: 5,
                    }}
                  >
                    Associated contact
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#000",
                      fontWeight: "500",
                    }}
                  >
                    {assignedContact
                      ? `${assignedContact.first_name} ${assignedContact.last_name}`
                      : "Unassigned"}
                  </Text>
                </View>
                <AssignInteractionButton
                  onPress={() =>
                    router.push("/(interactions)/assign?mode=recording")
                  }
                />
              </View>
            </Animated.View>
          )}
        </>
      )}

      {!hideRecordButton && (
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: recordButtonPosition.bottom,
              right: recordButtonPosition.right,
              zIndex: 2000,
              elevation: 2000,
            },
            animatedRecordButtonStyle,
          ]}
        >
          <RecordButton
            onPress={toggleRecording}
            isRecording={isRecording}
            volume={volume}
            disabled={showButtons}
            onDisabledPress={continueRecording}
            initialSize={recordButtonInitialSize}
            recordingSize={recordButtonRecordingSize}
          />
        </Animated.View>
      )}
    </>
  );
}
