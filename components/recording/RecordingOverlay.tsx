import NewInteraction from "@/components/recording/NewInteractionPreview";
import RecordButton from "@/components/recording/RecordButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import { ProfilesService } from "@/lib/database/index";
import { useInteractions } from "@/lib/hooks/useLegendState";
import { BlurView } from "expo-blur";
import PanotSpeechModule from "panot-speech";
import React, { useEffect, useState } from "react";
import Animated, {
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
  const { isRecording, setIsRecording, shouldBlur, setShouldBlur } =
    useRecording();

  const [transcript, setTranscript] = useState("");
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
    console.log(
      "🎤 handleAcceptTranscription called with:",
      acceptedTranscript.substring(0, 50)
    );

    if (!user) {
      console.error("❌ No user found when trying to create interaction");
      return;
    }

    console.log("👤 User ID:", user.id);

    // Ensure profile exists before creating interaction
    await ProfilesService.getOrCreate(user.id);

    try {
      console.log("🔨 Creating interaction...");
      const newInteraction = createInteraction({
        raw_content: acceptedTranscript,
        key_concepts: "",
        ...(contactId && { contact_id: contactId }),
      });
      console.log("✅ Interaction created successfully:", newInteraction.id);

      if (onInteractionCreated) {
        onInteractionCreated();
      }
    } catch (error) {
      console.error("❌ Error in handleAcceptTranscription:", error);
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
            initialSize={recordButtonInitialSize}
            recordingSize={recordButtonRecordingSize}
          />
        </Animated.View>
      )}
    </>
  );
}
