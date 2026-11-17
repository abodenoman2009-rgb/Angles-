import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { DictionaryEntry } from "@/types/reader";

type Props = {
  visible: boolean;
  word: string;
  entry: DictionaryEntry | null;
  loading: boolean;
  onClose: () => void;
  onSpeak: () => void;
  onSave: () => void;
};

export function WordSheet({ visible, word, entry, loading, onClose, onSpeak, onSave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <Text style={styles.word}>{word}</Text>
          {loading ? (
            <Text style={styles.muted}>جارٍ البحث عن المعنى…</Text>
          ) : (
            <>
              <Text style={styles.translation}>{entry?.translation ?? "لا تتوفر ترجمة بعد."}</Text>
              {!!entry?.pronunciation && <Text style={styles.muted}>{entry.pronunciation}</Text>}
              {!!entry?.example && <Text style={styles.example}>{entry.example}</Text>}
            </>
          )}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={styles.secondary} onPress={onSpeak}>
              <Text style={styles.secondaryText}>استمع 🔊</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.primary} onPress={onSave}>
              <Text style={styles.primaryText}>أضف للبطاقات</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,18,0.38)" },
  sheet: { backgroundColor: "#FFFFFF", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 34, borderTopLeftRadius: 26, borderTopRightRadius: 26, minHeight: 270 },
  handle: { width: 42, height: 5, borderRadius: 5, backgroundColor: "#D6DED6", alignSelf: "center", marginBottom: 22 },
  word: { fontSize: 25, fontWeight: "800", color: "#17251B", textAlign: "left" },
  translation: { fontSize: 20, fontWeight: "700", color: "#247A4B", marginTop: 12, textAlign: "right" },
  muted: { color: "#77827A", marginTop: 8, textAlign: "right" },
  example: { color: "#435047", fontSize: 15, marginTop: 18, lineHeight: 24, textAlign: "left" },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  primary: { flex: 1, backgroundColor: "#247A4B", padding: 14, borderRadius: 14, alignItems: "center" },
  primaryText: { color: "#FFFFFF", fontWeight: "700" },
  secondary: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#D7E1D8", alignItems: "center" },
  secondaryText: { color: "#247A4B", fontWeight: "700" }
});
