document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');
    const fileInput = document.getElementById('fileInput');
    const addFileBtn = document.getElementById('addFileBtn');

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Render existing todos
    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const todoItem = createTodoElement(todo, index);
            todoList.appendChild(todoItem);
        });
    }

    // Create todo element
    function createTodoElement(todo, index) {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.draggable = true;

        if (todo.image) {
            const img = document.createElement('img');
            img.src = todo.image;
            todoItem.appendChild(img);
        }

        const todoContent = document.createElement('div');
        todoContent.className = 'todo-content';
        todoContent.textContent = todo.text;
        todoItem.appendChild(todoContent);

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editTodo(todoContent);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTodo(index);

        // Add drag and drop functionality
        todoItem.addEventListener('dragstart', () => {
            todoItem.classList.add('dragging');
        });

        todoItem.addEventListener('dragend', () => {
            todoItem.classList.remove('dragging');
        });

        todoItem.appendChild(editBtn);
        todoItem.appendChild(deleteBtn);

        return todoItem;
    }

    // Add new todo
    function addTodo(text = null, file = null) {
        const todoText = text || todoInput.value.trim();
        if (todoText === '' && !file) return;

        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        
        const todoSpan = document.createElement('span');
        todoSpan.className = 'todo-text';
        todoSpan.textContent = todoText;

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editTodo(todoSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => todoItem.remove();

        todoItem.appendChild(todoSpan);

        // Add file attachment if present
        if (file) {
            const fileContainer = document.createElement('div');
            fileContainer.className = 'file-container';

            if (file.type.startsWith('image/')) {
                // Handle image files
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'attached-image';
                fileContainer.appendChild(img);
            } else {
                // Handle other file types
                const fileLink = document.createElement('a');
                fileLink.href = URL.createObjectURL(file);
                fileLink.download = file.name;
                fileLink.className = 'file-link';
                fileLink.innerHTML = `📎 ${file.name} (${formatFileSize(file.size)})`;
                fileContainer.appendChild(fileLink);
            }

            todoItem.appendChild(fileContainer);
        }

        todoItem.appendChild(editBtn);
        todoItem.appendChild(deleteBtn);
        todoList.appendChild(todoItem);

        todoInput.value = '';
    }

    // Delete todo
    function deleteTodo(index) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }

    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Add file functionality
    addFileBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileUpload);

    // Add task button functionality
    addTodoBtn.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (text) {
            addTodo(text);
        }
    });

    // Add task on Enter key
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = todoInput.value.trim();
            if (text) {
                addTodo(text);
            }
        }
    });

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name;
        addTodo(`Attached file: ${fileName}`, file);
        fileInput.value = ''; // Reset file input
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Drag and drop functionality
    todoList.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const siblings = [...todoList.querySelectorAll('.todo-item:not(.dragging)')];
        
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            return e.clientY <= box.top + box.height / 2;
        });

        todoList.insertBefore(draggingItem, nextSibling);
    });

    todoList.addEventListener('dragend', () => {
        const todoItems = [...document.querySelectorAll('.todo-item')];
        todos = todoItems.map(item => ({
            text: item.querySelector('.todo-content').textContent,
            image: item.querySelector('img')?.src || null
        }));
        saveTodos();
    });

    function editTodo(todoSpan) {
        const currentText = todoSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';

        // Replace the span with input
        todoSpan.parentNode.replaceChild(input, todoSpan);
        input.focus();

        // Handle saving the edited text
        input.addEventListener('blur', function() {
            const newText = this.value.trim();
            if (newText !== '') {
                todoSpan.textContent = newText;
            }
            input.parentNode.replaceChild(todoSpan, input);
        });

        // Save on Enter key
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
    }

    // Initial render
    renderTodos();
}); 