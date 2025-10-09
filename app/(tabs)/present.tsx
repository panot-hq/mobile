import InteractionList from "@/components/interactions/InteractionColapsableList";
import NewInteraction from "@/components/recording/NewInteractionPreview";
import RecordButton from "@/components/recording/RecordButton";
import PresentActionBar from "@/components/ui/PresentActionBar";

import { useAuth } from "@/contexts/AuthContext";
import { useInteraction } from "@/contexts/InteractionContext";
import { useRecording } from "@/contexts/RecordingContext";
import { InteractionsService } from "@/lib/database/index";
import { BlurView } from "expo-blur";
import PanotSpeechModule from "panot-speech";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function TabTwoScreen() {
  const {
    isRecording,
    setIsRecording,
    shouldBlur,
    setShouldBlur,
    isListExpanded,
    setIsListExpanded,
  } = useRecording();
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<
    number | undefined
  >();
  const [showInteraction, setShowInteraction] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const { user } = useAuth();
  const { triggerRefresh } = useInteraction();

  const blurOpacity = useSharedValue(0);
  const recordButtonOpacity = useSharedValue(1);

  useEffect(() => {
    blurOpacity.value = withSpring(shouldBlur ? 1 : 0, {
      duration: 300,
    });
  }, [shouldBlur, blurOpacity]);

  useEffect(() => {
    recordButtonOpacity.value = withTiming(isListExpanded ? 0 : 1, {
      duration: 300,
    });
  }, [isListExpanded, recordButtonOpacity]);

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
    const sub = PanotSpeechModule.addListener("onTranscriptUpdate", (event) => {
      setTranscript(event.transcript);
    });

    const volumnSub = PanotSpeechModule.addListener(
      "onVolumeChange",
      (event) => {
        setVolume(event.volume);
      }
    );

    return () => {
      sub.remove();
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
    setShowInteraction(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
  };

  const handleAcceptTranscription = async (acceptedTranscript: string) => {
    if (user) {
      const interaction = await InteractionsService.create({
        raw_content: acceptedTranscript,
        key_concepts: "",
        owner_id: user.id,
      });

      if (interaction.error) {
        console.error(interaction.error);
      } else {
        triggerRefresh();
      }
    }

    setTranscript("");
    setShowInteraction(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
  };

  const handleRejectTranscription = () => {
    setShowInteraction(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 25,
      }}
    >
      <PresentActionBar />

      <InteractionList onExpandedChange={setIsListExpanded} />
      <View
        style={{
          marginVertical: 30,
          height: 1,
          width: "80%",
        }}
      />
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
        <BlurView
          intensity={40}
          style={{
            flex: 1,
          }}
        />
      </Animated.View>

      {showInteraction && (
        <NewInteraction
          isRecording={isRecording}
          onCancel={handleCancelRecording}
          onAccept={handleAcceptTranscription}
          onReject={handleRejectTranscription}
          showButtons={showButtons}
        />
      )}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 140,
            right: 25,
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
        />
      </Animated.View>
    </View>
  );
}
