# Japanese Story Reader - Specification Document

Date: 2025-03-22

## Project Overview
The Japanese Story Reader is an interactive web application designed to help users learn Japanese through reading traditional Japanese fairy tales. The application presents Japanese text sentence-by-sentence, paired with "Yoda-style" English translations that preserve Japanese syntax, making it easier for learners to understand the structure of Japanese language. At regular intervals, users are prompted to select the correct word to continue the story, reinforcing vocabulary acquisition and maintaining engagement.

## Technical Stack
- **Frontend**: HTML5, CSS3, ES6+ JavaScript
- **Storage**: LocalStorage for user progress and settings
- **Dependencies**: Google Fonts (Nunito, Noto Sans JP)
- **Execution Environment**: Client-side browser application

## Core Features

| Feature | Description | Status | Implementation Notes |
|---------|-------------|--------|----------------------|
| Story Selection | Grid of available Japanese fairy tales with progress indicators | Implemented | Stories are defined in stories.js with metadata and full content |
| Sentence-by-Sentence Reading | Display one Japanese sentence at a time with animations | Implemented | Uses setTimeout with configurable reading speed |
| Side-by-Side Translation | Japanese text in black with "Yoda-style" English translation in gray | Implemented | CSS styling differentiates original text from translation |
| Word Prompts | Periodic challenges to select the correct next word | Implemented | Configurable frequency through settings |
| Furigana Support | Reading aids for kanji characters | Implemented | Custom function attaches furigana to kanji |
| Reading Speed Control | Slider to adjust the pace of sentence display | Implemented | Dynamically adjusts setTimeout duration |
| Progress Tracking | Track completed sentences and correct answers | Implemented | Uses localStorage to maintain state between sessions |
| Play/Pause Controls | Ability to pause and resume the reading flow | Implemented | Toggle mechanism for the reading timer |
| Settings Panel | Configurable options for reading experience | Implemented | Modal interface with persistent user preferences |
| Completion Statistics | Summary of performance after finishing a story | Implemented | Tracks time spent, accuracy, and other metrics |

## User Interface Components

| Component | Description | Implementation |
|-----------|-------------|----------------|
| Header | App name, progress bar, and control buttons | Fixed position with progress indicator |
| Story Selection Screen | Grid of story cards with metadata and progress | Uses CSS Grid for responsive layout |
| Reading Screen | Current story with animated sentence display | Sentence container with fade-in animations |
| Word Prompt Modal | Interactive challenge to select the correct word | Modal overlay with multiple choice options |
| Settings Modal | User preferences for reading experience | Form controls with localStorage persistence |
| Completion Screen | Performance summary with statistics | Score circle and detailed metrics |
| Footer | Basic information | Fixed position at bottom of viewport |

## Story Content Structure

### Story Format
Each story is structured with:
- Metadata (title, difficulty, icon)
- Array of sentences
- Each sentence contains:
  - Japanese original text (ja)
  - English "Yoda-style" translation (en)
  - Optional word prompt object for interactive challenges

### Word Prompt Format
Word prompts consist of:
- Context sentence with blank for the missing word
- Correct word to be selected
- Array of options (including the correct answer)

### Current Stories
1. **Momotaro (Peach Boy)** - Beginner level
2. **Princess Kaguya** - Intermediate level
3. **Urashima Taro** - Beginner level

## Implementation Process

### 1. Project Structure Setup
- Created basic HTML structure with screens for different application states
- Implemented CSS styling with variables for consistent theming
- Set up JavaScript files for separation of concerns

### 2. Story Data Structure
- Designed a comprehensive data structure for stories in stories.js
- Each story contains metadata and an array of sentences
- Word prompts are embedded within relevant sentences
- Added furigana support through a mapping system

### 3. Story Selection Screen
- Implemented a grid layout for story cards
- Each card displays story metadata and completion progress
- Added click handlers to start reading selected stories

### 4. Reading Engine
- Developed a reading system that displays sentences sequentially
- Implemented animation for smooth transitions between sentences
- Created a timing system based on sentence length and user reading speed
- Added play/pause functionality for user control

### 5. Word Prompts
- Created an overlay system for word challenge prompts
- Implemented shuffle algorithm for random option order
- Added feedback system for correct/incorrect answers
- Connected prompt completion to story progression

### 6. Settings and Configuration
- Built a settings modal with user preferences
- Implemented localStorage persistence for settings
- Created UI controls for adjusting reading experience
- Connected settings to the reading engine behavior

### 7. Progress Tracking
- Designed a progress tracking system using localStorage
- Implemented statistics collection during reading
- Created completion screen with performance metrics
- Ensured progress persists between sessions

### 8. Styling and Animations
- Applied consistent styling across all components
- Added animations for sentence transitions and modals
- Created responsive design for various screen sizes
- Implemented Japanese-specific typography considerations

### 9. Security Measures
- Added input sanitization to prevent XSS attacks
- Implemented Content Security Policy
- Added protection against clickjacking

## Data Storage

### User Progress
- Story completion status
- Correct answer count
- Total prompts attempted
- Last updated timestamp

### User Settings
- Reading speed preference
- Word prompt frequency
- Furigana display toggle
- Audio volume setting

## Security Considerations
- Input sanitization to prevent XSS attacks
- Content Security Policy implementation
- Protection against clickjacking with X-Frame-Options

## Accessibility Features
- Semantic HTML structure
- High contrast text with readable font sizes
- Configurable reading speed for different ability levels
- Support for keyboard navigation

## Future Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Audio Narration | Native speaker pronunciation of Japanese text | High |
| Additional Stories | Expand the library of Japanese fairy tales | High |
| User Accounts | Cloud sync of progress across devices | Medium |
| Vocabulary List | Compilation of words encountered in stories | Medium |
| Speaking Practice | Voice recognition for pronunciation | Medium |
| Custom Stories | Allow users to create their own stories | Low |
| Difficulty Levels | More granular control over content complexity | Low |

## Known Limitations
1. Limited initial story selection
2. Simplified furigana implementation (not using a proper Japanese language parsing library)
3. No actual audio support implemented (structure only)
4. No backend synchronization (purely local storage)
5. Limited to fairy tales rather than contemporary content

## Testing Guidelines
- Verify sentence display timing at different reading speeds
- Ensure word prompts appear at the configured frequency
- Test progress saving and loading across browser sessions
- Confirm responsive layout on different device sizes
- Validate settings persistence and application