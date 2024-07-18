# Bingo Game Project

Date: 2024-07-17

## Overview

This project implements a Bingo game using HTML, CSS, and JavaScript. The game features a 5x5 Bingo card, an animated waterfall of numbers, and controls to manage the game flow. The primary objective is to highlight matching numbers on the Bingo card and stop the game when a Bingo row is completed.

## Requirements

### Functional Requirements

1. **Bingo Card:**
   - A 5x5 grid representing the Bingo card.
   - Each cell contains a unique random number from 1 to 99.
   - Numbers are padded with leading zeros for consistency.
   - Initially, cells are grey and turn red when they match numbers from the waterfall.

2. **Waterfall Animation:**
   - Displays up to four rows of numbers above the Bingo card.
   - Each row contains five random numbers.
   - Rows shift downwards as new rows are added at the top.
   - The bottom row disappears when a new row is added.

3. **Game Controls:**
   - **Start:** Initiates the waterfall animation.
   - **Pause:** Pauses and resumes the animation.
   - **Reset:** Generates a new Bingo card and clears the waterfall.

4. **Completion:**
   - When a Bingo row (a complete row of highlighted numbers) is achieved, the game stops.
   - The "B I N G O" headers animate with a gradient effect to indicate completion.

### Non-Functional Requirements

- Ensure smooth animations and transitions.
- Create a visually appealing and aligned layout.
- Optimize performance for efficient DOM updates.

## Development Process

### Initial Setup

- Established the basic HTML structure, including a table for the Bingo card and control buttons.
- Applied initial CSS for basic styling and layout alignment.

### Bingo Card Implementation

- Developed a JavaScript function to generate a Bingo card with unique random numbers.
- Ensured the Bingo card cells are square and properly aligned.

### Waterfall Animation

- Created a JavaScript function to generate and animate the waterfall rows.
- Implemented a cascading effect where new rows are added at the top, and older rows shift down.
- Applied CSS styles to create transparency gradients for the waterfall rows.

### Game Logic

- Implemented logic to check for matches between waterfall numbers and Bingo card numbers.
- Highlighted matching numbers in red.
- Detected completed Bingo rows and replaced the alert with a gradient animation for the headers.

### Controls and Event Handling

- Added event listeners for the start, pause, and reset buttons.
- Ensured smooth transitions and correct handling of game states.

### Performance Optimization

- Utilized `requestAnimationFrame` for smoother animations.
- Minimized DOM manipulations to prevent layout thrashing.
- Optimized event handling and state management for efficiency.

## Running the Project

To run the project, clone the repository and open `index.html` in a web browser.

## Conclusion

This project showcases the development of an interactive Bingo game with animated features. The development process focused on meeting functional requirements, ensuring smooth performance, and providing an engaging user experience through modern JavaScript best practices and CSS animations.



