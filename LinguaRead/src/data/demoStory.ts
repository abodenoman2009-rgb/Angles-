import type { ReaderStory } from "@/types/reader";

export const demoStory: ReaderStory = {
  id: "demo-a1-morning",
  title: "A Small Morning",
  level: "A1",
  topic: "Daily life",
  lang: "en",
  paragraphs: [
    {
      id: "p1",
      story_id: "demo-a1-morning",
      order_index: 0,
      text_src: "Mina opens the window. The morning is cool, and the street is quiet.",
      text_tgt: "تفتح مينا النافذة. الصباح لطيف، والشارع هادئ.",
      audio_url: null
    },
    {
      id: "p2",
      story_id: "demo-a1-morning",
      order_index: 1,
      text_src: "She makes tea and reads a short story. Today, she learns three new words.",
      text_tgt: "تحضّر الشاي وتقرأ قصة قصيرة. تتعلم اليوم ثلاث كلمات جديدة.",
      audio_url: null
    }
  ]
};
