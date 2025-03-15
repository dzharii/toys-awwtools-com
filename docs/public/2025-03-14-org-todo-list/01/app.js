
document.addEventListener('DOMContentLoaded', () => {
    const taskListEl = document.getElementById('task-list');
    const orgEditorEl = document.getElementById('org-editor');
    const errorBarEl = document.getElementById('error-bar');
    
    let tasks = loadTasks();

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
        try {
            const lines = orgEditorEl.value.split('\n');
            tasks = lines.reduce((acc, line) => {
                if (line.startsWith('*')) {
                    const match = line.match(/\* (TODO|DONE) (.+?) ?:(.*?):?/);
                    if (match) {
                        const [, status, title, tags] = match;
                        acc.push({
                            title: title.trim(),
                            completed: status === 'DONE',
                            tags: tags || '',
                            deadline: '',
                            notes: ''
                        });
                    }
                }
                return acc;
            }, []);
            saveTasks();
            renderTasks();
        } catch (error) {
            displayError('Failed to parse Org mode content.');
        }
    }

    const debouncedParse = debounce(parseOrgMode, 300);

    document.getElementById('add-task-btn').addEventListener('click', addTask);
    orgEditorEl.addEventListener('input', debouncedParse);

    function addTask() {
        const title = document.getElementById('task-title').value.trim();
        const deadline = document.getElementById('task-deadline').value;
        const tags = document.getElementById('task-tags').value;
        const notes = document.getElementById('task-notes').value;
        
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


