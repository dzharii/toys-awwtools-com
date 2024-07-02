
document.addEventListener('DOMContentLoaded', () => {
    const taskTreeElement = document.getElementById('task-tree');
    const taskTitleElement = document.getElementById('task-title');
    const taskDescriptionElement = document.getElementById('task-description');

    let tasks = window.challenges;

    // Function to render the task tree
    const renderTaskTree = (tasks, parentElement) => {
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-node';
            taskElement.innerText = task.title;

            // Check if task is completed
            if (task.completed) {
                taskElement.classList.add('completed');
            }

            // Click event to show task details
            taskElement.addEventListener('click', () => {
                taskTitleElement.innerText = task.title;
                taskDescriptionElement.innerText = task.description;
            });

            // Hold event to complete task
            taskElement.addEventListener('mousedown', () => {
                taskElement.dataset.holdStart = Date.now();
            });

            taskElement.addEventListener('mouseup', () => {
                const holdTime = Date.now() - taskElement.dataset.hholdStart;
                if (holdTime >= 2000) {
                    task.completed = true;
                    taskElement.classList.add('completed');
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                }
            });

            parentElement.appendChild(taskElement);

            if (task.subtasks) {
                renderTaskTree(task.subtasks, taskElement);
            }
        });
    };

    // Load tasks from local storage if available
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    // Render the initial task tree
    renderTaskTree(tasks, taskTreeElement);
});

