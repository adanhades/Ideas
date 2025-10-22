# 📋 TODO List - Organizador de Tareas

Una aplicación web moderna y completa para gestionar tareas organizadas por tipo, con sistema de perfiles de usuario, funcionalidades avanzadas de filtrado, edición y persistencia local.

## 🚀 Características

### 👤 Sistema de Perfiles de Usuario
- **Pantalla de inicio de sesión** con selección de perfiles
- **Dos perfiles disponibles**: Hades y Reiger
- **Avatares personalizados** para cada usuario
- **Asignación automática** de tareas al usuario activo
- **Indicador de usuario** en header con avatar y nombre
- **Cierre de sesión** con confirmación
- **Persistencia de sesión** entre recargas del navegador

### ✨ Funcionalidades Principales
- **Modal para crear tareas** con interfaz intuitiva y botón dedicado
- **Editar tareas** existentes con formulario precargado en modal
- **Eliminar tareas** con confirmación modal
- **Marcar como completadas/pendientes** con un clic
- **Organización por tipos**: Personal, Trabajo, Estudio, Hogar, Compras, Salud, Otros
- **Tipos personalizados**: Crear, editar y eliminar tipos de tareas
- **Subtareas anidadas**: Agregar tareas hijas dentro de tareas principales
- **Gestión jerárquica**: Las subtareas se organizan bajo sus tareas padre
- **Toggle de subtareas**: Mostrar/ocultar subtareas con un clic

### 🔧 Gestión de Tipos de Tareas
- **Crear tipos personalizados** con nombre e icono
- **Eliminar tipos** que ya no necesites (los predeterminados no se pueden eliminar)
- **Iconos con emojis** para identificación visual rápida
- **Persistencia** de tipos personalizados entre sesiones

### 🏗️ Sistema de Subtareas
- **Agregar subtareas** a cualquier tarea principal
- **Jerarquía visual** con indentación y conectores
- **Completado en cascada**: Marcar tarea padre completa todas las subtareas
- **Eliminación recursiva**: Eliminar tarea padre elimina todas las subtareas
- **Contador de subtareas** en cada tarea principal
- **Expandir/contraer** lista de subtareas

### 🔍 Filtros Avanzados
- Filtrar por **tipo de tarea**
- Filtrar por **estado** (pendiente/completada)
- Filtrar por **prioridad** (alta/media/baja)
- Botón para **limpiar todos los filtros**

### 📊 Estadísticas en Tiempo Real
- Contador de **tareas totales**
- Contador de **tareas pendientes**
- Contador de **tareas completadas**

### 💾 Persistencia de Datos
- **Almacenamiento local** automático
- Los datos se mantienen entre sesiones del navegador
- Respaldo automático de cambios

### 🎨 Diseño Moderno
- **Paleta de colores personalizada**: Azul (#1C6ECC), Violeta (#221CCC), Púrpura (#7A1CCC)
- **Dos temas disponibles**: Tema claro y tema oscuro con transiciones suaves
- **Dos vistas disponibles**: Vista de tarjetas y vista de tabla
- **Interfaz responsive** que se adapta a móviles y tablets
- **Gradientes modernos** y efectos visuales
- **Iconos Font Awesome** para mejor UX
- **Animaciones suaves** y transiciones
- **Colores dinámicos** según estado y tipo de tarea
- **Persistencia de preferencias**: El tema elegido se guarda automáticamente

## 🌓 Sistema de Temas
### Tema Claro (Light)
- Fondo degradado con colores vivos
- Tarjetas blancas con sombras suaves
- Texto oscuro para mejor legibilidad
- Colores pastel para badges y tipos
- Ideal para ambientes bien iluminados

### Tema Oscuro (Dark)
- Fondo degradado en tonos oscuros azul-marino
- Tarjetas con tonos azul oscuro (#16213e)
- Texto claro (#e4e4e4) para mejor contraste
- Colores más saturados para badges
- Reduce fatiga visual en ambientes con poca luz
- Scrollbar personalizado que se integra con el tema

## 📊 Vista de Tabla Avanzada
- **Cambio de vista** con un clic entre tarjetas y tabla
- **Colores por tipo**: Cada tipo de tarea tiene su color distintivo
- **Indicadores de estado**: Animaciones para tareas pendientes y completadas
- **Prioridad visual**: Borde de color según la prioridad de la tarea
- **Subtareas integradas**: Se muestran debajo de la tarea padre con indentación
- **Tabla responsive**: Se adapta a pantallas pequeñas ocultando columnas no esenciales
- **Acciones rápidas**: Todos los controles disponibles directamente en la tabla

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox y Grid
- **JavaScript ES6+** - Lógica de la aplicación
- **Font Awesome** - Iconografía
- **LocalStorage API** - Persistencia de datos

## 📁 Estructura del Proyecto

```
TODO/
├── index.html          # Estructura principal de la aplicación
├── styles.css          # Estilos y diseño responsive
├── script.js           # Lógica de la aplicación
└── README.md          # Documentación
```

## 🚀 Cómo Usar

### Instalación
1. Descarga o clona todos los archivos en una carpeta
2. Abre `index.html` en tu navegador web
3. ¡Listo! La aplicación está funcionando

### Uso Básico

#### ➕ Agregar una Tarea
1. Haz clic en el botón **"Nueva Tarea"** en la parte superior
2. Se abrirá un modal con el formulario:
   - **Título**: Nombre de la tarea (requerido)
   - **Descripción**: Detalles adicionales (opcional)
   - **Tipo**: Categoría de la tarea (requerido)
   - **Prioridad**: Alta, Media o Baja
   - **Fecha límite**: Fecha opcional para la tarea
3. Haz clic en "Agregar Tarea"

#### 🏗️ Agregar una Subtarea
1. Haz clic en el botón morado (+) en cualquier tarea principal
2. Se abrirá el modal indicando que es una subtarea
3. Completa el formulario igual que una tarea normal
4. La subtarea aparecerá anidada bajo la tarea padre

#### 🔧 Gestionar Tipos de Tareas
1. Haz clic en **"Gestionar Tipos"** en la parte superior
2. En el modal podrás:
   - **Agregar nuevo tipo**: Ingresa nombre e icono (emoji)
   - **Eliminar tipos**: Solo los tipos personalizados se pueden eliminar
3. Los tipos aparecerán inmediatamente en los selectores

#### ✏️ Editar una Tarea
1. Haz clic en el botón de editar (📝) en cualquier tarea
2. Se abrirá el modal con los datos actuales precargados
3. Modifica los campos necesarios
4. Haz clic en "Actualizar Tarea" o "Cancelar"

#### ✅ Completar una Tarea
- Haz clic en el botón verde (✓) para marcar como completada
- Haz clic en el botón azul (↶) para marcar como pendiente
- **Nota**: Al completar una tarea padre, todas sus subtareas se marcan automáticamente como completadas

#### 📂 Gestionar Subtareas
- Haz clic en el toggle "X subtareas" para mostrar/ocultar subtareas
- Las subtareas se muestran con indentación y conectores visuales
- Cada subtarea tiene los mismos controles que las tareas principales

#### 🗑️ Eliminar una Tarea
1. Haz clic en el botón rojo (🗑️)
2. Confirma la eliminación en el modal que aparece
3. **Importante**: Eliminar una tarea padre eliminará todas sus subtareas

#### 🔍 Filtrar Tareas
- Usa los selectores en la sección de filtros
- Combina múltiples filtros para búsquedas específicas
- Usa "Limpiar Filtros" para mostrar todas las tareas

#### 🌓 Cambiar Tema
1. Haz clic en el **botón circular** con icono de luna/sol en la parte superior
2. El tema cambia instantáneamente con transiciones suaves
3. Tu preferencia se guarda automáticamente
4. **Tema Claro**: Icono de luna 🌙 (fondo claro)
5. **Tema Oscuro**: Icono de sol ☀️ (fondo oscuro)

#### 📊 Cambiar Vista
1. Haz clic en **"Vista Tarjetas"** para ver tareas en formato de tarjetas organizadas por tipo
2. Haz clic en **"Vista Tabla"** para ver todas las tareas en formato de tabla
3. La vista de tabla incluye:
   - **Colores por tipo**: Cada tipo tiene su propio esquema de color
   - **Indicadores de estado**: Animación de pulso para tareas pendientes
   - **Bordes de prioridad**: Color del borde según prioridad (Rojo=Alta, Amarillo=Media, Azul=Baja)
   - **Todas las columnas**: Tarea, Tipo, Prioridad, Estado, Fecha Límite, Subtareas, Acciones

## 🎯 Características Avanzadas

### 📱 Responsive Design
- La aplicación se adapta perfectamente a:
  - 💻 Computadoras de escritorio
  - 📱 Teléfonos móviles
  - 🔲 Tablets

### ⌨️ Atajos de Teclado
- **Escape**: Cerrar modales abiertos o cancelar edición
- **Ctrl + N**: Abrir modal de nueva tarea

### 🎨 Características Visuales Avanzadas
- **Transiciones globales**: Cambios suaves en todos los elementos al cambiar de tema
- **Scrollbar personalizado**: Se adapta automáticamente al tema activo
- **Degradados adaptativos**: Los gradientes cambian según el tema
- **Colores de tipo dinámicos**: Se invierten en tema oscuro para mejor visibilidad
- **Estados visuales mejorados**: Animaciones de pulso diferenciadas por tema
- **Contraste optimizado**: Todos los textos tienen contraste WCAG AA en ambos temas

### 🔔 Notificaciones
- Confirmaciones visuales para todas las acciones
- Notificaciones temporales no intrusivas
- Colores diferenciados por tipo de acción

### 📅 Gestión de Fechas
- Indicador visual para tareas vencidas
- Formato de fecha localizado en español
- Ordenamiento inteligente por fechas

### 🎨 Indicadores Visuales
- **Iconos por tipo** de tarea para identificación rápida (personalizables)
- **Colores de prioridad** diferenciados (Alta=Rojo, Media=Amarillo, Baja=Azul)
- **Estados visuales** para tareas completadas con animaciones
- **Contadores** por tipo de tarea y subtareas
- **Jerarquía visual** para subtareas con indentación
- **Conectores gráficos** para mostrar relación padre-hijo
- **Modales modernos** con animaciones suaves
- **Paleta personalizada**: Gradientes azul-violeta-púrpura (#1C6ECC → #221CCC → #7A1CCC)

### 🎨 Sistema de Colores por Tipo
- **Personal**: Azul claro (#e3f2fd)
- **Trabajo**: Naranja claro (#fff3e0)
- **Estudio**: Púrpura claro (#f3e5f5)
- **Hogar**: Verde claro (#e8f5e9)
- **Compras**: Amarillo claro (#fff9c4)
- **Salud**: Rojo claro (#ffebee)
- **Otros**: Gris claro (#e0e0e0)
- **Tipos personalizados**: Colores asignados automáticamente

## 💡 Funcionalidades Técnicas

### Almacenamiento
- Uso de `localStorage` para persistencia
- Manejo de errores en lectura/escritura
- Estructura JSON optimizada

### Rendimiento
- Renderizado eficiente de listas grandes
- Filtrado en tiempo real sin lag
- Eventos delegados para mejor performance

### Seguridad
- Escape de HTML para prevenir XSS
- Validación de datos de entrada
- Manejo seguro de eventos

## 🔧 Personalización

### Agregar Nuevos Tipos de Tarea
1. Edita el `select` de tipos en `index.html`
2. Agrega el nuevo tipo en los arrays de JavaScript
3. Añade el icono correspondiente en CSS

### Modificar Colores
- Edita las variables de color en `styles.css`
- Los gradientes principales están en las clases `.container` y botones

### Extender Funcionalidad
- La clase `TodoApp` está diseñada para ser extensible
- Métodos como `exportTasks()` e `importTasks()` ya están preparados

## 🐛 Solución de Problemas

### Las tareas no se guardan
- Verifica que el navegador soporte localStorage
- Revisa que no esté en modo incógnito
- Verifica el espacio disponible del navegador

### La aplicación no se ve bien
- Asegúrate de que `styles.css` se carga correctamente
- Verifica la conexión a Font Awesome CDN
- Prueba en un navegador moderno

### Errores de JavaScript
- Abre las herramientas de desarrollador (F12)
- Revisa la consola para errores específicos
- Verifica que `script.js` se carga correctamente

## 📈 Futuras Mejoras

- [ ] Arrastrar y soltar para reordenar tareas y subtareas
- [ ] Plantillas de tareas con subtareas predefinidas
- [ ] Fechas límite para subtareas independientes
- [ ] Progreso visual de tareas con subtareas
- [ ] Exportar/importar tareas en JSON
- [ ] Modo oscuro/claro
- [ ] Notificaciones del navegador
- [ ] Sincronización en la nube
- [ ] Etiquetas y filtros avanzados
- [ ] Búsqueda de texto
- [ ] Filtros por fecha
- [ ] Reportes y estadísticas avanzadas
- [ ] Colaboración en tiempo real

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la aplicación:

1. Haz un fork del proyecto
2. Crea una rama para tu feature
3. Implementa tus cambios
4. Envía un pull request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para ayudar en la organización de tareas diarias.

---

*¿Tienes preguntas o sugerencias? ¡No dudes en contactar!*