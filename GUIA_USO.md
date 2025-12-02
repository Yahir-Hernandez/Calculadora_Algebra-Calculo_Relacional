# 📖 Guía de Uso - Calculadora de Cálculo Relacional

## 🚀 Inicio Rápido

### Paso 1: Cargar Datos
1. Presiona el botón **"Cargar Ejemplo"** para ver datos de muestra
2. O define tus propias tablas en formato JSON

### Paso 2: Escribir Consulta
Escribe tu consulta en el campo de texto usando una de estas notaciones:

**Notación 1 - Con símbolo ∈:**
```
{t | t ∈ A ∧ t.edad > 25}
```

**Notación 2 - Con paréntesis:**
```
{e.nombre | A(e) AND e.edad > 25}
```

### Paso 3: Ejecutar
Presiona el botón **"Ejecutar Consulta"**

---

## 📝 Formato de las Tablas

Las tablas se definen en formato JSON como un **array de objetos**:

### ✅ Correcto:
```json
[
  {"id": 1, "nombre": "Juan", "edad": 25},
  {"id": 2, "nombre": "Ana", "edad": 30}
]
```

### ❌ Incorrecto:
```json
// Sin corchetes []
{"id": 1, "nombre": "Juan"}

// Comillas simples
[{'id': 1, 'nombre': 'Juan'}]

// Sin comillas en las claves
[{id: 1, nombre: "Juan"}]
```

---

## 🔤 Sintaxis de Consultas

### Notación con ∈ (epsilon - pertenece)

**Estructura básica:**
```
{variable | variable ∈ Tabla ∧ condiciones}
```

**Ejemplos:**

1. **Selección simple:**
```
{t | t ∈ A ∧ t.edad > 25}
```
Retorna todas las tuplas de A donde edad > 25

2. **Proyección:**
```
{t.nombre, t.edad | t ∈ A}
```
Retorna solo los campos nombre y edad

3. **Con múltiples condiciones:**
```
{t | t ∈ A ∧ t.edad > 20 ∧ t.departamento = "IT"}
```

4. **Join de dos tablas:**
```
{t | t ∈ A ∧ ∃s(s ∈ B ∧ s.id = t.id)}
```

### Notación con Paréntesis

**Estructura básica:**
```
{variable.atributo | TABLA(variable) AND condiciones}
```

**Ejemplos:**

1. **Selección simple:**
```
{e.nombre | A(e) AND e.edad > 25}
```

2. **Proyección múltiple:**
```
{e.nombre, e.edad | A(e) AND e.departamento = "IT"}
```

3. **Join de dos tablas:**
```
{e.nombre, s.ciudad | A(e) AND B(s) AND e.id = s.id}
```

4. **Consulta compleja (tu ejemplo):**
```
{e.nombre, e.apellido, s.nombre, s.apellido | A(e) AND A(s) AND e.superDNI = s.DNI}
```

---

## ⚠️ Nombres de Tablas

**MUY IMPORTANTE:**

- La **Tabla A** se llama `"A"` en las consultas
- La **Tabla B** se llama `"B"` en las consultas

### ✅ Correcto:
```
{t | A(t) AND t.edad > 25}    // Usa "A"
{t | t ∈ A ∧ t.edad > 25}      // Usa "A"
```

### ❌ Incorrecto:
```
{t | EMPLEADO(t) AND t.edad > 25}    // No hay tabla "EMPLEADO"
{t | t ∈ PERSONAS ∧ t.edad > 25}     // No hay tabla "PERSONAS"
```

---

## 🔣 Operadores Disponibles

### Comparación:
- `=` (igual)
- `!=` (diferente)
- `>` (mayor que)
- `<` (menor que)
- `>=` (mayor o igual)
- `<=` (menor o igual)

### Lógicos:
- `∧` o `AND` (y)
- `∨` o `OR` (o)
- `¬` (no/negación)

### Cuantificadores:
- `∃` (existe)
- `∀` (para todo)

### Pertenencia:
- `∈` (pertenece a)

---

## 💡 Ejemplos Completos

### Ejemplo 1: Empleados mayores de 25 años

**Tabla A:**
```json
[
  {"id": 1, "nombre": "Juan", "edad": 25},
  {"id": 2, "nombre": "Ana", "edad": 30},
  {"id": 3, "nombre": "Carlos", "edad": 22}
]
```

**Consulta:**
```
{t | t ∈ A ∧ t.edad > 25}
```
o
```
{e.nombre | A(e) AND e.edad > 25}
```

**Resultado:**
```
Ana (edad: 30)
```

---

### Ejemplo 2: Join entre dos tablas

**Tabla A:**
```json
[
  {"id": 1, "nombre": "Juan"},
  {"id": 2, "nombre": "Ana"},
  {"id": 3, "nombre": "Carlos"}
]
```

**Tabla B:**
```json
[
  {"id": 1, "ciudad": "Madrid"},
  {"id": 2, "ciudad": "Barcelona"}
]
```

**Consulta:**
```
{e.nombre, s.ciudad | A(e) AND B(s) AND e.id = s.id}
```

**Resultado:**
| e.nombre | s.ciudad |
|----------|----------|
| Juan     | Madrid   |
| Ana      | Barcelona|

---

### Ejemplo 3: Empleados y sus supervisores

**Tabla A (misma tabla, dos variables):**
```json
[
  {"DNI": "001", "nombre": "Juan", "superDNI": "002"},
  {"DNI": "002", "nombre": "Ana", "superDNI": null},
  {"DNI": "003", "nombre": "Carlos", "superDNI": "002"}
]
```

**Consulta:**
```
{e.nombre, s.nombre | A(e) AND A(s) AND e.superDNI = s.DNI}
```

**Resultado:**
| e.nombre | s.nombre |
|----------|----------|
| Juan     | Ana      |
| Carlos   | Ana      |

---

## 🐛 Solución de Problemas

### Error: "JSON inválido"
**Causa:** El formato de la tabla no es JSON válido

**Solución:**
- Usa comillas dobles `"` en lugar de simples `'`
- Encierra todo entre corchetes `[]`
- Usa comas entre objetos

### Error: "La tabla X no está definida"
**Causa:** El nombre de la tabla en la consulta no coincide

**Solución:**
- Usa `A` o `B` (no otros nombres)
- Ejemplo: `A(e)` o `t ∈ A`

### Error: "Resultado vacío"
**Causa:** La consulta no retorna resultados

**Solución:**
- Verifica que los nombres de los atributos sean correctos
- Verifica que las condiciones sean válidas
- Usa `console.log` del navegador (F12) para ver más detalles

### La consulta no hace nada
**Causa:** Faltan datos en las tablas

**Solución:**
- Verifica que la Tabla A tenga datos
- Presiona "Cargar Ejemplo" para ver datos de muestra

---

## ⌨️ Teclado de Símbolos

Usa el teclado virtual para insertar símbolos especiales:

- `∈` - Pertenece a
- `∧` - AND lógico
- `∨` - OR lógico
- `¬` - NOT/Negación
- `∃` - Existe
- `∀` - Para todo

---

## 📚 Recursos Adicionales

Para más ejemplos, presiona el botón **"Ver Ejemplos"** en la interfaz.

Si tienes problemas, abre la consola del navegador (F12) para ver mensajes de error detallados.
