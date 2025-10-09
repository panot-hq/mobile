import PanotSpeechModule from "panot-speech";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function FadingTranscript({
  isRecording,
  onTranscriptUpdate,
}: {
  isRecording?: boolean;
  onTranscriptUpdate?: (transcript: string) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [words, setWords] = useState<
    { word: string; key: string; fade: boolean }[]
  >([]);
  const prevTranscript = useRef("");

  useEffect(() => {
    if (!isRecording) return;

    const transcriptSub = PanotSpeechModule.addListener(
      "onTranscriptUpdate",
      (event) => {
        setTranscript(event.transcript);
        if (onTranscriptUpdate) {
          onTranscriptUpdate(event.transcript);
        }
      }
    );

    return () => {
      transcriptSub.remove();
    };
  }, [isRecording, onTranscriptUpdate]);

  useEffect(() => {
    if (transcript !== prevTranscript.current) {
      const prevWords = prevTranscript.current.split(" ").filter(Boolean);
      const newWords = transcript.split(" ").filter(Boolean);

      let firstNewIdx = newWords.length;
      for (let i = 0; i < newWords.length; i++) {
        if (prevWords[i] !== newWords[i]) {
          firstNewIdx = i;
          break;
        }
      }
      const fadingWords = newWords.map((word, idx) => ({
        word,
        key: `${word}-${idx}`,
        fade: idx >= firstNewIdx,
      }));
      setWords(fadingWords);
      prevTranscript.current = transcript;
    }
  }, [transcript]);

  useEffect(() => {
    if (!transcript) setWords([]);
  }, [transcript]);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%",
        padding: 10,
        minHeight: 30,
        alignItems: "center",
      }}
    >
      {words.map(({ word, key, fade }, idx) =>
        fade ? (
          <Animated.Text
            key={key}
            entering={FadeIn.duration(400)}
            style={{
              fontSize: 15,
              fontWeight: "500",
              marginRight: 4,
            }}
          >
            {word}
          </Animated.Text>
        ) : (
          <Text
            key={key}
            style={{
              fontSize: 15,
              fontWeight: "500",
              marginRight: 4,
            }}
          >
            {word}
          </Text>
        )
      )}
    </View>
  );
}
