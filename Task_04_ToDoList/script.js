document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const taskDescription = document.getElementById('taskDescription');
    const taskDate = document.getElementById('taskDate');
    const taskTime = document.getElementById('taskTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const today = new Date();
    taskDate.value = today.toISOString().split('T')[0];

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'pending') filteredTasks = tasks.filter(t => !t.completed);
        if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No ${filter === 'all' ? '' : filter} tasks found.</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            const formattedDate = new Date(task.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

            li.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-status">${task.completed ? 'Completed' : 'Pending'}</div>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-datetime">
                    <i class="far fa-calendar-alt"></i> ${formattedDate} ${task.time ? `at ${task.time}` : ''}
                </div>
                <div class="task-actions">
                    <button class="action-btn complete-btn" data-index="${index}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i> ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="action-btn edit-btn" data-index="${index}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn delete-btn" data-index="${index}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addTask() {
        const title = taskInput.value.trim();
        if (!title) {
            alert('Please enter a task title!');
            return;
        }
        tasks.push({
            title,
            description: taskDescription.value.trim(),
            date: taskDate.value,
            time: taskTime.value,
            completed: false
        });
        saveTasks();
        clearInputs();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }

    function clearInputs() {
        taskInput.value = '';
        taskDescription.value = '';
        taskTime.value = '';
        taskInput.focus();
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }

    function editTask(index) {
        const task = tasks[index];
        taskInput.value = task.title;
        taskDescription.value = task.description;
        taskDate.value = task.date;
        taskTime.value = task.time;
        tasks.splice(index, 1);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());

    taskList.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const index = btn.dataset.index;
        if (btn.classList.contains('complete-btn')) toggleComplete(index);
        if (btn.classList.contains('edit-btn')) editTask(index);
        if (btn.classList.contains('delete-btn')) deleteTask(index);
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });

    renderTasks();
});