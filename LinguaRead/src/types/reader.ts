export type StoryLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ReaderParagraph = {
  id: string;
  story_id: string;
  order_index: number;
  text_src: string;
  text_tgt: string;
  audio_url: string | null;
};

export type ReaderStory = {
  id: string;
  title: string;
  level: StoryLevel;
  topic: string;
  lang: string;
  paragraphs: ReaderParagraph[];
};

export type DictionaryEntry = {
  translation: string;
  pronunciation?: string;
  example?: string;
};
