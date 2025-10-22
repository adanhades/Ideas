// Clase principal para manejar la aplicación TODO
class TodoApp {
    constructor() {
        this.accessKey = 'I2D0E2A5S';
        this.currentUser = this.loadCurrentUser();
        this.users = {
            hades: {
                name: 'Hades',
                avatar: 'hades.jpg',
                description: 'Señor del Inframundo'
            },
            reiger: {
                name: 'Reiger',
                avatar: 'reiger.jpg',
                description: 'Guerrero del Espacio'
            }
        };
        
        this.tasks = this.loadTasks();
        this.taskTypes = this.loadTaskTypes();
        this.editingTaskId = null;
        this.parentTaskId = null;
        this.viewMode = localStorage.getItem('viewMode') || 'table';
        this.theme = this.loadTheme();
        this.emojiPickerInitialized = false;
        
        // Lista de emojis para selector
        this.emojis = [
            '📝', '✅', '📌', '🎯', '⭐', '🔥', '💡', '🚀', '⚡', '🎨',
            '📚', '💼', '🏠', '🛒', '🏥', '💪', '🎮', '🎵', '📱', '💻',
            '🍕', '☕', '🌟', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎓',
            '✈️', '🚗', '🏃', '⚽', '🎸', '📷', '🎬', '📖', '✏️', '📊',
            '💰', '💳', '🔧', '🔨', '🎤', '🎧', '📺', '🖥️', '⌨️', '🖱️',
            '👤', '👥', '🌍', '🌈', '☀️', '🌙', '⭐', '❤️', '💚', '💙'
        ];
        
        // Verificar llave de acceso
        const hasAccess = localStorage.getItem('hasAccess');
        if (!hasAccess) {
            this.showAccessKeyScreen();
        } else if (!this.currentUser) {
            this.showLoginScreen();
        } else {
            this.showApp();
            this.bindEvents();
            this.renderTaskTypes();
            this.renderUserFilter();
            this.renderTasks();
            this.applyTheme();
        }
    }

    // Mostrar pantalla de llave de acceso
    showAccessKeyScreen() {
        document.getElementById('accessKeyScreen').style.display = 'flex';
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'none';
        
        // Event listener para el formulario de llave
        const form = document.getElementById('accessKeyForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyAccessKey();
        });
    }

    // Verificar llave de acceso
    verifyAccessKey() {
        const input = document.getElementById('accessKeyInput');
        const error = document.getElementById('accessKeyError');
        const enteredKey = input.value.trim();
        
        if (enteredKey === this.accessKey) {
            // Acceso concedido
            localStorage.setItem('hasAccess', 'true');
            document.getElementById('accessKeyScreen').style.display = 'none';
            this.showLoginScreen();
        } else {
            // Acceso denegado
            error.style.display = 'block';
            input.value = '';
            input.classList.add('error');
            
            setTimeout(() => {
                error.style.display = 'none';
                input.classList.remove('error');
            }, 3000);
        }
    }

    // Mostrar pantalla de login
    showLoginScreen() {
        document.getElementById('accessKeyScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        
        // Agregar event listeners a los perfiles
        document.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', () => {
                const userId = card.getAttribute('data-user');
                this.login(userId);
            });
        });
    }

    // Mostrar aplicación
    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        this.updateUserDisplay();
    }

    // Login
    login(userId) {
        this.currentUser = userId;
        this.saveCurrentUser(userId);
        this.showApp();
        this.bindEvents();
        this.renderTaskTypes();
        this.renderUserFilter();
        this.renderTasks();
        this.applyTheme();
    }

    // Logout
    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showLoginScreen();
        }
    }

    // Actualizar display de usuario en header
    updateUserDisplay() {
        const user = this.users[this.currentUser];
        if (user) {
            document.getElementById('currentUserAvatar').src = user.avatar;
            document.getElementById('currentUserName').textContent = user.name;
        }
    }

    // Cargar usuario actual
    loadCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    // Guardar usuario actual
    saveCurrentUser(userId) {
        localStorage.setItem('currentUser', userId);
    }

    // Inicializar la aplicación
    init() {
        this.applyTheme();
        this.bindEvents();
        this.renderTaskTypes();
        this.renderTasks();
        this.updateStats();
    }

    // Vincular eventos del DOM
    bindEvents() {
        // Botón de logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Botones principales
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('manageTypesBtn').addEventListener('click', () => this.openTypesModal());

        // Botón de tema
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Botones de vista
        document.getElementById('cardViewBtn').addEventListener('click', () => this.switchView('card'));
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchView('table'));

        // Modal de tareas
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('closeTaskModal').addEventListener('click', () => this.closeTaskModal());

        // Modal de tipos
        document.getElementById('newTypeForm').addEventListener('submit', (e) => this.handleNewType(e));
        document.getElementById('closeTypesModal').addEventListener('click', () => this.closeTypesModal());
        document.getElementById('closeTypesModalBtn').addEventListener('click', () => this.closeTypesModal());

        // Filtros
        document.getElementById('filterType').addEventListener('change', () => this.renderTasks());
        document.getElementById('filterStatus').addEventListener('change', () => this.renderTasks());
        document.getElementById('filterPriority').addEventListener('change', () => this.renderTasks());
        document.getElementById('filterUser').addEventListener('change', () => this.renderTasks());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Modal de eliminación
        document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDelete').addEventListener('click', () => this.hideDeleteModal());

        // Cerrar modales al hacer clic fuera
        this.bindModalCloseEvents();
    }

    // Vincular eventos para cerrar modales
    bindModalCloseEvents() {
        ['deleteModal', 'taskModal', 'typesModal'].forEach(modalId => {
            document.getElementById(modalId).addEventListener('click', (e) => {
                if (e.target.id === modalId) {
                    this.closeModal(modalId);
                }
            });
        });
        
        // Cerrar emoji picker al hacer clic fuera
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emojiPicker');
            const emojiPickerBtn = document.getElementById('emojiPickerBtn');
            
            if (emojiPicker && !emojiPicker.classList.contains('hidden') && 
                !emojiPicker.contains(e.target) && 
                !emojiPickerBtn.contains(e.target)) {
                this.hideEmojiPicker();
            }
        });
    }

    // Abrir modal de tareas
    openTaskModal(parentId = null) {
        this.parentTaskId = parentId;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const parentInfo = document.getElementById('parentTaskInfo');
        
        // Mostrar usuario asignado
        const user = this.users[this.currentUser];
        document.getElementById('assignedUserAvatar').src = user.avatar;
        document.getElementById('assignedUserName').textContent = user.name;
        
        if (parentId) {
            const parentTask = this.tasks.find(t => t.id === parentId);
            title.textContent = 'Nueva Subtarea';
            parentInfo.style.display = 'flex';
            document.getElementById('parentTaskTitle').textContent = parentTask.title;
        } else {
            title.textContent = this.editingTaskId ? 'Editar Tarea' : 'Nueva Tarea';
            parentInfo.style.display = 'none';
        }
        
        modal.style.display = 'block';
        document.getElementById('taskTitle').focus();
    }

    // Cerrar modal de tareas
    closeTaskModal() {
        this.closeModal('taskModal');
        this.resetForm();
    }

    // Abrir modal de tipos
    openTypesModal() {
        document.getElementById('typesModal').style.display = 'block';
        this.renderTypesList();
        // Inicializar selector de emojis si no está inicializado
        if (!this.emojiPickerInitialized) {
            this.initEmojiPicker();
            this.emojiPickerInitialized = true;
        }
    }

    // Cerrar modal de tipos
    closeTypesModal() {
        this.closeModal('typesModal');
        this.hideEmojiPicker();
        // Limpiar formulario
        document.getElementById('newTypeForm').reset();
    }

    // Cerrar modal genérico
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Inicializar selector de emojis
    initEmojiPicker() {
        const emojiGrid = document.getElementById('emojiGrid');
        const emojiPickerBtn = document.getElementById('emojiPickerBtn');
        const emojiInput = document.getElementById('newTypeIcon');
        
        if (!emojiGrid || !emojiPickerBtn || !emojiInput) return;
        
        emojiGrid.innerHTML = '';
        
        // Agregar event listener al botón
        emojiPickerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleEmojiPicker();
        });
        
        // Agregar event listener al input para abrir el picker
        emojiInput.addEventListener('click', (e) => {
            e.stopPropagation();
            const picker = document.getElementById('emojiPicker');
            if (picker.classList.contains('hidden')) {
                this.toggleEmojiPicker();
            }
        });
        
        // Crear grid de emojis
        this.emojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => this.selectEmoji(emoji));
            emojiGrid.appendChild(emojiItem);
        });
    }

    // Toggle selector de emojis
    toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.classList.toggle('hidden');
    }

    // Ocultar selector de emojis
    hideEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.classList.add('hidden');
    }

    // Seleccionar emoji
    selectEmoji(emoji) {
        document.getElementById('newTypeIcon').value = emoji;
        this.hideEmojiPicker();
    }

    // Manejar envío del formulario de tareas
    handleSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            type: document.getElementById('taskType').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: 'pendiente',
            parentId: this.parentTaskId,
            createdAt: new Date().toISOString(),
            assignedTo: this.currentUser,
            subtasks: []
        };

        if (!taskData.title || !taskData.type) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData);
        } else {
            this.addTask(taskData);
        }

        this.closeTaskModal();
        this.renderTasks();
        this.updateStats();
    }

    // Manejar nuevo tipo de tarea
    handleNewType(e) {
        e.preventDefault();
        
        const name = document.getElementById('newTypeName').value.trim().toLowerCase();
        const icon = document.getElementById('newTypeIcon').value.trim() || '📋';
        
        if (!name) {
            alert('Por favor, ingresa un nombre para el tipo.');
            return;
        }

        if (this.taskTypes.some(type => type.id === name)) {
            alert('Este tipo ya existe.');
            return;
        }

        this.taskTypes.push({
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            icon: icon,
            custom: true
        });

        this.saveTaskTypes();
        this.renderTaskTypes();
        this.renderTypesList();
        document.getElementById('newTypeForm').reset();
    }

    // Agregar nueva tarea
    addTask(taskData) {
        const task = {
            id: this.generateId(),
            ...taskData
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.showNotification(
            taskData.parentId ? 'Subtarea agregada exitosamente' : 'Tarea agregada exitosamente', 
            'success'
        );
    }

    // Actualizar tarea existente
    updateTask(id, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...taskData,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks();
            this.showNotification('Tarea actualizada exitosamente', 'success');
        }
    }

    // Eliminar tarea y sus subtareas
    deleteTask(id) {
        this.taskToDelete = id;
        this.showDeleteModal();
    }

    // Confirmar eliminación
    confirmDelete() {
        if (this.taskToDelete) {
            // Eliminar tarea y todas sus subtareas
            this.deleteTaskAndSubtasks(this.taskToDelete);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.hideDeleteModal();
            this.showNotification('Tarea eliminada exitosamente', 'success');
            this.taskToDelete = null;
        }
    }

    // Eliminar tarea y subtareas recursivamente
    deleteTaskAndSubtasks(taskId) {
        // Encontrar y eliminar todas las subtareas
        const subtasks = this.tasks.filter(task => task.parentId === taskId);
        subtasks.forEach(subtask => {
            this.deleteTaskAndSubtasks(subtask.id);
        });
        
        // Eliminar la tarea principal
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    // Alternar estado de completado
    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const newStatus = task.status === 'completada' ? 'pendiente' : 'completada';
            task.status = newStatus;
            task.completedAt = newStatus === 'completada' ? new Date().toISOString() : null;
            
            // Si es una tarea padre y se marca como completada, marcar subtareas
            if (newStatus === 'completada') {
                this.markSubtasksComplete(id, true);
            }
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification(`Tarea marcada como ${newStatus}`, 'success');
        }
    }

    // Marcar subtareas como completadas
    markSubtasksComplete(parentId, completed) {
        const subtasks = this.tasks.filter(task => task.parentId === parentId);
        subtasks.forEach(subtask => {
            subtask.status = completed ? 'completada' : 'pendiente';
            subtask.completedAt = completed ? new Date().toISOString() : null;
            this.markSubtasksComplete(subtask.id, completed);
        });
    }

    // Editar tarea
    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskType').value = task.type;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            
            this.editingTaskId = id;
            this.parentTaskId = task.parentId;
            document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Actualizar Tarea';
            
            this.openTaskModal(task.parentId);
        }
    }

    // Agregar subtarea
    addSubtask(parentId) {
        this.openTaskModal(parentId);
    }

    // Alternar visibilidad de subtareas
    toggleSubtasks(taskId) {
        const toggleBtn = document.querySelector(`[data-toggle-subtasks="${taskId}"]`);
        const subtasksList = document.querySelector(`[data-subtasks="${taskId}"]`);
        
        if (toggleBtn && subtasksList) {
            const isCollapsed = subtasksList.classList.contains('collapsed');
            
            if (isCollapsed) {
                subtasksList.classList.remove('collapsed');
                toggleBtn.classList.remove('collapsed');
            } else {
                subtasksList.classList.add('collapsed');
                toggleBtn.classList.add('collapsed');
            }
        }
    }

    // Eliminar tipo de tarea
    deleteTaskType(typeId) {
        const typeToDelete = this.taskTypes.find(type => type.id === typeId);
        if (!typeToDelete) return;
        
        const tasksWithType = this.tasks.filter(task => task.type === typeId).length;
        let message = `¿Estás seguro de que quieres eliminar el tipo "${typeToDelete.name}"?`;
        
        if (tasksWithType > 0) {
            message += `\n\nActualmente hay ${tasksWithType} tarea(s) con este tipo.`;
        }
        
        if (confirm(message)) {
            this.taskTypes = this.taskTypes.filter(type => type.id !== typeId);
            this.saveTaskTypes();
            this.renderTaskTypes();
            this.renderTypesList();
        }
    }

    // Cambiar vista
    switchView(mode) {
        this.viewMode = mode;
        
        // Actualizar botones activos
        document.getElementById('cardViewBtn').classList.toggle('active', mode === 'card');
        document.getElementById('tableViewBtn').classList.toggle('active', mode === 'table');
        
        // Renderizar con la nueva vista
        this.renderTasks();
    }

    // Cambiar tema
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    // Aplicar tema
    applyTheme() {
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (this.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Cargar tema
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('todoTheme');
            return savedTheme || 'dark';
        } catch (error) {
            console.error('Error loading theme:', error);
            return 'dark';
        }
    }

    // Guardar tema
    saveTheme() {
        try {
            localStorage.setItem('todoTheme', this.theme);
        } catch (error) {
            console.error('Error al guardar tema:', error);
        }
    }

    // Resetear formulario
    resetForm() {
        document.getElementById('taskForm').reset();
        this.editingTaskId = null;
        this.parentTaskId = null;
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> Agregar Tarea';
    }

    // Renderizar tipos de tareas en el select
    renderTaskTypes() {
        const select = document.getElementById('taskType');
        const filterSelect = document.getElementById('filterType');
        
        // Limpiar opciones actuales (excepto la primera)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Agregar tipos al select principal
        this.taskTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = `${type.icon} ${type.name}`;
            select.appendChild(option);
        });

        // Actualizar select de filtros
        const currentFilterValue = filterSelect.value;
        while (filterSelect.children.length > 1) {
            filterSelect.removeChild(filterSelect.lastChild);
        }
        
        this.taskTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = `${type.icon} ${type.name}`;
            filterSelect.appendChild(option);
        });
        
        filterSelect.value = currentFilterValue;
    }

    // Renderizar filtro de usuarios
    renderUserFilter() {
        const filterSelect = document.getElementById('filterUser');
        const currentValue = filterSelect.value;
        
        // Limpiar opciones (excepto la primera "Todos los usuarios")
        while (filterSelect.children.length > 1) {
            filterSelect.removeChild(filterSelect.lastChild);
        }
        
        // Agregar usuarios
        Object.keys(this.users).forEach(userId => {
            const user = this.users[userId];
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = `${user.name}`;
            filterSelect.appendChild(option);
        });
        
        // Restaurar valor seleccionado
        filterSelect.value = currentValue;
    }

    // Renderizar lista de tipos en el modal
    renderTypesList() {
        const container = document.getElementById('typesList');
        container.innerHTML = '';
        
        this.taskTypes.forEach(type => {
            const typeElement = document.createElement('div');
            typeElement.className = 'type-item';
            typeElement.innerHTML = `
                <div class="type-info">
                    <span class="type-icon">${type.icon}</span>
                    <span class="type-name">${type.name}</span>
                    ${type.custom ? '<span class="type-custom">(Personalizado)</span>' : ''}
                </div>
                <div class="type-actions">
                    <button class="btn-delete-type" data-type-id="${type.id}" title="Eliminar tipo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Agregar event listener al botón de eliminar
            const deleteBtn = typeElement.querySelector('.btn-delete-type');
            deleteBtn.addEventListener('click', () => this.deleteTaskType(type.id));
            
            container.appendChild(typeElement);
        });
    }

    // Renderizar tareas
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');
        
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Renderizar según el modo de vista
        if (this.viewMode === 'table') {
            this.renderTableView(filteredTasks);
        } else {
            this.renderCardView(filteredTasks);
        }
    }

    // Renderizar vista de tarjetas
    renderCardView(filteredTasks) {
        const container = document.getElementById('tasksContainer');
        
        // Agrupar tareas por tipo (solo tareas principales, sin subtareas)
        const mainTasks = filteredTasks.filter(task => !task.parentId);
        const tasksByType = this.groupTasksByType(mainTasks);
        
        container.innerHTML = '';
        
        // Renderizar cada grupo de tipo
        Object.keys(tasksByType).forEach(type => {
            const typeGroup = this.createTypeGroup(type, tasksByType[type]);
            container.appendChild(typeGroup);
        });
    }

    // Renderizar vista de tabla
    renderTableView(filteredTasks) {
        const container = document.getElementById('tasksContainer');
        container.innerHTML = '';

        // Agrupar por tipo
        const mainTasks = filteredTasks.filter(task => !task.parentId);
        const tasksByType = this.groupTasksByType(mainTasks);

        Object.keys(tasksByType).forEach(type => {
            const typeInfo = this.taskTypes.find(t => t.id === type) || { name: type, icon: '📋' };
            
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-view';
            
            tableWrapper.innerHTML = `
                <div class="type-header">
                    <div class="type-title">
                        ${typeInfo.icon} ${typeInfo.name}
                    </div>
                    <div class="type-count">${tasksByType[type].length}</div>
                </div>
                <table class="tasks-table">
                    <thead>
                        <tr>
                            <th>Tarea</th>
                            <th>Tipo</th>
                            <th>Prioridad</th>
                            <th>Estado</th>
                            <th>Fecha Límite</th>
                            <th>Usuario</th>
                            <th>Subtareas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTableRows(tasksByType[type])}
                    </tbody>
                </table>
            `;
            
            container.appendChild(tableWrapper);
        });

        // Vincular eventos
        this.bindTableEvents();
    }

    // Renderizar filas de la tabla
    renderTableRows(tasks) {
        let html = '';
        
        tasks.forEach(task => {
            html += this.createTableRow(task, false);
            
            // Agregar subtareas
            const subtasks = this.tasks.filter(t => t.parentId === task.id);
            if (subtasks.length > 0) {
                subtasks.forEach(subtask => {
                    html += this.createTableRow(subtask, true);
                });
            }
        });
        
        return html;
    }

    // Crear fila de tabla
    createTableRow(task, isSubtask) {
        const typeInfo = this.taskTypes.find(t => t.id === task.type) || { name: task.type, icon: '📋' };
        const subtasks = this.tasks.filter(t => t.parentId === task.id);
        const hasSubtasks = subtasks.length > 0 && !isSubtask;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pendiente';
        const dueDateFormatted = task.dueDate ? this.formatDate(task.dueDate) : '-';
        
        return `
            <tr class="priority-row-${task.priority} ${isSubtask ? 'subtask-row' : ''}" 
                data-task-id="${task.id}" 
                data-parent-id="${task.parentId || ''}">
                <td class="task-title-cell ${task.status}">
                    ${this.escapeHtml(task.title)}
                    ${task.description ? `<div style="font-size: 12px; color: #666; font-weight: normal;">${this.escapeHtml(task.description)}</div>` : ''}
                </td>
                <td>
                    <span class="task-type-badge task-type-${task.type}">
                        ${typeInfo.icon} ${typeInfo.name}
                    </span>
                </td>
                <td>
                    <span class="priority-badge priority-${task.priority}">
                        ${task.priority}
                    </span>
                </td>
                <td>
                    <span class="task-status-badge status-${task.status}">
                        ${task.status === 'pendiente' ? '<i class="fas fa-clock"></i>' : '<i class="fas fa-check"></i>'} 
                        ${task.status}
                    </span>
                </td>
                <td>
                    <span class="${isOverdue ? 'overdue' : ''}">
                        ${dueDateFormatted}
                        ${isOverdue ? ' <i class="fas fa-exclamation-triangle"></i>' : ''}
                    </span>
                </td>
                <td>
                    ${task.assignedTo && this.users[task.assignedTo] ? `
                        <div class="table-user-cell">
                            <img src="${this.users[task.assignedTo].avatar}" alt="${this.users[task.assignedTo].name}" class="table-user-avatar">
                            <span>${this.users[task.assignedTo].name}</span>
                        </div>
                    ` : '<span style="color: #999;">-</span>'}
                </td>
                <td>
                    ${hasSubtasks ? `
                        <span class="subtasks-indicator">
                            <i class="fas fa-layer-group"></i> ${subtasks.length}
                        </span>
                    ` : '-'}
                </td>
                <td>
                    <div class="table-actions">
                        ${task.status === 'pendiente' ? 
                            `<button class="btn-icon btn-complete" data-action="complete" title="Completar">
                                <i class="fas fa-check"></i>
                            </button>` :
                            `<button class="btn-icon btn-undo" data-action="undo" title="Deshacer">
                                <i class="fas fa-undo"></i>
                            </button>`
                        }
                        ${!isSubtask ? `
                            <button class="btn-icon btn-subtask" data-action="addSubtask" title="Agregar subtarea">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon btn-edit" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-action="delete" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Vincular eventos de la tabla
    bindTableEvents() {
        document.querySelectorAll('.tasks-table [data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.getAttribute('data-action');
                const taskId = button.closest('tr').getAttribute('data-task-id');
                
                switch(action) {
                    case 'complete':
                    case 'undo':
                        this.toggleComplete(taskId);
                        break;
                    case 'edit':
                        this.editTask(taskId);
                        break;
                    case 'delete':
                        this.deleteTask(taskId);
                        break;
                    case 'addSubtask':
                        this.addSubtask(taskId);
                        break;
                }
            });
        });
    }

    // Obtener tareas filtradas
    getFilteredTasks() {
        const typeFilter = document.getElementById('filterType').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const priorityFilter = document.getElementById('filterPriority').value;
        const userFilter = document.getElementById('filterUser').value;

        return this.tasks.filter(task => {
            const matchesType = !typeFilter || task.type === typeFilter;
            const matchesStatus = !statusFilter || task.status === statusFilter;
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;
            const matchesUser = !userFilter || task.assignedTo === userFilter;
            
            return matchesType && matchesStatus && matchesPriority && matchesUser;
        });
    }

    // Agrupar tareas por tipo
    groupTasksByType(tasks) {
        const groups = {};
        
        tasks.forEach(task => {
            if (!groups[task.type]) {
                groups[task.type] = [];
            }
            groups[task.type].push(task);
        });

        // Ordenar tareas dentro de cada grupo
        Object.keys(groups).forEach(type => {
            groups[type].sort((a, b) => {
                // Primero por estado (pendientes primero)
                if (a.status !== b.status) {
                    return a.status === 'pendiente' ? -1 : 1;
                }
                
                // Luego por prioridad
                const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // Finalmente por fecha de creación
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        });

        return groups;
    }

    // Crear grupo de tipo
    createTypeGroup(type, tasks) {
        const typeGroup = document.createElement('div');
        typeGroup.className = 'type-group';
        
        const typeInfo = this.taskTypes.find(t => t.id === type) || { name: type, icon: '📋' };

        typeGroup.innerHTML = `
            <div class="type-header">
                <div class="type-title">
                    ${typeInfo.icon} ${typeInfo.name}
                </div>
                <div class="type-count">${tasks.length}</div>
            </div>
            <div class="task-list">
                ${tasks.map(task => this.createTaskElement(task, false)).join('')}
            </div>
        `;

        // Vincular eventos de los botones
        this.bindTaskEvents(typeGroup);
        
        return typeGroup;
    }

    // Crear elemento de tarea
    createTaskElement(task, isSubtask = false) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pendiente';
        const dueDateFormatted = task.dueDate ? this.formatDate(task.dueDate) : '';
        const subtasks = this.tasks.filter(t => t.parentId === task.id);
        const hasSubtasks = subtasks.length > 0;
        
        let subtasksHtml = '';
        if (hasSubtasks && !isSubtask) {
            subtasksHtml = `
                <button class="subtask-toggle" data-toggle-subtasks="${task.id}">
                    <i class="fas fa-chevron-down"></i>
                    <span>${subtasks.length} subtarea${subtasks.length !== 1 ? 's' : ''}</span>
                </button>
                <div class="subtasks-list" data-subtasks="${task.id}">
                    ${subtasks.map(subtask => this.createTaskElement(subtask, true)).join('')}
                </div>
            `;
        }
        
        return `
            <div class="task-item ${task.status} ${isSubtask ? 'subtask' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        ${task.status === 'pendiente' ? 
                            `<button class="btn-icon btn-complete" data-action="complete" title="Marcar como completada">
                                <i class="fas fa-check"></i>
                            </button>` :
                            `<button class="btn-icon btn-undo" data-action="undo" title="Marcar como pendiente">
                                <i class="fas fa-undo"></i>
                            </button>`
                        }
                        ${!isSubtask ? `
                            <button class="btn-icon btn-subtask" data-action="addSubtask" title="Agregar subtarea">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon btn-edit" data-action="edit" title="Editar tarea">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-action="delete" title="Eliminar tarea">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">
                        ${task.priority}
                    </span>
                    ${task.dueDate ? 
                        `<span class="due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i> ${dueDateFormatted}
                            ${isOverdue ? ' (Vencida)' : ''}
                        </span>` : ''
                    }
                    ${task.assignedTo && this.users[task.assignedTo] ? 
                        `<span class="task-user">
                            <img src="${this.users[task.assignedTo].avatar}" alt="${this.users[task.assignedTo].name}" class="task-user-avatar">
                            <span>${this.users[task.assignedTo].name}</span>
                        </span>` : ''
                    }
                </div>
                ${subtasksHtml}
            </div>
        `;
    }

    // Vincular eventos de las tareas
    bindTaskEvents(container) {
        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.getAttribute('data-action');
                const taskId = button.closest('.task-item').getAttribute('data-task-id');
                
                switch(action) {
                    case 'complete':
                    case 'undo':
                        this.toggleComplete(taskId);
                        break;
                    case 'edit':
                        this.editTask(taskId);
                        break;
                    case 'delete':
                        this.deleteTask(taskId);
                        break;
                    case 'addSubtask':
                        this.addSubtask(taskId);
                        break;
                }
            });
        });

        // Eventos para toggle de subtareas
        container.querySelectorAll('[data-toggle-subtasks]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = button.getAttribute('data-toggle-subtasks');
                this.toggleSubtasks(taskId);
            });
        });
    }

    // Actualizar estadísticas
    updateStats() {
        const total = this.tasks.filter(task => !task.parentId).length; // Solo tareas principales
        const pending = this.tasks.filter(task => !task.parentId && task.status === 'pendiente').length;
        const completed = this.tasks.filter(task => !task.parentId && task.status === 'completada').length;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
    }

    // Limpiar filtros
    clearFilters() {
        document.getElementById('filterType').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPriority').value = '';
        document.getElementById('filterUser').value = '';
        this.renderTasks();
    }

    // Mostrar modal de eliminación
    showDeleteModal() {
        document.getElementById('deleteModal').style.display = 'block';
    }

    // Ocultar modal de eliminación
    hideDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#00b894' : type === 'error' ? '#fd79a8' : '#667eea'};
            color: white;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utilidades
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Tipos de tareas por defecto
    getDefaultTaskTypes() {
        return [
            { id: 'personal', name: 'Personal', icon: '👤', custom: false },
            { id: 'trabajo', name: 'Trabajo', icon: '💼', custom: false },
            { id: 'estudio', name: 'Estudio', icon: '📚', custom: false },
            { id: 'hogar', name: 'Hogar', icon: '🏠', custom: false },
            { id: 'compras', name: 'Compras', icon: '🛒', custom: false },
            { id: 'salud', name: 'Salud', icon: '🏥', custom: false },
            { id: 'otros', name: 'Otros', icon: '📋', custom: false }
        ];
    }

    // Almacenamiento local
    loadTasks() {
        try {
            const tasks = localStorage.getItem('todoTasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error al guardar tareas:', error);
            alert('Error al guardar las tareas.');
        }
    }

    loadTaskTypes() {
        try {
            const types = localStorage.getItem('todoTaskTypes');
            return types ? JSON.parse(types) : this.getDefaultTaskTypes();
        } catch (error) {
            console.error('Error al cargar tipos:', error);
            return this.getDefaultTaskTypes();
        }
    }

    saveTaskTypes() {
        try {
            localStorage.setItem('todoTaskTypes', JSON.stringify(this.taskTypes));
        } catch (error) {
            console.error('Error al guardar tipos:', error);
            alert('Error al guardar los tipos de tareas.');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            const modals = ['deleteModal', 'taskModal', 'typesModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal.style.display === 'block') {
                    window.todoApp.closeModal(modalId);
                    if (modalId === 'taskModal') {
                        window.todoApp.resetForm();
                    }
                }
            });
        }
        
        // Ctrl+N para nueva tarea
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            window.todoApp.openTaskModal();
        }
    });
});

// Prevenir pérdida de datos no guardados
window.addEventListener('beforeunload', (e) => {
    const taskModal = document.getElementById('taskModal');
    if (taskModal && taskModal.style.display === 'block') {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
    }
});