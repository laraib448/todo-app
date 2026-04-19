const API = 'http://localhost:3000';

async function loadTasks() {
    const response = await fetch(`${API}/api/tasks`);
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title' + (task.status === 'completed' ? ' completed' : '');
        titleSpan.textContent = task.title;
        titleSpan.onclick = () => toggleStatus(task.id, task.status);

        const statusSpan = document.createElement('span');
        statusSpan.className = `status ${task.status === 'completed' ? 'completed-status' : 'pending'}`;
        statusSpan.textContent = task.status;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteTask(task.id);

        div.appendChild(titleSpan);
        div.appendChild(statusSpan);
        div.appendChild(deleteBtn);
        taskList.appendChild(div);
    });
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (!title) { alert('Please enter a task'); return; }

    await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    input.value = '';
    loadTasks();
}

async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    await fetch(`${API}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    loadTasks();
}

async function deleteTask(id) {
    if (confirm('Delete this task?')) {
        await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' });
        loadTasks();
    }
}

loadTasks();