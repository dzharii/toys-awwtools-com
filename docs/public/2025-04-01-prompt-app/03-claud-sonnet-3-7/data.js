const promptTiles = [
    {
        title: "Grammar Correction",
        description: "Correct the grammar of your text while preserving its style.",
        icon: "📝",
        category: "Editing",
        promptTemplate: "Please correct the grammar in the following text. Preserve the style and tone of the original writing:\n\n[[[component=textarea, name=inputText, label=Text to Correct, description=Paste the text you want to have grammar corrected, placeholder=\"Enter your text here\", rows=5, width=\"100%\"]]]\n\nReturn only the corrected version without explanations."
    },
    {
        title: "Code Explainer",
        description: "Get a simple explanation of complex code.",
        icon: "💻",
        category: "Programming",
        promptTemplate: "Please explain this code in simple terms:\n\n[[[component=textarea, name=code, label=Code, description=The code snippet you want explained, placeholder=\"Paste your code here\", rows=8, width=\"100%\"]]]\n\nExplain what it does step by step as if explaining to a junior developer."
    },
    {
        title: "Email Composer",
        description: "Create a professional email based on key points.",
        icon: "📧",
        category: "Communication",
        promptTemplate: "Compose a professional email with the following details:\n\n- Subject: [[[component=input, name=subject, label=Email Subject, description=The subject line for your email, placeholder=\"Email subject\", width=\"100%\"]]]\n- Recipient: [[[component=input, name=recipient, label=Recipient, description=Who this email is addressed to, placeholder=\"Who this is for\", width=\"100%\"]]]\n- Main points: [[[component=textarea, name=points, label=Key Points, description=The main information you want to convey, placeholder=\"Key points to include\", rows=5, width=\"100%\"]]]\n- Tone: [[[component=input, name=tone, label=Tone, description=The writing style and tone of the email, placeholder=\"formal/friendly/urgent\", width=\"100%\"]]]\n\nCreate a complete, professional email with appropriate greeting and sign-off."
    },
    {
        title: "Meeting Summarizer",
        description: "Convert meeting notes into a structured summary.",
        icon: "🗓️",
        category: "Productivity",
        promptTemplate: "Create a structured summary of these meeting notes:\n\n[[[component=textarea, name=notes, label=Meeting Notes, description=The raw notes that need to be summarized, placeholder=\"Paste your meeting notes here\", rows=6, width=\"100%\"]]]\n\nInclude: key decisions, action items with owners, and any important deadlines."
    },
    {
        title: "Blog Post Outline",
        description: "Create an outline for a blog post on any topic.",
        icon: "📰",
        category: "Content",
        promptTemplate: "Create a detailed outline for a blog post with the following details:\n\n- Title: [[[component=input, name=title, label=Blog Title, description=The title of your blog post, placeholder=\"Blog post title\", width=\"100%\"]]]\n- Target audience: [[[component=input, name=audience, label=Target Audience, description=Who you're writing this blog post for, placeholder=\"Who will read this?\", width=\"100%\"]]]\n- Key points to cover: [[[component=textarea, name=keyPoints, label=Key Points, description=The main topics you want to address in your blog post, placeholder=\"Main points to address\", rows=4, width=\"100%\"]]]\n\nProvide a structured outline with introduction, main sections (with subheadings), and conclusion."
    },
    {
        title: "Technical Interview Questions",
        description: "Generate interview questions for technical roles.",
        icon: "💼",
        category: "Recruitment",
        promptTemplate: "Generate 10 technical interview questions for a [[[component=input, name=role, label=Job Role, description=The specific technical position you're hiring for, placeholder=\"Job role (e.g., Python Developer)\", width=\"100%\"]]] position.\n\nThe candidate has [[[component=input, name=experience, label=Experience Level, description=Years of experience the candidate has, placeholder=\"Years of experience\", width=\"50%\"]]] years of experience.\n\nInclude a mix of conceptual questions and practical problems. For each question, provide an ideal answer or solution approach."
    },
    {
        title: "Product Description",
        description: "Create compelling product descriptions for e-commerce.",
        icon: "🛍️",
        category: "Marketing",
        promptTemplate: "Create a compelling product description for:\n\nProduct: [[[component=input, name=product, label=Product Name, description=The name of the product you're selling, placeholder=\"Product name\", width=\"100%\"]]]\n\nKey features: [[[component=textarea, name=features, label=Key Features, description=The main selling points and features of your product, placeholder=\"List the main product features\", rows=4, width=\"100%\"]]]\n\nTarget audience: [[[component=input, name=audience, label=Target Audience, description=Who this product is intended for, placeholder=\"Who will buy this?\", width=\"100%\"]]]\n\nPrice point: [[[component=input, name=price, label=Price Range, description=The approximate price or price range, placeholder=\"Product price range\", width=\"50%\"]]]\n\nCreate a persuasive, SEO-friendly description of 100-150 words."
    },
    {
        title: "Learning Roadmap",
        description: "Create a personalized learning path for any skill.",
        icon: "🎓",
        category: "Education",
        promptTemplate: "Create a structured learning roadmap for:\n\nSkill/Topic: [[[component=input, name=skill, label=Skill or Topic, description=The skill or subject you want to learn, placeholder=\"Skill to learn\", width=\"100%\"]]]\n\nCurrent level: [[[component=input, name=currentLevel, label=Current Skill Level, description=Your current proficiency in this skill, placeholder=\"Beginner/Intermediate/Advanced\", width=\"100%\"]]]\n\nTime available per week: [[[component=input, name=timeAvailable, label=Available Time, description=How many hours you can dedicate weekly, placeholder=\"Hours per week\", width=\"50%\"]]]\n\nLearning goals: [[[component=textarea, name=goals, label=Learning Goals, description=What you hope to achieve by learning this skill, placeholder=\"What do you want to achieve?\", rows=3, width=\"100%\"]]]\n\nProvide a step-by-step roadmap with resources, practice exercises, and milestones."
    }
];