document.addEventListener('DOMContentLoaded', () => {
    const taskListEl = document.getElementById('task-list');
    const orgEditorEl = document.getElementById('org-editor');
    const errorBarEl = document.getElementById('error-bar');
    
    let tasks = loadTasks();
    let lastValidTasks = [...tasks]; // Preserve last valid state

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    function displayError(message) {
        errorBarEl.textContent = message;
        errorBarEl.style.display = 'block';
    }

    errorBarEl.addEventListener('click', () => {
        errorBarEl.style.display = 'none';
    });

    function loadTasks() {
        try {
            const data = localStorage.getItem('tasks');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            displayError('Failed to load tasks from local storage.');
            return [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
            displayError('Failed to save tasks to local storage.');
        }
    }

    function renderTasks() {
        taskListEl.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.title} ${task.deadline ? `(Due: ${task.deadline})` : ''}`;
            li.className = task.completed ? 'done' : '';
            li.onclick = () => toggleTaskStatus(index);
            taskListEl.appendChild(li);
        });
        renderOrgMode();
    }

    function renderOrgMode() {
        const orgText = tasks.map(task => {
            const status = task.completed ? 'DONE' : 'TODO';
            const deadline = task.deadline ? `DEADLINE: <${task.deadline}>` : '';
            const tags = task.tags ? `:${task.tags}:` : '';
            const notes = task.notes || '';
            return `* ${status} ${task.title} ${tags}\n${deadline}\n${notes}`;
        }).join('\n\n');
        orgEditorEl.value = orgText;
    }

    function parseOrgMode() {
        const lines = orgEditorEl.value.split('\n');
        const parsedTasks = [];
        let currentTask = null;

        try {
            lines.forEach(line => {
                const trimmedLine = line.trim();

                // Detect the start of a new task
                const taskMatch = trimmedLine.match(/^\* (TODO|DONE) (.+?)(?::(.*):)?$/);
                if (taskMatch) {
                    if (currentTask) parsedTasks.push(currentTask);
                    const [, status, title, tags = ''] = taskMatch;
                    currentTask = {
                        title: title.trim(),
                        completed: status === 'DONE',
                        tags: tags.trim(),
                        deadline: '',
                        notes: ''
                    };
                } 
                // Detect deadline
                else if (trimmedLine.startsWith('DEADLINE:')) {
                    currentTask.deadline = trimmedLine.match(/<(.+?)>/)?.[1] || '';
                }
                // Treat any other line as a note
                else if (currentTask && trimmedLine) {
                    currentTask.notes += (currentTask.notes ? '\n' : '') + trimmedLine;
                }
            });

            if (currentTask) parsedTasks.push(currentTask);

            // If parsing resulted in valid tasks, save them
            if (parsedTasks.length) {
                tasks = parsedTasks;
                lastValidTasks = [...tasks];
                saveTasks();
                renderTasks();
            } else {
                throw new Error('No valid tasks detected.');
            }
        } catch (error) {
            tasks = [...lastValidTasks];
            renderTasks();
            displayError('Parsing error. Check syntax and try again.');
        }
    }

    const debouncedParse = debounce(parseOrgMode, 500);

    document.getElementById('add-task-btn').addEventListener('click', addTask);
    orgEditorEl.addEventListener('input', debouncedParse);

    function addTask() {
        const title = document.getElementById('task-title').value.trim();
        const deadline = document.getElementById('task-deadline').value;
        const tags = document.getElementById('task-tags').value.trim();
        const notes = document.getElementById('task-notes').value.trim();

        if (!title) {
            displayError('Task title cannot be empty.');
            return;
        }

        tasks.push({ title, deadline, tags, notes, completed: false });
        saveTasks();
        renderTasks();
    }

    function toggleTaskStatus(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    renderTasks();
});

