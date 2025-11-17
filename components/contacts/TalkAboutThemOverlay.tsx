import NewContactPreview, {
  ActionButton,
} from "@/components/contacts/NewContactPreview";
import RecordButton from "@/components/recording/RecordButton";
import { useSettings } from "@/contexts/SettingsContext";
import { useTalkAboutThem } from "@/contexts/TalkAboutThemContext";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import PanotSpeechModule from "panot-speech";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface TalkAboutThemOverlayProps {
  recordButtonPosition?: {
    bottom?: number;
    right?: number;
  };
  recordButtonInitialSize?: number;
  recordButtonRecordingSize?: number;
}

export default function TalkAboutThemOverlay({
  recordButtonPosition = { bottom: 140, right: 25 },
  recordButtonInitialSize = 155,
  recordButtonRecordingSize = 200,
}: TalkAboutThemOverlayProps) {
  const { transcriptionLanguage } = useSettings();
  const {
    isRecording,
    setIsRecording,
    shouldBlur,
    setShouldBlur,
    isOverlayVisible,
    setIsOverlayVisible,
  } = useTalkAboutThem();

  const [transcript, setTranscript] = useState("");
  const [previousTranscript, setPreviousTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<
    number | undefined
  >();
  const [showPreview, setShowPreview] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const blurOpacity = useSharedValue(0);
  const recordButtonOpacity = useSharedValue(1);

  // Auto-start recording when overlay becomes visible
  useEffect(() => {
    if (isOverlayVisible && !hasAutoStarted && !isRecording) {
      // Add a small delay to ensure modal is fully closed
      const timer = setTimeout(() => {
        setHasAutoStarted(true);
        startRecording();
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isOverlayVisible) {
      setHasAutoStarted(false);
    }
  }, [isOverlayVisible, hasAutoStarted, isRecording]);

  useEffect(() => {
    blurOpacity.value = withSpring(shouldBlur ? 1 : 0, {
      duration: 300,
    });
  }, [shouldBlur, blurOpacity]);

  useEffect(() => {
    if (!isRecording && recordingStartTime && showPreview) {
      const timer = setTimeout(() => {
        const hasContent = transcript.trim() || previousTranscript.trim();
        if (!hasContent) {
          setShowPreview(false);
          setTranscript("");
          setPreviousTranscript("");
          setRecordingStartTime(undefined);
          setShowButtons(false);
          setShouldBlur(false);
          setIsOverlayVisible(false);
          setHasAutoStarted(false);
        } else {
          if (transcript.trim() && transcript !== previousTranscript) {
            setPreviousTranscript(transcript);
          }
          setShowButtons(true);
          setShouldBlur(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    } else if (isRecording) {
      setShowButtons(false);
      setShouldBlur(true);
    }
  }, [
    isRecording,
    recordingStartTime,
    transcript,
    previousTranscript,
    showPreview,
    setShouldBlur,
    setIsOverlayVisible,
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

  useEffect(() => {
    if (!isRecording) return;

    const transcriptSub = PanotSpeechModule.addListener(
      "onTranscriptUpdate",
      (event) => {
        let fullTranscript = event.transcript;

        if (previousTranscript) {
          const needsSeparator = !previousTranscript.match(/[\s\n]$/);
          const separator = needsSeparator ? " " : "";
          fullTranscript = previousTranscript + separator + event.transcript;
        }

        setTranscript(fullTranscript);
      }
    );

    return () => {
      transcriptSub.remove();
    };
  }, [isRecording, previousTranscript]);

  const startRecording = async () => {
    const result = await PanotSpeechModule.requestPermissions();

    if (result.status === "granted") {
      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setShowPreview(true);
      PanotSpeechModule.startTranscribing(true, transcriptionLanguage);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    PanotSpeechModule.stopTranscribing();
    setIsRecording(false);
    if (transcript.trim()) {
      setPreviousTranscript(transcript);
    } else if (previousTranscript.trim()) {
      setPreviousTranscript(previousTranscript);
    }
  };

  const continueRecording = async () => {
    const result = await PanotSpeechModule.requestPermissions();

    if (result.status === "granted") {
      setShowButtons(false);
      const currentTranscript = transcript.trim() || previousTranscript.trim();
      if (currentTranscript) {
        setPreviousTranscript(currentTranscript);
      }
      PanotSpeechModule.startTranscribing(true, transcriptionLanguage);
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
    setShowPreview(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
    setIsOverlayVisible(false);
    setHasAutoStarted(false);
  };

  const handleAcceptTranscription = useCallback(
    async (acceptedTranscript: string) => {
      setTranscript("");
      setPreviousTranscript("");
      setShowPreview(false);
      setRecordingStartTime(undefined);
      setShowButtons(false);
      setShouldBlur(false);
      setIsOverlayVisible(false);
      setHasAutoStarted(false);

      setTimeout(() => {
        router.push({
          pathname: "/(contacts)/new",
          params: {
            transcript: acceptedTranscript,
            mode: "talkAboutThem",
          },
        });
      }, 100);
    },
    [setIsOverlayVisible, setShouldBlur]
  );

  const handleRejectTranscription = useCallback(() => {
    setTranscript("");
    setPreviousTranscript("");
    setShowPreview(false);
    setRecordingStartTime(undefined);
    setShowButtons(false);
    setShouldBlur(false);
    setIsOverlayVisible(false);
    setHasAutoStarted(false);
  }, [setIsOverlayVisible, setShouldBlur]);

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

  if (!isOverlayVisible) return null;

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
        pointerEvents={showButtons ? "auto" : "box-none"}
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

      {showPreview && (
        <NewContactPreview
          isRecording={isRecording}
          onCancel={handleCancelRecording}
          showButtons={showButtons}
          previousTranscript={previousTranscript}
          onTranscriptUpdate={setTranscript}
          actions={actions}
        />
      )}

      {showPreview && (
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
