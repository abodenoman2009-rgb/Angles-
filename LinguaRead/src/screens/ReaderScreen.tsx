import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Speech from "expo-speech";
import { SafeAreaView } from "react-native-safe-area-context";
import { WordSheet } from "@/components/WordSheet";
import { translationProvider } from "@/services/translation";
import type { DictionaryEntry, ReaderStory } from "@/types/reader";

type Props = {
  story: ReaderStory;
  explanationLanguage?: string;
  onSaveWord?: (word: string, entry: DictionaryEntry) => Promise<void> | void;
};

export function ReaderScreen({ story, explanationLanguage = "ar", onSaveWord }: Props) {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [parallel, setParallel] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [selectedWord, setSelectedWord] = useState("");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const paragraph = story.paragraphs[paragraphIndex];
  const progress = useMemo(
    () => story.paragraphs.length ? (paragraphIndex + 1) / story.paragraphs.length : 0,
    [paragraphIndex, story.paragraphs.length]
  );

  const selectWord = async (word: string) => {
    const clean = word.replace(/^[^\p{L}']+|[^\p{L}']+$/gu, "");
    if (!clean) return;
    setSelectedWord(clean);
    setEntry(null);
    setLoading(true);
    try {
      const result = await translationProvider.lookup(clean, story.lang, explanationLanguage);
      setEntry(result);
    } catch {
      setEntry({ translation: "تعذّر جلب المعنى. حاول مرة أخرى." });
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: story.lang, rate: 0.88 });
  };

  const saveWord = async () => {
    if (!entry || !selectedWord) return;
    try {
      await onSaveWord?.(selectedWord, entry);
      Alert.alert("تم", "أُضيفت الكلمة إلى بطاقاتك.");
      setSelectedWord("");
    } catch {
      Alert.alert("تعذّر الحفظ", "تحقق من اتصالك ثم حاول مجدداً.");
    }
  };

  if (!paragraph) {
    return <SafeAreaView style={styles.screen}><Text>لا توجد فقرات لهذه القصة.</Text></SafeAreaView>;
  }

  const words = paragraph.text_src.split(/(\s+)/);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => setParagraphIndex(Math.max(0, paragraphIndex - 1))} disabled={paragraphIndex === 0}>
          <Text style={[styles.back, paragraphIndex === 0 && styles.disabled]}>‹ رجوع</Text>
        </Pressable>
        <Text style={styles.level}>{story.level}</Text>
      </View>

      <Text style={styles.title}>{story.title}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>الفقرة {paragraphIndex + 1} من {story.paragraphs.length}</Text>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolButton} onPress={() => setFontSize(v => Math.max(16, v - 2))}>
          <Text style={styles.toolText}>A−</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => setFontSize(v => Math.min(30, v + 2))}>
          <Text style={styles.toolText}>A+</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => setParallel(v => !v)}>
          <Text style={styles.toolText}>{parallel ? "إخفاء الترجمة" : "عرض اللغتين"}</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => speak(paragraph.text_src)}>
          <Text style={styles.toolText}>استمع 🔊</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.instruction, { textAlign: story.lang === "ar" ? "right" : "left" }]}>
          اضغط على أي كلمة لمعرفة معناها
        </Text>
        <View style={styles.sourceBox}>
          <Text style={[styles.sourceText, { fontSize, lineHeight: fontSize * 1.75 }]}>
            {words.map((part, index) => {
              if (/^\s+$/.test(part)) return part;
              return (
                <Text key={`${index}-${part}`} onPress={() => selectWord(part)} style={styles.tappableWord}>
                  {part}
                </Text>
              );
            })}
          </Text>
        </View>
        {parallel && (
          <View style={styles.translationBox}>
            <Text style={styles.translationText}>{paragraph.text_tgt}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.nextButton, paragraphIndex === 0 && styles.secondaryButton]}
          onPress={() => {
            if (paragraphIndex < story.paragraphs.length - 1) setParagraphIndex(v => v + 1);
            else Alert.alert("أحسنت!", "أنهيت هذه القصة التجريبية.");
          }}
        >
          <Text style={[styles.nextText, paragraphIndex === 0 && styles.secondaryButtonText]}>
            {paragraphIndex === story.paragraphs.length - 1 ? "إنهاء القراءة" : "الفقرة التالية"}
          </Text>
        </Pressable>
      </View>

      <WordSheet
        visible={!!selectedWord}
        word={selectedWord}
        entry={entry}
        loading={loading}
        onClose={() => setSelectedWord("")}
        onSpeak={() => speak(selectedWord)}
        onSave={saveWord}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8F4" },
  header: { paddingHorizontal: 22, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { color: "#247A4B", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.3 },
  level: { color: "#247A4B", backgroundColor: "#E1F0E4", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontWeight: "800" },
  title: { color: "#17251B", fontSize: 25, fontWeight: "800", marginHorizontal: 22, marginTop: 20, textAlign: "right" },
  progressTrack: { height: 7, backgroundColor: "#E1E9E1", borderRadius: 8, marginHorizontal: 22, marginTop: 18, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#27945A", borderRadius: 8 },
  progressLabel: { color: "#77827A", fontSize: 12, textAlign: "right", marginHorizontal: 22, marginTop: 7 },
  toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginHorizontal: 18, marginTop: 18 },
  toolButton: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E1E9E1", borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  toolText: { color: "#365441", fontWeight: "700", fontSize: 12 },
  content: { padding: 22, paddingBottom: 30 },
  instruction: { color: "#8A958D", fontSize: 13, marginBottom: 12 },
  sourceBox: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#E6ECE5" },
  sourceText: { color: "#1F3024", textAlign: "left" },
  tappableWord: { color: "#1F3024" },
  translationBox: { backgroundColor: "#EAF3EA", borderRadius: 18, padding: 18, marginTop: 14 },
  translationText: { color: "#365441", fontSize: 18, lineHeight: 32, textAlign: "right" },
  footer: { padding: 18, borderTopWidth: 1, borderTopColor: "#E5ECE5", backgroundColor: "#F5F8F4" },
  nextButton: { backgroundColor: "#247A4B", padding: 16, borderRadius: 15, alignItems: "center" },
  nextText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  secondaryButton: { backgroundColor: "#E3EEE4" },
  secondaryButtonText: { color: "#247A4B" }
});
