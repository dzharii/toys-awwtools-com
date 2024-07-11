
"use strict";

const tasks = window.dataChallenges;
const taskPaths = window.dataChallengePath;
let savedTasks = JSON.parse(localStorage.getItem("tasks")) || tasks;

document.addEventListener("DOMContentLoaded", () => {
    const taskTreeElement = document.getElementById("task-tree");
    const taskTitleElement = document.getElementById("task-title");
    const taskDescriptionElement = document.getElementById("task-description");
    const taskDetailsElement = document.getElementById("task-details");
    let holdTimeout;

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(savedTasks));
    }

    function clearHoldTimeout() {
        if (holdTimeout) {
            clearTimeout(holdTimeout);
            holdTimeout = null;
        }
    }

    function createTaskNode(task) {
        const taskNode = document.createElement("div");
        taskNode.className = `task-node ${task.completed ? "completed" : ""}`;
        taskNode.textContent = task.title;
        taskNode.dataset.id = task.id;
        taskNode.tabIndex = 0;

        taskNode.addEventListener("click", () => {
            taskTitleElement.textContent = task.title;
            taskDescriptionElement.textContent = task.description;
            taskDetailsElement.classList.add("active");
        });

        taskNode.addEventListener("mousedown", (event) => {
            clearHoldTimeout();
            taskNode.classList.add("holding");
            holdTimeout = setTimeout(() => {
                task.completed = true;
                saveTasks();
                renderTaskTree();
            }, 2000);
        });

        taskNode.addEventListener("mouseup", (event) => {
            clearHoldTimeout();
            taskNode.classList.remove("holding");
        });

        taskNode.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                taskTitleElement.textContent = task.title;
                taskDescriptionElement.textContent = task.description;
                taskDetailsElement.classList.add("active");
            }
        });

        taskNode.addEventListener("keyup", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                taskNode.classList.add("holding");
                holdTimeout = setTimeout(() => {
                    task.completed = true;
                    saveTasks();
                    renderTaskTree();
                }, 2000);
            }
        });

        taskNode.addEventListener("blur", (event) => {
            clearHoldTimeout();
            taskNode.classList.remove("holding");
        });

        return taskNode;
    }

    function renderTasks(taskList, parentElement) {
        taskList.forEach(task => {
            const taskNode = createTaskNode(task);
            parentElement.appendChild(taskNode);
            if (taskPaths[task.id] && taskPaths[task.id].length > 0) {
                const childTasks = taskPaths[task.id].map(id => savedTasks.find(t => t.id === id));
                renderTasks(childTasks, taskNode);
            }
        });
    }

    function renderTaskTree() {
        taskTreeElement.innerHTML = "";
        const rootTasks = savedTasks.filter(task => !Object.values(taskPaths).flat().includes(task.id));
        renderTasks(rootTasks, taskTreeElement);
    }

    renderTaskTree();
});

