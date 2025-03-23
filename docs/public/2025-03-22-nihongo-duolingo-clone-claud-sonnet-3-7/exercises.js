/**
 * Japanese Language Learning Exercises Data
 * Contains structured exercises with activities for learning Japanese
 */

// Exercise data structure with Japanese content
const exercisesData = [
    {
        id: 'basics-1',
        title: 'Basics 1',
        description: 'Learn essential Japanese phrases and greetings',
        icon: '👋',
        difficulty: 'beginner',
        activities: [
            {
                type: 'multipleChoice',
                prompt: 'Select the meaning of "こんにちは"',
                audio: 'konnichiwa.mp3',
                options: [
                    { text: 'Hello', isCorrect: true },
                    { text: 'Goodbye', isCorrect: false },
                    { text: 'Thank you', isCorrect: false },
                    { text: 'Excuse me', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "こんにちは" (Konnichiwa) means "Hello"',
                    incorrect: 'Not quite. "こんにちは" (Konnichiwa) means "Hello"'
                }
            },
            {
                type: 'typing',
                prompt: 'Type the romaji for "さようなら"',
                audio: 'sayounara.mp3',
                answer: 'sayounara',
                alternatives: ['sayonara'],
                feedback: {
                    correct: 'Great job! "さようなら" is "sayounara" which means "goodbye"',
                    incorrect: 'The correct answer is "sayounara", which means "goodbye"'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'Which is "Thank you" in Japanese?',
                options: [
                    { text: 'ありがとう', isCorrect: true },
                    { text: 'すみません', isCorrect: false },
                    { text: 'おはよう', isCorrect: false },
                    { text: 'いいえ', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "ありがとう" (Arigatou) means "Thank you"',
                    incorrect: 'Not quite. "ありがとう" (Arigatou) means "Thank you"'
                }
            },
            {
                type: 'matching',
                prompt: 'Match the Japanese greetings with their meanings',
                pairs: [
                    { left: 'おはよう', right: 'Good morning' },
                    { left: 'こんばんは', right: 'Good evening' },
                    { left: 'おやすみなさい', right: 'Good night' },
                    { left: 'はじめまして', right: 'Nice to meet you' }
                ],
                feedback: {
                    correct: 'Excellent! You matched all the greetings correctly!',
                    incorrect: 'Some matches are incorrect. Try again!'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'How do you say "Yes" in Japanese?',
                options: [
                    { text: 'はい', isCorrect: true },
                    { text: 'いいえ', isCorrect: false },
                    { text: 'わかりません', isCorrect: false },
                    { text: 'すみません', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "はい" (Hai) means "Yes"',
                    incorrect: 'Not quite. "はい" (Hai) means "Yes"'
                }
            }
        ]
    },
    {
        id: 'hiragana-1',
        title: 'Hiragana 1',
        description: 'Learn the first set of Hiragana characters',
        icon: 'あ',
        difficulty: 'beginner',
        activities: [
            {
                type: 'multipleChoice',
                prompt: 'What is this character? あ',
                options: [
                    { text: 'a', isCorrect: true },
                    { text: 'i', isCorrect: false },
                    { text: 'u', isCorrect: false },
                    { text: 'e', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "あ" is pronounced as "a"',
                    incorrect: 'Not quite. "あ" is pronounced as "a"'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'What is this character? い',
                options: [
                    { text: 'a', isCorrect: false },
                    { text: 'i', isCorrect: true },
                    { text: 'u', isCorrect: false },
                    { text: 'e', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "い" is pronounced as "i"',
                    incorrect: 'Not quite. "い" is pronounced as "i"'
                }
            },
            {
                type: 'typing',
                prompt: 'Type the romaji for the character: う',
                answer: 'u',
                feedback: {
                    correct: 'Great! "う" is pronounced as "u"',
                    incorrect: 'The correct romaji for "う" is "u"'
                }
            },
            {
                type: 'matching',
                prompt: 'Match the hiragana to their romaji',
                pairs: [
                    { left: 'え', right: 'e' },
                    { left: 'お', right: 'o' },
                    { left: 'か', right: 'ka' },
                    { left: 'き', right: 'ki' }
                ],
                feedback: {
                    correct: 'Excellent! You matched all characters correctly!',
                    incorrect: 'Some matches are incorrect. Try again!'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'Which character is "sa"?',
                options: [
                    { text: 'さ', isCorrect: true },
                    { text: 'し', isCorrect: false },
                    { text: 'す', isCorrect: false },
                    { text: 'せ', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "さ" is "sa"',
                    incorrect: 'Not quite. "さ" is "sa"'
                }
            }
        ]
    },
    {
        id: 'katakana-1',
        title: 'Katakana 1',
        description: 'Learn the first set of Katakana characters',
        icon: 'ア',
        difficulty: 'beginner',
        activities: [
            {
                type: 'multipleChoice',
                prompt: 'What is this character? ア',
                options: [
                    { text: 'a', isCorrect: true },
                    { text: 'i', isCorrect: false },
                    { text: 'u', isCorrect: false },
                    { text: 'e', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "ア" is pronounced as "a"',
                    incorrect: 'Not quite. "ア" is pronounced as "a"'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'What is this character? イ',
                options: [
                    { text: 'a', isCorrect: false },
                    { text: 'i', isCorrect: true },
                    { text: 'u', isCorrect: false },
                    { text: 'e', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "イ" is pronounced as "i"',
                    incorrect: 'Not quite. "イ" is pronounced as "i"'
                }
            },
            {
                type: 'typing',
                prompt: 'Type the romaji for the character: ウ',
                answer: 'u',
                feedback: {
                    correct: 'Great! "ウ" is pronounced as "u"',
                    incorrect: 'The correct romaji for "ウ" is "u"'
                }
            },
            {
                type: 'matching',
                prompt: 'Match the katakana to their romaji',
                pairs: [
                    { left: 'エ', right: 'e' },
                    { left: 'オ', right: 'o' },
                    { left: 'カ', right: 'ka' },
                    { left: 'キ', right: 'ki' }
                ],
                feedback: {
                    correct: 'Excellent! You matched all characters correctly!',
                    incorrect: 'Some matches are incorrect. Try again!'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'Which character is "sa" in katakana?',
                options: [
                    { text: 'サ', isCorrect: true },
                    { text: 'シ', isCorrect: false },
                    { text: 'ス', isCorrect: false },
                    { text: 'セ', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "サ" is "sa"',
                    incorrect: 'Not quite. "サ" is "sa"'
                }
            }
        ]
    },
    {
        id: 'phrases-1',
        title: 'Common Phrases',
        description: 'Learn everyday Japanese expressions',
        icon: '💬',
        difficulty: 'intermediate',
        activities: [
            {
                type: 'multipleChoice',
                prompt: 'What does "お元気ですか" mean?',
                audio: 'ogenki-desuka.mp3',
                options: [
                    { text: 'How are you?', isCorrect: true },
                    { text: 'Where are you?', isCorrect: false },
                    { text: 'What is your name?', isCorrect: false },
                    { text: 'How old are you?', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "お元気ですか" (O-genki desu ka) means "How are you?"',
                    incorrect: 'Not quite. "お元気ですか" (O-genki desu ka) means "How are you?"'
                }
            },
            {
                type: 'typing',
                prompt: 'Type the meaning of "私の名前は [your name] です"',
                answer: 'my name is',
                alternatives: ['i am called', 'my name is called', 'i am', 'i\'m called', 'i\'m'],
                feedback: {
                    correct: 'Great job! "私の名前は [your name] です" (Watashi no namae wa [your name] desu) means "My name is [your name]"',
                    incorrect: 'The phrase "私の名前は [your name] です" (Watashi no namae wa [your name] desu) means "My name is [your name]"'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'Which phrase means "I don\'t understand"?',
                options: [
                    { text: 'わかりません', isCorrect: true },
                    { text: 'すみません', isCorrect: false },
                    { text: 'どういたしまして', isCorrect: false },
                    { text: 'よろしくお願いします', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "わかりません" (Wakarimasen) means "I don\'t understand"',
                    incorrect: 'Not quite. "わかりません" (Wakarimasen) means "I don\'t understand"'
                }
            },
            {
                type: 'matching',
                prompt: 'Match these useful phrases with their meanings',
                pairs: [
                    { left: 'すみません', right: 'Excuse me/Sorry' },
                    { left: 'いただきます', right: 'Thank you for the food (before eating)' },
                    { left: 'ごちそうさまでした', right: 'Thank you for the meal (after eating)' },
                    { left: 'お願いします', right: 'Please' }
                ],
                feedback: {
                    correct: 'Excellent! You matched all phrases correctly!',
                    incorrect: 'Some matches are incorrect. Try again!'
                }
            },
            {
                type: 'typing',
                prompt: 'What is "また明日" in English?',
                answer: 'see you tomorrow',
                alternatives: ['until tomorrow', 'tomorrow again', 'see you again tomorrow'],
                feedback: {
                    correct: 'Correct! "また明日" (Mata ashita) means "See you tomorrow"',
                    incorrect: 'The phrase "また明日" (Mata ashita) means "See you tomorrow"'
                }
            }
        ]
    },
    {
        id: 'numbers-1',
        title: 'Numbers & Counting',
        description: 'Learn to count in Japanese',
        icon: '🔢',
        difficulty: 'beginner',
        activities: [
            {
                type: 'multipleChoice',
                prompt: 'What is "一" (いち) in English?',
                options: [
                    { text: '1', isCorrect: true },
                    { text: '2', isCorrect: false },
                    { text: '3', isCorrect: false },
                    { text: '4', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "一" (いち, ichi) is 1',
                    incorrect: 'Not quite. "一" (いち, ichi) is 1'
                }
            },
            {
                type: 'typing',
                prompt: 'Write the romaji for "三" (number 3)',
                answer: 'san',
                feedback: {
                    correct: 'Great! "三" (さん, san) is 3',
                    incorrect: 'The correct romaji for "三" is "san" (さん), which means 3'
                }
            },
            {
                type: 'matching',
                prompt: 'Match these Japanese numbers with their values',
                pairs: [
                    { left: '五 (ご)', right: '5' },
                    { left: '七 (なな/しち)', right: '7' },
                    { left: '九 (きゅう/く)', right: '9' },
                    { left: '十 (じゅう)', right: '10' }
                ],
                feedback: {
                    correct: 'Excellent! You matched all numbers correctly!',
                    incorrect: 'Some matches are incorrect. Try again!'
                }
            },
            {
                type: 'multipleChoice',
                prompt: 'How do you say 100 in Japanese?',
                options: [
                    { text: '百 (ひゃく)', isCorrect: true },
                    { text: '千 (せん)', isCorrect: false },
                    { text: '万 (まん)', isCorrect: false },
                    { text: '十 (じゅう)', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! "百" (ひゃく, hyaku) is 100',
                    incorrect: 'Not quite. "百" (ひゃく, hyaku) is 100'
                }
            },
            {
                type: 'typing',
                prompt: 'How do you write 1000 in Japanese kanji?',
                answer: '千',
                alternatives: ['sen'],
                feedback: {
                    correct: 'Correct! "千" (せん, sen) is 1000',
                    incorrect: 'The correct answer is "千" (せん, sen), which means 1000'
                }
            }
        ]
    }
];

// Function to get exercise by id
function getExerciseById(id) {
    return exercisesData.find(exercise => exercise.id === id);
}

// Function to get all exercises
function getAllExercises() {
    return exercisesData;
}

// Store user progress in localStorage
function saveUserProgress(exerciseId, completedActivities, score) {
    const userProgress = getUserProgress();
    
    userProgress[exerciseId] = {
        completedActivities: completedActivities,
        score: score,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('nihongo_user_progress', JSON.stringify(userProgress));
}

// Get user progress from localStorage
function getUserProgress() {
    const progress = localStorage.getItem('nihongo_user_progress');
    return progress ? JSON.parse(progress) : {};
}

// Get user's score for a specific exercise
function getExerciseScore(exerciseId) {
    const userProgress = getUserProgress();
    return userProgress[exerciseId]?.score || 0;
}

// Get user's completed activities for a specific exercise
function getCompletedActivities(exerciseId) {
    const userProgress = getUserProgress();
    return userProgress[exerciseId]?.completedActivities || 0;
}

// Get user stats (streak and points)
function getUserStats() {
    const stats = localStorage.getItem('nihongo_user_stats');
    return stats ? JSON.parse(stats) : { streak: 0, points: 0, lastActivity: null };
}

// Update user stats
function updateUserStats(pointsEarned) {
    const stats = getUserStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Update points
    stats.points += pointsEarned;
    
    // Update streak
    if (stats.lastActivity) {
        const lastActivityDate = new Date(stats.lastActivity).toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityDate === today) {
            // Already logged activity today, streak unchanged
        } else if (lastActivityDate === yesterdayStr) {
            // Activity yesterday, increment streak
            stats.streak += 1;
        } else {
            // Activity gap, reset streak
            stats.streak = 1;
        }
    } else {
        // First activity ever
        stats.streak = 1;
    }
    
    stats.lastActivity = today;
    
    localStorage.setItem('nihongo_user_stats', JSON.stringify(stats));
    return stats;
}

