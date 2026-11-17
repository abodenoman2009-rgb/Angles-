import React from "react";
import { ReaderScreen } from "@/screens/ReaderScreen";
import { demoStory } from "@/data/demoStory";

export default function Index() {
  return <ReaderScreen story={demoStory} />;
}
