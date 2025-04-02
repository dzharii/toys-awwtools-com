// Tile data for the GPT Prompt Executor application
const tilesData = [
  {
    title: "Grammar Correction",
    description: "Correct the grammar of your text while preserving its style.",
    icon: "📝",
    category: "Editing",
    promptTemplate: "Please correct the grammar in the following text:\n[[[component=textarea, name=inputText, placeholder=\"Enter your text here\", rows=5, width=\"100%\"]]]\nThank you."
  },
  {
    title: "Summarize Text",
    description: "Get a concise summary of any long text.",
    icon: "📚",
    category: "Summarization",
    promptTemplate: "Summarize the text below:\n[[[component=textarea, name=summaryInput, placeholder=\"Paste your text here\", rows=4, width=\"100%\"]]]\nProvide a clear and concise summary."
  }
];

