
let tasks = JSON.parse(localStorage.getItem('tasks')) || initialTasks;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTask(task, parentElement) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item${task.completed ? ' completed' : ''}`;
    taskItem.innerHTML = `
        <span>${task.name}</span>
        <div>
            <button onclick="toggleComplete(${task.id})">✔</button>
            <button onclick="deleteTask(${task.id})">✖</button>
        </div>
    `;
    parentElement.appendChild(taskItem);

    if (task.subtasks && task.subtasks.length > 0) {
        const subtaskContainer = document.createElement('div');
        subtaskContainer.className = 'subtask-container';
        task.subtasks.forEach(subtask => renderTask(subtask, subtaskContainer));
        parentElement.appendChild(subtaskContainer);
    }
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => renderTask(task, taskList));
}

function addTask(name) {
    if (!validateTaskInput(name)) return;

    const newTask = {
        id: Date.now(),
        name: name,
        completed: false,
        subtasks: []
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function toggleComplete(taskId) {
    const task = findTaskById(taskId, tasks);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function findTaskById(id, taskList) {
    for (let task of taskList) {
        if (task.id === id) return task;
        if (task.subtasks.length > 0) {
            const subtask = findTaskById(id, task.subtasks);
            if (subtask) return subtask;
        }
    }
    return null;
}

function validateTaskInput(taskName) {
    if (!taskName || taskName.trim() === '') {
        alert('Task name cannot be empty.');
        return false;
    }
    return true;
}

document.getElementById('add-task-btn').addEventListener('click', () => {
    const taskNameInput = document.getElementById('task-name-input');
    const taskName = taskNameInput.value;
    addTask(taskName);
    taskNameInput.value = '';
});

window.addEventListener('load', renderTasks);


