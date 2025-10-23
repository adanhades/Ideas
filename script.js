// 🔥 Importar módulos de Firebase
import { 
    collection, 
    doc, 
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    getDocs, 
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// 📬 Importar sistema de notificaciones
import { NotificationManager } from './notifications.js';

// Clase principal para manejar la aplicación TODO
class TodoApp {
    constructor() {
        this.accessKey = 'I2D0E2A5S';
        this.currentUser = null; // Ahora lo maneja Firebase Auth
        this.db = window.firestoreDB; // Referencia a Firestore
        this.auth = window.firebaseAuth; // Referencia a Auth
        this.unsubscribeTasks = null; // Para desuscribirse de listeners de tareas
        this.unsubscribeTypes = null; // Para desuscribirse de listeners de tipos
        this.notificationManager = new NotificationManager(); // Sistema de notificaciones
        
        // Credenciales de los usuarios (SOLO PARA ESTE SISTEMA CERRADO)
        this.userCredentials = {
            hades: { email: 'hades@todo-app.com', password: 'Hades2025!Secure' },
            reiger: { email: 'reiger@todo-app.com', password: 'Reiger2025!Secure' }
        };
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

    // Login con Firebase Authentication
    async login(userId) {
        try {
            // Obtener credenciales del usuario
            const credentials = this.userCredentials[userId];
            if (!credentials) {
                alert('Usuario no válido');
                return;
            }
            
            // Autenticar con Firebase
            const userCredential = await signInWithEmailAndPassword(
                this.auth, 
                credentials.email, 
                credentials.password
            );
            
            // Verificar que el UID coincida (seguridad adicional)
            if (userCredential.user.uid !== userId) {
                await signOut(this.auth);
                alert('Error de autenticación: UID no coincide');
                return;
            }
            
            // Guardar usuario actual
            this.currentUser = userId;
            localStorage.setItem('currentUser', userId);
            
            // Mostrar aplicación
            this.showApp();
            this.bindEvents();
            this.applyTheme();
            
            // Cargar tipos de tareas desde Firebase primero
            await this.loadTaskTypesFromFirebase();
            
            // Cargar tareas desde Firebase
            await this.loadTasksFromFirebase();
            
            // Configurar sincronización en tiempo real
            this.setupRealtimeSync();
            
            // Configurar listener de notificaciones
            this.setupNotificationsListener();
            
            // Renderizar interfaz
            this.renderTaskTypes();
            this.renderUserFilter();
            this.renderTasks();
            
            console.log('🔥 Firebase Auth conectado:', userCredential.user.email);
            console.log('✅ Usuario autenticado:', userId);
            
        } catch (error) {
            console.error('Error en login:', error);
            alert('Error al iniciar sesión: ' + error.message);
        }
    }

    // Logout con Firebase Authentication
    async logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            try {
                // Detener sincronización en tiempo real de tareas
                if (this.unsubscribeTasks) {
                    this.unsubscribeTasks();
                    this.unsubscribeTasks = null;
                }
                
                // Detener sincronización en tiempo real de tipos
                if (this.unsubscribeTypes) {
                    this.unsubscribeTypes();
                    this.unsubscribeTypes = null;
                }
                
                // Cerrar sesión en Firebase
                await signOut(this.auth);
                
                // Limpiar estado local
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                
                // Mostrar pantalla de login
                this.showLoginScreen();
                
                console.log('👋 Sesión cerrada correctamente');
                
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión: ' + error.message);
            }
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

        // Botón de notificaciones
        document.getElementById('notificationToggle').addEventListener('click', () => this.toggleNotifications());

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
    async addTask(taskData) {
        const task = {
            id: this.generateId(),
            ...taskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            // Agregar a array local
            this.tasks.push(task);
            
            // Guardar en Firebase si está disponible
            if (this.db && this.currentUser) {
                await setDoc(doc(this.db, 'users', this.currentUser, 'tasks', task.id), task);
                console.log('✅ Tarea guardada en Firebase:', task.id);
            }
            
            // Backup en localStorage
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            
            // Enviar notificaciones (email + push)
            if (this.notificationManager) {
                await this.notificationManager.notifyTaskCreated(
                    task,
                    this.currentUser, // Quién creó la tarea
                    taskData.assignedTo // A quién está asignada
                );
            }
            
            this.showNotification(
                taskData.parentId ? 'Subtarea agregada exitosamente' : 'Tarea agregada exitosamente', 
                'success'
            );
        } catch (error) {
            console.error('Error al agregar tarea:', error);
            this.showNotification('Error al guardar la tarea', 'error');
        }
    }

    // Actualizar tarea existente
    async updateTask(id, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...taskData,
                updatedAt: new Date().toISOString()
            };
            
            try {
                // Actualizar en Firebase
                if (this.db && this.currentUser) {
                    await updateDoc(
                        doc(this.db, 'users', this.currentUser, 'tasks', id),
                        {
                            ...taskData,
                            updatedAt: new Date().toISOString()
                        }
                    );
                    console.log('✅ Tarea actualizada en Firebase:', id);
                }
                
                // Backup en localStorage
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
                
                // Enviar notificaciones si cambió a completado
                const updatedTask = this.tasks[taskIndex];
                if (taskData.status === 'completed' && this.notificationManager) {
                    await this.notificationManager.notifyTaskCompleted(
                        updatedTask,
                        this.currentUser,
                        updatedTask.assignedTo
                    );
                } else if (this.notificationManager) {
                    // Notificar actualización general
                    await this.notificationManager.notifyTaskUpdated(
                        updatedTask,
                        this.currentUser,
                        updatedTask.assignedTo
                    );
                }
                
                this.showNotification('Tarea actualizada exitosamente', 'success');
            } catch (error) {
                console.error('Error al actualizar tarea:', error);
                this.showNotification('Error al actualizar la tarea', 'error');
            }
        }
    }

    // Eliminar tarea y sus subtareas
    deleteTask(id) {
        this.taskToDelete = id;
        this.showDeleteModal();
    }

    // Confirmar eliminación
    async confirmDelete() {
        if (this.taskToDelete) {
            try {
                // Eliminar tarea y todas sus subtareas
                await this.deleteTaskAndSubtasks(this.taskToDelete);
                
                // Backup en localStorage
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
                
                this.renderTasks();
                this.updateStats();
                this.hideDeleteModal();
                this.showNotification('Tarea eliminada exitosamente', 'success');
                this.taskToDelete = null;
            } catch (error) {
                console.error('Error al eliminar tarea:', error);
                this.showNotification('Error al eliminar la tarea', 'error');
            }
        }
    }

    // Eliminar tarea y subtareas recursivamente
    async deleteTaskAndSubtasks(taskId) {
        // Guardar info de la tarea antes de eliminarla (para notificaciones)
        const taskToDelete = this.tasks.find(task => task.id === taskId);
        
        // Encontrar y eliminar todas las subtareas
        const subtasks = this.tasks.filter(task => task.parentId === taskId);
        for (const subtask of subtasks) {
            await this.deleteTaskAndSubtasks(subtask.id);
        }
        
        // Eliminar de Firebase
        if (this.db && this.currentUser) {
            try {
                await deleteDoc(doc(this.db, 'users', this.currentUser, 'tasks', taskId));
                console.log('✅ Tarea eliminada de Firebase:', taskId);
            } catch (error) {
                console.error('Error al eliminar de Firebase:', error);
            }
        }
        
        // Enviar notificaciones solo para la tarea principal (no subtareas)
        if (taskToDelete && !taskToDelete.parentId && this.notificationManager) {
            await this.notificationManager.notifyTaskDeleted(
                taskToDelete,
                this.currentUser
            );
        }
        
        // Eliminar del array local
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    // Alternar estado de completado
    async toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const newStatus = task.status === 'completada' ? 'pendiente' : 'completada';
            const completedAt = newStatus === 'completada' ? new Date().toISOString() : null;
            
            // Actualizar tarea
            await this.updateTask(id, { 
                status: newStatus, 
                completedAt 
            });
            
            // Si es una tarea padre y se marca como completada, marcar subtareas
            if (newStatus === 'completada') {
                await this.markSubtasksComplete(id, true);
            }
            
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
    async deleteTaskType(typeId) {
        const typeToDelete = this.taskTypes.find(type => type.id === typeId);
        if (!typeToDelete) return;
        
        // Verificar localmente si hay tareas usando este tipo
        const tasksWithType = this.tasks.filter(task => task.type === typeId);
        
        if (tasksWithType.length > 0) {
            alert(`❌ No se puede eliminar el tipo "${typeToDelete.name}"\n\nHay ${tasksWithType.length} tarea(s) usando este tipo.\n\nPrimero debes reasignar o eliminar esas tareas.`);
            return;
        }
        
        // Confirmar eliminación
        if (!confirm(`¿Estás seguro de que quieres eliminar el tipo "${typeToDelete.name}"?`)) {
            return;
        }
        
        try {
            // Si Firebase está disponible, eliminar del servidor
            if (this.db && this.currentUser) {
                const typeRef = doc(this.db, 'users', this.currentUser, 'taskTypes', typeId);
                await deleteDoc(typeRef);
                
                console.log(`✅ Tipo "${typeToDelete.name}" eliminado de Firebase`);
                
                // La sincronización en tiempo real actualizará la UI automáticamente
                // Pero también actualizamos localmente por si acaso
                this.taskTypes = this.taskTypes.filter(type => type.id !== typeId);
                localStorage.setItem('todoTaskTypes', JSON.stringify(this.taskTypes));
            } else {
                // Sin Firebase, eliminar solo localmente
                this.taskTypes = this.taskTypes.filter(type => type.id !== typeId);
                localStorage.setItem('todoTaskTypes', JSON.stringify(this.taskTypes));
                this.renderTaskTypes();
                this.renderTypesList();
            }
            
            // Nota: Si hay una Cloud Function activa (validateTypeDelete),
            // esta impedirá la eliminación si hay tareas asociadas y
            // creará una notificación que aparecerá automáticamente
            
        } catch (error) {
            console.error('Error al eliminar tipo:', error);
            alert(`❌ Error al eliminar el tipo: ${error.message}`);
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

    // Configurar notificaciones
    async toggleNotifications() {
        if (!this.notificationManager) {
            this.showNotification('Sistema de notificaciones no disponible', 'error');
            return;
        }

        const settings = this.notificationManager.getSettings();
        const btn = document.getElementById('notificationToggle');

        // Si ya están activas, mostrar estado
        if (settings.pushPermission === 'granted') {
            this.showNotification(
                `✅ Notificaciones activas\n\n` +
                `📧 Email: ${settings.emailJsInitialized ? 'Configurado' : 'No configurado'}\n` +
                `🔔 Push: Habilitadas`,
                'success',
                'Estado de Notificaciones',
                8000
            );
            return;
        }

        // Solicitar permiso
        const granted = await this.notificationManager.requestPushPermission();
        
        if (granted) {
            btn.classList.add('active');
            this.showNotification(
                '¡Notificaciones push activadas! 🎉\n\nRecibirás notificaciones cuando:\n• Te asignen una tarea\n• Actualicen tus tareas\n• Completen tus tareas',
                'success',
                'Notificaciones Activadas',
                8000
            );
        } else {
            this.showNotification(
                'Permiso denegado. Puedes habilitarlo desde la configuración del navegador.',
                'warning',
                'Notificaciones Bloqueadas',
                6000
            );
        }
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

    // Cargar tareas desde localStorage (Firebase se carga después del login)
    loadTasks() {
        try {
            const tasks = localStorage.getItem('todoTasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            return [];
        }
    }

    // Cargar tareas desde Firebase
    async loadTasksFromFirebase() {
        if (!this.db || !this.currentUser) {
            console.log('⚠️ Firebase no disponible o usuario no logueado');
            return;
        }

        try {
            // Cargar tareas de AMBOS usuarios (hades y reiger)
            const users = ['hades', 'reiger'];
            this.tasks = [];
            
            for (const userId of users) {
                const tasksRef = collection(this.db, 'users', userId, 'tasks');
                const querySnapshot = await getDocs(tasksRef);
                
                querySnapshot.forEach((doc) => {
                    this.tasks.push(doc.data());
                });
            }
            
            // Ordenar por fecha de creación
            this.tasks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            this.renderTasks();
            console.log(`✅ ${this.tasks.length} tareas cargadas desde Firebase (ambos usuarios)`);
        } catch (error) {
            console.error('❌ Error al cargar tareas desde Firebase:', error);
        }
    }

    // Sincronizar tareas en tiempo real (modelo plano)
    setupRealtimeSync() {
        if (!this.db || !this.currentUser) return;

        try {
            // Sincronizar tareas de AMBOS usuarios en tiempo real
            const users = ['hades', 'reiger'];
            const unsubscribers = [];
            
            // Listener combinado para ambos usuarios
            const updateTasks = () => {
                // Re-renderizar con los datos actuales
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
                this.renderTasks();
                this.updateStats();
            };
            
            // Escuchar tareas de cada usuario
            users.forEach(userId => {
                const tasksRef = collection(this.db, 'users', userId, 'tasks');
                const q = query(tasksRef, orderBy('createdAt', 'desc'));
                
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    // Filtrar tareas del usuario actual de la lista
                    this.tasks = this.tasks.filter(t => !t.id || snapshot.docs.every(doc => doc.id !== t.id));
                    
                    // Agregar/actualizar tareas de este usuario
                    snapshot.forEach((doc) => {
                        const existingIndex = this.tasks.findIndex(t => t.id === doc.data().id);
                        if (existingIndex >= 0) {
                            this.tasks[existingIndex] = doc.data();
                        } else {
                            this.tasks.push(doc.data());
                        }
                    });
                    
                    // Ordenar por fecha de creación
                    this.tasks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    
                    updateTasks();
                    console.log(`🔄 Tareas sincronizadas en tiempo real (${userId})`);
                });
                
                unsubscribers.push(unsubscribe);
            });
            
            // Guardar función para desuscribirse de todos
            this.unsubscribeTasks = () => unsubscribers.forEach(unsub => unsub());

            // Sincronizar tipos de tareas en tiempo real - colección de tipos
            const typesRef = collection(this.db, 'users', this.currentUser, 'taskTypes');
            this.unsubscribeTypes = onSnapshot(typesRef, (snapshot) => {
                this.taskTypes = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    // Normalizar: convertir 'emoji' a 'icon' para compatibilidad con el código local
                    this.taskTypes.push({
                        ...data,
                        icon: data.emoji || data.icon || '📌'
                    });
                });
                
                // Si no hay tipos, usar los por defecto
                if (this.taskTypes.length === 0) {
                    this.taskTypes = this.getDefaultTaskTypes();
                }
                
                localStorage.setItem('todoTaskTypes', JSON.stringify(this.taskTypes));
                this.renderTaskTypes();
                this.renderTasks(); // Re-renderizar tareas por si cambiaron los colores
                console.log(`🔄 ${this.taskTypes.length} tipos de tareas sincronizados en tiempo real`);
            });
        } catch (error) {
            console.error('Error al configurar sincronización en tiempo real:', error);
        }
    }

    // NOTA: Este método ya no se usa - cada operación guarda individualmente
    // Guardar tareas en Firebase y localStorage (DEPRECADO - Modelo plano)
    async saveTasks() {
        // Este método se mantiene por compatibilidad pero ya no se usa
        // Ahora cada tarea se guarda individualmente con addTask/updateTask/deleteTask
        console.warn('⚠️ saveTasks() está deprecado - usar addTask/updateTask/deleteTask');
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

    async loadTaskTypesFromFirebase() {
        if (!this.db || !this.currentUser) return;
        
        try {
            // Cargar tipos desde la colección (modelo plano)
            const typesRef = collection(this.db, 'users', this.currentUser, 'taskTypes');
            const querySnapshot = await getDocs(typesRef);
            
            this.taskTypes = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Normalizar: convertir 'emoji' a 'icon' para compatibilidad con el código local
                this.taskTypes.push({
                    ...data,
                    icon: data.emoji || data.icon || '📌'
                });
            });
            
            // Si no hay tipos, usar los por defecto
            if (this.taskTypes.length === 0) {
                this.taskTypes = this.getDefaultTaskTypes();
            }
            
            // Guardar en localStorage como backup
            localStorage.setItem('todoTaskTypes', JSON.stringify(this.taskTypes));
            console.log(`✅ ${this.taskTypes.length} tipos de tareas cargados desde Firebase`);
        } catch (error) {
            console.error('Error al cargar tipos desde Firebase:', error);
            this.taskTypes = this.getDefaultTaskTypes();
        }
    }

    async saveTaskTypes() {
        try {
            // Guardar en localStorage primero (backup)
            localStorage.setItem('todoTaskTypes', JSON.stringify(this.taskTypes));
            
            // Guardar en Firebase si está disponible (modelo plano)
            if (this.db && this.currentUser) {
                // Guardar cada tipo como documento individual
                const batch = [];
                for (const type of this.taskTypes) {
                    const typeRef = doc(this.db, 'users', this.currentUser, 'taskTypes', type.id);
                    // Normalizar: guardar 'icon' como 'emoji' en Firestore
                    const typeData = {
                        id: type.id,
                        name: type.name,
                        color: type.color,
                        emoji: type.icon || type.emoji || '📌',
                        custom: type.custom,
                        lastUpdated: new Date().toISOString()
                    };
                    batch.push(setDoc(typeRef, typeData));
                }
                await Promise.all(batch);
                console.log(`✅ ${this.taskTypes.length} tipos guardados en Firebase`);
            }
        } catch (error) {
            console.error('Error al guardar tipos:', error);
            // No mostrar alert, solo log del error
        }
    }

    // Sistema de Notificaciones
    showNotification(message, type = 'info', title = null, duration = 5000) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Iconos según tipo
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info} notification-icon"></i>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Cerrar">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });

        // Agregar al contenedor
        container.appendChild(notification);

        // Auto-cerrar después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }

        return notification;
    }

    // Escuchar notificaciones desde Firestore (cuando Cloud Functions esté activa)
    setupNotificationsListener() {
        if (!this.db || !this.currentUser) return;

        try {
            const notificationsRef = collection(this.db, 'users', this.currentUser, 'notifications');
            const q = query(notificationsRef, where('read', '==', false), orderBy('createdAt', 'desc'));

            this.unsubscribeNotifications = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const notif = change.doc.data();
                        
                        // Mostrar notificación en la UI
                        this.showNotification(
                            notif.message,
                            notif.type === 'type-deletion-blocked' ? 'warning' : 'info',
                            'Acción bloqueada',
                            8000 // 8 segundos
                        );

                        // Marcar como leída
                        updateDoc(change.doc.ref, { read: true });
                    }
                });
            });

            console.log('✅ Listener de notificaciones activado');
        } catch (error) {
            console.error('Error al configurar listener de notificaciones:', error);
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