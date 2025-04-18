// Handcrafted list of 30 unique GPT prompt tiles
const tiles = [
  {
    title: "🖋️ Refine Paragraph",
    description:
      "Improve clarity and flow of a given paragraph while preserving its original tone.",
    icon: "🖋️",
    category: "Editing",
    promptTemplate:
      'Please refine the following paragraph for clarity and flow: [[ [component=textarea, name=inputText, placeholder="Paste your paragraph here", rows=5, width="100%"] ]] Thank you.',
  },
  {
    title: "🖋️ Streamline Text",
    description:
      "Condense a passage into more concise sentences without losing meaning.",
    icon: "🖋️",
    category: "Editing",
    promptTemplate:
      'Please condense this text into concise sentences: [[[component=textarea, name=inputText, placeholder="Enter your text here", rows=5, width="100%"]]]',
  },
  {
    title: "🖋️ Polished Style",
    description:
      "Elevate the writing style of a draft to sound more professional and engaging.",
    icon: "🖋️",
    category: "Editing",
    promptTemplate:
      'Enhance the writing style of the following draft: [[[component=textarea, name=inputText, placeholder="Type your draft here", rows=5, width="100%"]]]',
  },
  {
    title: "🌐 Translate Formal",
    description:
      "Translate text into formal English suitable for business communications.",
    icon: "🌐",
    category: "Translation",
    promptTemplate:
      'Translate this text into formal English: [[[component=textarea, name=inputText, placeholder="Input text here", rows=5, width="100%"]]]',
  },
  {
    title: "🌐 Translate Casual",
    description: "Convert text into informal, conversational English.",
    icon: "🌐",
    category: "Translation",
    promptTemplate:
      'Rewrite the following message in a casual tone: [[[component=textarea, name=inputText, placeholder="Your message here", rows=5, width="100%"]]]',
  },
  {
    title: "🌐 Technical Localization",
    description:
      "Translate technical instructions while preserving terminology accuracy.",
    icon: "🌐",
    category: "Translation",
    promptTemplate:
      'Localize these technical instructions: [[[component=textarea, name=inputText, placeholder="Enter instructions", rows=5, width="100%"]]]',
  },
  {
    title: "📑 Executive Summary",
    description: "Summarize a long document into a concise executive summary.",
    icon: "📑",
    category: "Summarization",
    promptTemplate:
      'Provide an executive summary of the following: [[[component=textarea, name=inputText, placeholder="Paste document here", rows=8, width="100%"]]]',
  },
  {
    title: "📑 Bullet Point Summary",
    description: "Extract key points and present them as bullet items.",
    icon: "📑",
    category: "Summarization",
    promptTemplate:
      'List the main points from this text as bullet points: [[[component=textarea, name=inputText, placeholder="Enter text here", rows=8, width="100%"]]]',
  },
  {
    title: "📑 Concise Recap",
    description: "Offer a brief recap in 2–3 sentences.",
    icon: "📑",
    category: "Summarization",
    promptTemplate:
      'Provide a 2–3 sentence summary of this text: [[[component=textarea, name=inputText, placeholder="Text to summarize", rows=5, width="100%"]]]',
  },
  {
    title: "🎨 Story Starter",
    description: "Generate an engaging opening paragraph for a story idea.",
    icon: "🎨",
    category: "Creative",
    promptTemplate:
      'Write an opening paragraph for a story based on this prompt: [[[component=textarea, name=inputText, placeholder="Enter story idea", rows=5, width="100%"]]]',
  },
  {
    title: "🎨 Creative Rewrite",
    description:
      "Rewrite a dull sentence to make it more vivid and imaginative.",
    icon: "🎨",
    category: "Creative",
    promptTemplate:
      'Transform this sentence to be more vivid: [[[component=textarea, name=inputText, placeholder="Type sentence here", rows=3, width="100%"]]]',
  },
  {
    title: "🎨 Poetic Imagery",
    description: "Convert prose into a short poem with rich imagery.",
    icon: "🎨",
    category: "Creative",
    promptTemplate:
      'Turn this description into a short poem: [[[component=textarea, name=inputText, placeholder="Enter prose here", rows=5, width="100%"]]]',
  },
  {
    title: "🔍 SWOT Analysis",
    description: "Perform a SWOT analysis on the given business scenario.",
    icon: "🔍",
    category: "Analysis",
    promptTemplate:
      'Conduct a SWOT analysis for this scenario: [[[component=textarea, name=inputText, placeholder="Describe scenario", rows=6, width="100%"]]]',
  },
  {
    title: "🔍 Sentiment Breakdown",
    description: "Analyze the sentiment and tone of the text.",
    icon: "🔍",
    category: "Analysis",
    promptTemplate:
      'Analyze sentiment and tone of: [[[component=textarea, name=inputText, placeholder="Enter text here", rows=5, width="100%"]]]',
  },
  {
    title: "🔍 Market Trends",
    description: "Identify emerging trends in the provided market data.",
    icon: "🔍",
    category: "Analysis",
    promptTemplate:
      'Identify key trends from the following data: [[[component=textarea, name=inputText, placeholder="Paste data here", rows=6, width="100%"]]]',
  },
  {
    title: "💻 Code Commentator",
    description: "Add clear, concise comments to explain code functionality.",
    icon: "💻",
    category: "Code",
    promptTemplate:
      'Comment this code to explain its functionality: [[[component=textarea, name=inputText, placeholder="Paste code here", rows=8, width="100%"]]]',
  },
  {
    title: "💻 Bug Fix Suggestions",
    description: "Suggest fixes for errors found in the code snippet.",
    icon: "💻",
    category: "Code",
    promptTemplate:
      'Provide bug fix suggestions for: [[[component=textarea, name=inputText, placeholder="Enter code snippet", rows=8, width="100%"]]]',
  },
  {
    title: "💻 Code Optimization",
    description: "Recommend performance optimizations for this function.",
    icon: "💻",
    category: "Code",
    promptTemplate:
      'Optimize the following function for performance: [[[component=textarea, name=inputText, placeholder="Function code here", rows=8, width="100%"]]]',
  },
  {
    title: "📝 Grammar Expert",
    description: "Identify and correct grammatical errors in the text.",
    icon: "📝",
    category: "Grammar",
    promptTemplate:
      'Correct grammatical mistakes in: [[[component=textarea, name=inputText, placeholder="Enter text here", rows=5, width="100%"]]]',
  },
  {
    title: "📝 Verb Tense Advisor",
    description: "Ensure verb tenses are consistent and appropriate.",
    icon: "📝",
    category: "Grammar",
    promptTemplate:
      'Improve verb tense consistency in: [[[component=textarea, name=inputText, placeholder="Text to check", rows=5, width="100%"]]]',
  },
  {
    title: "📝 Punctuation Check",
    description: "Review text for punctuation accuracy and clarity.",
    icon: "📝",
    category: "Grammar",
    promptTemplate:
      'Check and correct punctuation in: [[[component=textarea, name=inputText, placeholder="Enter text here", rows=5, width="100%"]]]',
  },
  {
    title: "🔄 Paraphrase Formal",
    description: "Rewrite text in a formal academic style.",
    icon: "🔄",
    category: "Paraphrase",
    promptTemplate:
      'Paraphrase this passage in formal academic style: [[[component=textarea, name=inputText, placeholder="Enter passage", rows=5, width="100%"]]]',
  },
  {
    title: "🔄 Paraphrase Casual",
    description: "Convert text into a more relaxed, conversational tone.",
    icon: "🔄",
    category: "Paraphrase",
    promptTemplate:
      'Rewrite the following casually: [[[component=textarea, name=inputText, placeholder="Input text here", rows=5, width="100%"]]]',
  },
  {
    title: "🔄 Simplify Language",
    description: "Rewrite complex text so it's easy to understand.",
    icon: "🔄",
    category: "Paraphrase",
    promptTemplate:
      'Simplify this text for a general audience: [[[component=textarea, name=inputText, placeholder="Enter complex text", rows=5, width="100%"]]]',
  },
  {
    title: "❓ FAQ Generator",
    description: "Generate a set of frequently asked questions and answers.",
    icon: "❓",
    category: "QuestionAnswering",
    promptTemplate:
      'Create a FAQ list from: [[[component=textarea, name=inputText, placeholder="Topic description", rows=5, width="100%"]]]',
  },
  {
    title: "❓ Contextual Q&A",
    description: "Answer questions based on the provided context text.",
    icon: "❓",
    category: "QuestionAnswering",
    promptTemplate:
      'Answer questions using this context: [[[component=textarea, name=inputText, placeholder="Paste context here", rows=5, width="100%"]]]',
  },
  {
    title: "❓ Interview Prep",
    description: "Generate practice interview questions and ideal answers.",
    icon: "❓",
    category: "QuestionAnswering",
    promptTemplate:
      'Produce interview questions and answers for: [[[component=textarea, name=inputText, placeholder="Role or topic", rows=5, width="100%"]]]',
  },
  {
    title: "💡 Idea Expansion",
    description: "Expand a brief idea into a detailed concept outline.",
    icon: "💡",
    category: "Brainstorm",
    promptTemplate:
      'Expand this idea into a concept outline: [[[component=textarea, name=inputText, placeholder="Enter idea here", rows=5, width="100%"]]]',
  },
  {
    title: "💡 Feature Brainstorm",
    description: "Brainstorm potential features for a product or service.",
    icon: "💡",
    category: "Brainstorm",
    promptTemplate:
      'List possible features for: [[[component=textarea, name=inputText, placeholder="Describe product/service", rows=5, width="100%"]]]',
  },
  {
    title: "💡 Creative Brainstorm",
    description: "Generate creative ideas around a theme.",
    icon: "💡",
    category: "Brainstorm",
    promptTemplate:
      'Generate creative ideas for: [[[component=textarea, name=inputText, placeholder="Enter theme", rows=5, width="100%"]]]',
  },
];

globalThis.tiles = tiles;
