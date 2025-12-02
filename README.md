# 🔢 Calculadora de Álgebra Relacional

Una calculadora interactiva para realizar operaciones de álgebra relacional sobre tablas/relaciones.

## 🚀 Características

### Operaciones Relacionales Implementadas:

1. **σ (Selección)** - Filtra filas según una condición
   - Ejemplo: `edad > 25`, `nombre === "Juan"`

2. **π (Proyección)** - Selecciona columnas específicas
   - Ejemplo: `id, nombre`

3. **∪ (Unión)** - Combina dos tablas eliminando duplicados
   - Retorna todas las filas de A y B sin repetir

4. **∩ (Intersección)** - Elementos comunes entre dos tablas
   - Retorna solo las filas que existen en ambas tablas

5. **− (Diferencia)** - Elementos en A pero no en B
   - Retorna filas que están en A pero no en B

6. **× (Producto Cartesiano)** - Combina cada fila de A con cada fila de B
   - Retorna todas las combinaciones posibles

7. **⋈ (Join Natural)** - Combina tablas por atributos comunes
   - Une filas donde los atributos comunes tienen el mismo valor

8. **ρ (Renombrar)** - Cambia el nombre de atributos
   - Renombra columnas de la tabla

## 📖 Uso

### 1. Abrir la calculadora
Abre el archivo `calculadora-relacional.html` en tu navegador web.

### 2. Definir tablas
Las tablas se definen en formato JSON (array de objetos):

```json
[
  {"id": 1, "nombre": "Juan", "edad": 25},
  {"id": 2, "nombre": "Ana", "edad": 30}
]
```

### 3. Cargar ejemplos
Presiona el botón "📝 Cargar Ejemplo" para ver datos de muestra.

### 4. Ejecutar operaciones
Selecciona una operación y sigue las instrucciones en pantalla.

## 💡 Ejemplos

### Selección (σ)
**Tabla A:**
```json
[
  {"id": 1, "nombre": "Juan", "edad": 25},
  {"id": 2, "nombre": "Ana", "edad": 30},
  {"id": 3, "nombre": "Carlos", "edad": 28}
]
```

**Operación:** σ (edad > 26)

**Resultado:**
```json
[
  {"id": 2, "nombre": "Ana", "edad": 30},
  {"id": 3, "nombre": "Carlos", "edad": 28}
]
```

### Proyección (π)
**Operación:** π (id, nombre)

**Resultado:**
```json
[
  {"id": 1, "nombre": "Juan"},
  {"id": 2, "nombre": "Ana"},
  {"id": 3, "nombre": "Carlos"}
]
```

### Join Natural (⋈)
**Tabla A:**
```json
[
  {"id": 1, "nombre": "Juan"},
  {"id": 2, "nombre": "Ana"}
]
```

**Tabla B:**
```json
[
  {"id": 1, "ciudad": "Madrid"},
  {"id": 2, "ciudad": "Barcelona"}
]
```

**Operación:** A ⋈ B

**Resultado:**
```json
[
  {"id": 1, "nombre": "Juan", "ciudad": "Madrid"},
  {"id": 2, "nombre": "Ana", "ciudad": "Barcelona"}
]
```

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos y diseño responsivo
- **JavaScript (ES6+)** - Lógica de operaciones relacionales

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere instalación ni dependencias externas

## 🎨 Características de la Interfaz

- ✨ Diseño moderno con gradientes
- 📱 Responsivo (funciona en móviles y tablets)
- 🎯 Interfaz intuitiva con ejemplos
- 📊 Visualización de resultados en tablas
- ⚠️ Manejo de errores con mensajes claros

## 🔧 Estructura del Código

```
calculadora-relacional.html    # Interfaz de usuario
calculadora-relacional.js      # Lógica de operaciones
README.md                      # Documentación
```

### Clase Principal: `RelationalAlgebra`

Métodos implementados:
- `selection(table, condition)` - Selección
- `projection(table, attributes)` - Proyección
- `union(tableA, tableB)` - Unión
- `intersection(tableA, tableB)` - Intersección
- `difference(tableA, tableB)` - Diferencia
- `cartesianProduct(tableA, tableB)` - Producto cartesiano
- `naturalJoin(tableA, tableB)` - Join natural
- `rename(table, oldName, newName)` - Renombrar

## 📚 Notas Académicas

Esta calculadora es útil para:
- Aprender álgebra relacional
- Practicar operaciones de bases de datos
- Visualizar resultados de operaciones
- Prepararse para exámenes de bases de datos

## 🤝 Contribuciones

Siéntete libre de mejorar este proyecto agregando:
- Más operaciones (división, agregación)
- Exportación de resultados
- Historial de operaciones
- Operaciones compuestas

## 📄 Licencia

Proyecto educativo de libre uso.
