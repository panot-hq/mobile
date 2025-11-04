import PanotSpeechModule from "panot-speech";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function FadingTranscript({
  isRecording,
  onTranscriptUpdate,
  previousTranscript = "",
}: {
  isRecording?: boolean;
  onTranscriptUpdate?: (transcript: string) => void;
  previousTranscript?: string;
}) {
  const [transcript, setTranscript] = useState(previousTranscript);
  const [words, setWords] = useState<
    { word: string; key: string; fade: boolean }[]
  >([]);
  const prevTranscript = useRef(previousTranscript);

  useEffect(() => {
    if (previousTranscript && !isRecording) {
      setTranscript(previousTranscript);
    }
  }, [previousTranscript, isRecording]);

  useEffect(() => {
    if (previousTranscript) {
      const segments = previousTranscript.split(/(\n)/);
      const initialWords: { word: string; key: string; fade: boolean }[] = [];
      let globalIdx = 0;

      segments.forEach((segment) => {
        if (segment === "\n") {
          initialWords.push({
            word: "\n",
            key: `newline-${globalIdx}`,
            fade: false,
          });
          globalIdx++;
        } else if (segment.trim()) {
          const words = segment.split(" ").filter(Boolean);
          words.forEach((word) => {
            initialWords.push({
              word,
              key: `${word}-${globalIdx}`,
              fade: false,
            });
            globalIdx++;
          });
        }
      });

      setWords(initialWords);
      prevTranscript.current = previousTranscript;
    } else if (!previousTranscript && !isRecording) {
      // Si no hay previousTranscript y no se está grabando, limpiar
      setWords([]);
      setTranscript("");
      prevTranscript.current = "";
    }
  }, [previousTranscript, isRecording]);

  useEffect(() => {
    if (!isRecording) return;

    const transcriptSub = PanotSpeechModule.addListener(
      "onTranscriptUpdate",
      (event) => {
        let fullTranscript = event.transcript;

        if (previousTranscript) {
          // Respetar los saltos de línea y espacios existentes
          const needsSeparator = !previousTranscript.match(/[\s\n]$/);
          const separator = needsSeparator ? " " : "";
          fullTranscript = previousTranscript + separator + event.transcript;
        }

        setTranscript(fullTranscript);
        if (onTranscriptUpdate) {
          onTranscriptUpdate(fullTranscript);
        }
      }
    );

    return () => {
      transcriptSub.remove();
    };
  }, [isRecording, onTranscriptUpdate, previousTranscript]);

  useEffect(() => {
    if (transcript !== prevTranscript.current) {
      // Dividir el texto respetando saltos de línea
      const segments = transcript.split(/(\n)/);
      const allWords: { word: string; key: string; fade: boolean }[] = [];

      const prevSegments = prevTranscript.current.split(/(\n)/);
      let globalIdx = 0;
      let prevGlobalIdx = 0;

      segments.forEach((segment, segIdx) => {
        if (segment === "\n") {
          allWords.push({
            word: "\n",
            key: `newline-${globalIdx}`,
            fade: segIdx >= prevSegments.length,
          });
          globalIdx++;
        } else if (segment.trim()) {
          const words = segment.split(" ").filter(Boolean);
          const prevWords =
            prevSegments[segIdx]?.split(" ").filter(Boolean) || [];

          words.forEach((word, idx) => {
            allWords.push({
              word,
              key: `${word}-${globalIdx}`,
              fade:
                segIdx >= prevSegments.length ||
                idx >= prevWords.length ||
                prevWords[idx] !== word,
            });
            globalIdx++;
          });
        }
      });

      setWords(allWords);
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
        paddingTop: 10,
        minHeight: 30,
        alignItems: "flex-start",
      }}
    >
      {words.map(({ word, key, fade }, idx) => {
        if (word === "\n") {
          return (
            <View
              key={key}
              style={{
                width: "100%",
                height: 0,
              }}
            />
          );
        }

        return fade ? (
          <Animated.Text
            key={key}
            entering={FadeIn.duration(400)}
            style={{
              fontSize: 15,
              fontWeight: "500",
              lineHeight: 22,
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
              lineHeight: 22,
              marginRight: 4,
            }}
          >
            {word}
          </Text>
        );
      })}
    </View>
  );
}
