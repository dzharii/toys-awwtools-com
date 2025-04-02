// Export the tile data array
export const tiles = [
    {
        title: "Grammar Correction",
        description: "Correct the grammar of your text while preserving its style.",
        icon: "📝",
        category: "Editing",
        promptTemplate: "Please correct the grammar in the following text:\n[[[component=textarea, name=inputText, placeholder=\"Enter your text here\", rows=5, width=\"100%\"]]]\nThank you."
    },
    {
        title: "Code Explanation",
        description: "Explain a piece of code in simple terms.",
        icon: "💻",
        category: "Programming",
        promptTemplate: "Please explain this code in simple terms:\n[[[component=textarea, name=codeInput, placeholder=\"Paste your code here\", rows=8, width=\"100%\"]]]\nExplain step by step and avoid technical jargon when possible."
    },
    {
        title: "Recipe Creator",
        description: "Generate a recipe from ingredients you have.",
        icon: "🍳",
        category: "Cooking",
        promptTemplate: "Create a recipe using these ingredients:\n[[[component=textarea, name=ingredients, placeholder=\"List your ingredients here, one per line\", rows=4, width=\"100%\"]]]\nPlease include cooking time, difficulty level, and step-by-step instructions."
    },
    {
        title: "Email Composer",
        description: "Draft a professional email based on key points.",
        icon: "📧",
        category: "Writing",
        promptTemplate: "Draft a professional email with the following details:\n- Subject: [[[component=input, name=subject, placeholder=\"Email subject\", width=\"100%\"]]]\n- Recipient: [[[component=input, name=recipient, placeholder=\"Who is this email for?\", width=\"100%\"]]]\n- Key points: [[[component=textarea, name=keyPoints, placeholder=\"List the key points to include\", rows=4, width=\"100%\"]]]\n- Tone: [[[component=input, name=tone, placeholder=\"Formal, friendly, urgent, etc.\", width=\"100%\"]]]\nPlease format it as a proper email with greeting and signature."
    },
    {
        title: "Study Notes",
        description: "Create concise study notes from your text.",
        icon: "📚",
        category: "Education",
        promptTemplate: "Convert this content into concise, well-structured study notes:\n[[[component=textarea, name=studyContent, placeholder=\"Paste the content you want to convert to study notes\", rows=6, width=\"100%\"]]]\nPlease organize with headings, bullet points, and include key concepts and definitions."
    },
    {
        title: "Translation Helper",
        description: "Translate text while explaining idiomatic expressions.",
        icon: "🌍",
        category: "Language",
        promptTemplate: "Translate the following text from [[[component=input, name=sourceLanguage, placeholder=\"Source language\", width=\"45%\"]]] to [[[component=input, name=targetLanguage, placeholder=\"Target language\", width=\"45%\"]]]\n\nText to translate:\n[[[component=textarea, name=textToTranslate, placeholder=\"Enter text to translate\", rows=5, width=\"100%\"]]]\n\nPlease explain any idiomatic expressions or cultural references in the translation."
    },
    {
        title: "Business Idea Evaluation",
        description: "Analyze the strengths and weaknesses of your business idea.",
        icon: "💡",
        category: "Business",
        promptTemplate: "Evaluate this business idea:\n[[[component=textarea, name=businessIdea, placeholder=\"Describe your business idea in detail\", rows=5, width=\"100%\"]]]\n\nTarget market: [[[component=input, name=targetMarket, placeholder=\"Who are your customers?\", width=\"100%\"]]]\n\nPlease provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) and suggest next steps."
    },
    {
        title: "Workout Planner",
        description: "Create a personalized workout plan based on your goals.",
        icon: "💪",
        category: "Fitness",
        promptTemplate: "Create a workout plan with these details:\n- Fitness goal: [[[component=input, name=fitnessGoal, placeholder=\"e.g., weight loss, muscle gain, endurance\", width=\"100%\"]]]\n- Available equipment: [[[component=input, name=equipment, placeholder=\"e.g., dumbbells, resistance bands, bodyweight only\", width=\"100%\"]]]\n- Days per week: [[[component=input, name=daysPerWeek, placeholder=\"Number of workout days per week\", width=\"100%\"]]]\n- Session length: [[[component=input, name=sessionLength, placeholder=\"Minutes per workout session\", width=\"100%\"]]]\n- Fitness level: [[[component=input, name=fitnessLevel, placeholder=\"Beginner, intermediate, advanced\", width=\"100%\"]]]\n\nPlease include warm-up, exercises with sets and reps, and cool-down stretches."
    }
];