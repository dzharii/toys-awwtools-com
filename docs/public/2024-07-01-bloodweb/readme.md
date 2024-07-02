# The Challenge Tree
Date: 2024-07-01



## Detailed Implementation Specification for Hierarchical Interactive Task List Application

---

## Table of Contents

1. Introduction
    1.1 Purpose
    1.2 Application Overview
2. User Interface Design
    2.1 Layout Overview
    2.2 Task Tree Design
    2.3 Task Details Design
3. User Interaction Design
    3.1 Viewing Tasks
    3.2 Viewing Task Details
    3.3 Completing Tasks
4. Use Cases
    4.1 Initial Setup and Task Definition
    4.2 Navigating the Task Tree
    4.3 Interacting with Task Nodes
    4.4 Task Completion Animation
5. Technical Requirements
    5.1 Data Persistence
    5.2 State Management
6. Accessibility Considerations

---

## 1. Introduction

### 1.1 Purpose

This document provides a detailed implementation specification for developing a hierarchical interactive task list application. The application is designed to serve as an interactive TODO list for connected tasks, offering an engaging and intuitive user experience with rich animations and persistent state storage.

### 1.2 Application Overview

The application will feature a task tree on the left side and task details on the right side of a full-screen layout. Users will be able to click on task nodes to view descriptions and hold nodes to complete tasks. Task completion will trigger a visual animation. All task data and completion states will be stored locally in the browser to maintain state across sessions.

---

## 2. User Interface Design

### 2.1 Layout Overview

The user interface will be divided into two main sections:
- **Left Panel (Task Tree):** This panel will display the hierarchical task tree, allowing users to navigate through tasks and subtasks.
- **Right Panel (Task Details):** This panel will display detailed information about the selected task, including the task title and description.

### 2.2 Task Tree Design

- **Node Structure:** Task nodes will be displayed in a hierarchical structure, visually connected to represent their relationships.
- **Node Appearance:**
  - **Default State:** Task nodes will display the task title.
  - **Completed State:** Completed task nodes will have a distinct visual indicator (e.g., a checkmark or color change).
  - **Hover State:** Nodes will change appearance when hovered over to indicate interactivity.

### 2.3 Task Details Design

- **Title Display:** The task title will be prominently displayed at the top of the right panel.
- **Description Display:** The task description will be shown below the title, providing detailed information about the task.
- **Responsive Design:** The layout will adjust for different screen sizes, ensuring a consistent experience across devices.

---

## 3. User Interaction Design

### 3.1 Viewing Tasks

- **Initial View:** On loading the application, the left panel will display the root tasks of the tree.
- **Scrolling:** Users can scroll through the task tree if it exceeds the visible area of the left panel.

### 3.2 Viewing Task Details

- **Click Event:** Clicking on a task node will update the right panel with the task's title and description.
  - **Visual Feedback:** The selected task node will be highlighted to indicate it is currently active.
  - **Content Update:** The right panel will show the corresponding task details, updating the title and description fields.

### 3.3 Completing Tasks

- **Hold Event:** Users will hold down the mouse button on a task node for a specified duration (e.g., 2 seconds) to mark it as complete.
  - **Progress Indicator:** While holding, a visual indicator (e.g., an expanding circle) will show the progress of task completion.
  - **Completion Feedback:** Upon completion, the task node will change appearance to indicate it is completed, and the state will be saved.

---

## 4. Use Cases

### 4.1 Initial Setup and Task Definition

- **Task Definition File:** Tasks will be defined programmatically in a separate JavaScript file (`challenges.js`). This file will contain an array of task objects, each with a unique ID, title, description, and completion state.
- **Example Structure:**
  ```javascript
  window.dataChallenges = [
      { id: 1, title: 'Number of Islands', description: 'Solve the Number of Islands problem on LeetCode.', completed: false },
      { id: 2, title: 'Course Schedule', description: 'Solve the Course Schedule problem on LeetCode.', completed: false },
      { id: 3, title: 'Find the Town Judge', description: 'Solve the Find the Town Judge problem on LeetCode.', completed: false },
      { id: 4, title: 'Graph Valid Tree', description: 'Solve the Graph Valid Tree problem on LeetCode.', completed: false },
      { id: 5, title: 'Find Whether Path Exists in Graph', description: 'Solve the Find Whether Path Exists in Graph problem on LeetCode.', completed: false },
      { id: 6, title: 'Course Schedule II', description: 'Solve the Course Schedule II problem on LeetCode.', completed: false },
      { id: 7, title: 'Minimum Height Trees', description: 'Solve the Minimum Height Trees problem on LeetCode.', completed: false },
      { id: 8, title: 'All Paths From Source to Target', description: 'Solve the All Paths From Source to Target problem on LeetCode.', completed: false },
      { id: 9, title: 'Reconstruct Itinerary', description: 'Solve the Reconstruct Itinerary problem on LeetCode.', completed: false },
      { id: 10, title: 'Sequence Reconstruction', description: 'Solve the Sequence Reconstruction problem on LeetCode.', completed: false },
      { id: 11, title: 'Alien Dictionary', description: 'Solve the Alien Dictionary problem on LeetCode.', completed: false }
  ];
  
  window.dataChallengePath = {
      1: [2, 3],     // Number of Islands leads to Course Schedule and Find the Town Judge
      2: [4],        // Course Schedule leads to Graph Valid Tree
      3: [4],        // Find the Town Judge leads to Graph Valid Tree
      4: [5],        // Graph Valid Tree leads to Find Whether Path Exists in Graph
      5: [6, 7],     // Find Whether Path Exists in Graph leads to Course Schedule II and Minimum Height Trees
      6: [8],        // Course Schedule II leads to All Paths From Source to Target
      7: [8],        // Minimum Height Trees leads to All Paths From Source to Target
      8: [9, 10],    // All Paths From Source to Target leads to Reconstruct Itinerary and Sequence Reconstruction
      9: [11],       // Reconstruct Itinerary leads to Alien Dictionary
      10: [11],      // Sequence Reconstruction leads to Alien Dictionary
      11: []         // Alien Dictionary has no further tasks
  };
  ```

### 4.2 Navigating the Task Tree

- **Expanding Nodes:** If a task node has subtasks (as defined in the adjacency list), it will visually indicate that it can be expanded. Clicking on it will reveal the subtasks below it.
- **Collapsing Nodes:** Clicking on an expanded task node will collapse it, hiding the subtasks.
- **Navigation Feedback:** The interface will provide visual feedback when nodes are expanded or collapsed to enhance user experience.

### 4.3 Interacting with Task Nodes

- **Selecting a Task:** Clicking on any task node will:
  - Highlight the selected node.
  - Display the task title and description in the right panel.
- **Task Details Update:** The right panel will update dynamically to show details of the selected task, maintaining a smooth and responsive user experience.

### 4.4 Task Completion Animation

- **Initiating Completion:** Holding down the mouse button on a task node will start the completion process.
- **Visual Animation:** An expanding circle animation will show the progress. If the user releases the mouse button before the animation completes, the task will not be marked as completed.
- **Completion Confirmation:** If the user holds the mouse button for the full 2 seconds, the task is marked as complete, triggering a visual change (e.g., color change or checkmark), and the completion state is saved in local storage.

---

## 5. Technical Requirements

### 5.1 Data Persistence

- **Local Storage:** The application will use `localStorage` to save the state of completed tasks. This ensures that task completion states persist across browser sessions.
- **Data Structure:** The data will be stored in a JSON format, maintaining the hierarchical structure of tasks and subtasks.

### 5.2 State Management

- **Initial Load:** On initial load, the application will check `localStorage` for existing task data. If found, it will load the tasks from local storage; otherwise, it will load from the `challenges.js` file.
- **State Update:** Any changes to task states (e.g., marking a task as complete) will update the local storage immediately to ensure persistence.

---

## 6. Accessibility Considerations

- **Keyboard Navigation:** Ensure that all interactive elements are accessible via keyboard for users who cannot use a mouse.
- **Screen Readers:** Provide appropriate ARIA labels and roles to ensure compatibility with screen readers, allowing visually impaired users to interact with the application.
- **Color Contrast:** Use high contrast colors for text and interactive elements to enhance visibility for users with visual impairments.
- **Responsive Design:** Ensure that the application layout adjusts correctly for different screen sizes and orientations, providing a consistent experience across devices.

---

### Detailed Use Case Example: Navigating and Completing a

 Task

**User Scenario:**
- **Initial Setup:** The user opens the application for the first time. The task tree is populated with tasks defined in the `challenges.js` file.
- **Viewing Tasks:** The user scrolls through the task tree and clicks on "Number of Islands". The right panel updates to show the title "Number of Islands" and its description.
- **Expanding Subtasks:** The user notices an indicator that "Number of Islands" has subtasks. They click on the node, and "Course Schedule" and "Find the Town Judge" subtasks are revealed.
- **Viewing Subtask Details:** The user clicks on "Course Schedule". The right panel updates to show its title and description.
- **Completing a Subtask:** The user holds down the mouse button on the "Course Schedule" node. An expanding circle animation begins. After holding for 2 seconds, the task node changes appearance to indicate completion, and the state is saved in local storage.
- **Revisiting the Application:** The next day, the user reopens the application. The task tree loads, showing "Course Schedule" as completed, maintaining the state from the previous session.

---

### Interaction Details for Task Completion Animation

- **Mouse Down Event:** When the user presses and holds the mouse button on a task node, a timestamp is recorded to track the duration of the hold.
- **Visual Feedback:** An expanding circle animation begins immediately, providing visual feedback that the task is in the process of being completed.
- **Mouse Up Event:** If the user releases the mouse button before the 2-second threshold, the animation stops, and the task remains incomplete.
- **Completion Confirmation:** If the user holds the mouse button for the full 2 seconds, the task is marked as complete, triggering a visual change (e.g., color change or checkmark), and updating the state in local storage.

---

This detailed implementation specification provides all the necessary information for a web developer to build the hierarchical interactive task list application. The focus on functionality, interaction, and user experience ensures that the final product will be intuitive, engaging, and aligned with the intended use case.
