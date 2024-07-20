# Typing Animation to WebM Video

## Project Overview

This project is a web application that allows users to input text into a textbox, simulate typing this text on a canvas, and generate a `.webm` video of the typing animation. Users can start, pause, resume, and stop the typing simulation. Once the simulation is complete, the video can be previewed and downloaded.

## Technologies Used

- **HTML5**: Provides the structure for the web page.
- **CSS3**: Used for basic styling of the web elements.
- **JavaScript (ES6)**: Implements the core functionality of the typing simulation and video generation.
- **MediaRecorder API**: Captures the canvas stream and generates the `.webm` video file.

## Key Features

- **Text Input**: Users can input any text to be animated.
- **Typing Simulation**: Simulates typing of the input text on a canvas with proper text wrapping.
- **Video Generation**: Uses the MediaRecorder API to record the canvas animation and generate a `.webm` video.
- **Playback and Download**: Allows users to preview the generated video and download it as a `.webm` file.
- **Control Buttons**: Provides buttons to start, pause, resume, and stop the typing simulation.