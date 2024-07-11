
// Load tasks and their relationships
const tasks = window.dataChallenges;
const taskPaths = window.dataChallengePath;

document.addEventListener("DOMContentLoaded", () => {
    const taskTreeElement = document.getElementById("task-tree");
    const taskTitleElement = document.getElementById("task-title");
    const taskDescriptionElement = document.getElementById("task-description");
    const taskDetailsElement = document.getElementById("task-details");

    let holdTimeout;

    // Load tasks from local storage if available
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || tasks;

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(savedTasks));
    }

    function renderTaskTree() {
        taskTreeElement.innerHTML = "";
        function createTaskNode(task) {
            const taskNode = document.createElement("div");
            taskNode.className = `task-node ${task.completed ? "completed" : ""}`;
            taskNode.textContent = task.title;
            taskNode.dataset.id = task.id;

            taskNode.addEventListener("click", () => {
                taskTitleElement.textContent = task.title;
                taskDescriptionElement.textContent = task.description;
                taskDetailsElement.classList.add("active");
            });

            taskNode.addEventListener("mousedown", () => {
                taskNode.classList.add("holding");
                holdTimeout = setTimeout(() => {
                    task.completed = true;
                    saveTasks();
                    renderTaskTree();
                }, 2000);
            });

            taskNode.addEventListener("mouseup", () => {
                clearTimeout(holdTimeout);
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

        renderTasks(savedTasks.filter(task => !Object.values(taskPaths).flat().includes(task.id)), taskTreeElement);
    }

    renderTaskTree();
});

