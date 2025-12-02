// Clase para manejar operaciones de álgebra relacional
class RelationalAlgebra {
    constructor() {
        this.tableA = [];
        this.tableB = [];
    }

    // Parsear JSON de entrada
    parseTable(jsonString) {
        try {
            const table = JSON.parse(jsonString);
            if (!Array.isArray(table)) {
                throw new Error("La entrada debe ser un array");
            }
            return table;
        } catch (e) {
            throw new Error(`Error al parsear JSON: ${e.message}`);
        }
    }

    // σ - Selección: filtra filas según una condición
    selection(table, condition) {
        try {
            return table.filter(row => {
                // Evaluar la condición de forma segura
                try {
                    // Crear un contexto con los atributos de la fila
                    const func = new Function(...Object.keys(row), `return ${condition}`);
                    return func(...Object.values(row));
                } catch (e) {
                    console.error("Error evaluando condición:", e);
                    return false;
                }
            });
        } catch (e) {
            throw new Error(`Error en selección: ${e.message}`);
        }
    }

    // π - Proyección: selecciona columnas específicas
    projection(table, attributes) {
        try {
            const attrs = attributes.split(',').map(a => a.trim());
            return table.map(row => {
                const newRow = {};
                attrs.forEach(attr => {
                    if (row.hasOwnProperty(attr)) {
                        newRow[attr] = row[attr];
                    }
                });
                return newRow;
            });
        } catch (e) {
            throw new Error(`Error en proyección: ${e.message}`);
        }
    }

    // ∪ - Unión: combina dos tablas eliminando duplicados
    union(tableA, tableB) {
        try {
            const combined = [...tableA, ...tableB];
            // Eliminar duplicados comparando objetos
            const unique = combined.filter((row, index, self) => 
                index === self.findIndex(r => JSON.stringify(r) === JSON.stringify(row))
            );
            return unique;
        } catch (e) {
            throw new Error(`Error en unión: ${e.message}`);
        }
    }

    // ∩ - Intersección: elementos comunes entre dos tablas
    intersection(tableA, tableB) {
        try {
            return tableA.filter(rowA => 
                tableB.some(rowB => JSON.stringify(rowA) === JSON.stringify(rowB))
            );
        } catch (e) {
            throw new Error(`Error en intersección: ${e.message}`);
        }
    }

    // − - Diferencia: elementos en A pero no en B
    difference(tableA, tableB) {
        try {
            return tableA.filter(rowA => 
                !tableB.some(rowB => JSON.stringify(rowA) === JSON.stringify(rowB))
            );
        } catch (e) {
            throw new Error(`Error en diferencia: ${e.message}`);
        }
    }

    // × - Producto Cartesiano: combina cada fila de A con cada fila de B
    cartesianProduct(tableA, tableB) {
        try {
            const result = [];
            for (const rowA of tableA) {
                for (const rowB of tableB) {
                    // Combinar atributos, manejando conflictos de nombres
                    const combined = {};
                    for (const [key, value] of Object.entries(rowA)) {
                        combined[`A_${key}`] = value;
                    }
                    for (const [key, value] of Object.entries(rowB)) {
                        combined[`B_${key}`] = value;
                    }
                    result.push(combined);
                }
            }
            return result;
        } catch (e) {
            throw new Error(`Error en producto cartesiano: ${e.message}`);
        }
    }

    // ⋈ - Join Natural: combina tablas por atributos comunes
    naturalJoin(tableA, tableB) {
        try {
            if (tableA.length === 0 || tableB.length === 0) {
                return [];
            }

            // Encontrar atributos comunes
            const attrsA = Object.keys(tableA[0]);
            const attrsB = Object.keys(tableB[0]);
            const commonAttrs = attrsA.filter(attr => attrsB.includes(attr));

            if (commonAttrs.length === 0) {
                // Si no hay atributos comunes, hacer producto cartesiano
                return this.cartesianProduct(tableA, tableB);
            }

            const result = [];
            for (const rowA of tableA) {
                for (const rowB of tableB) {
                    // Verificar si los valores de los atributos comunes coinciden
                    const match = commonAttrs.every(attr => rowA[attr] === rowB[attr]);
                    if (match) {
                        // Combinar las filas sin duplicar los atributos comunes
                        const combined = { ...rowA };
                        for (const [key, value] of Object.entries(rowB)) {
                            if (!commonAttrs.includes(key)) {
                                combined[key] = value;
                            }
                        }
                        result.push(combined);
                    }
                }
            }
            return result;
        } catch (e) {
            throw new Error(`Error en join natural: ${e.message}`);
        }
    }

    // ρ - Renombrar: cambia el nombre de atributos
    rename(table, oldName, newName) {
        try {
            return table.map(row => {
                const newRow = {};
                for (const [key, value] of Object.entries(row)) {
                    if (key === oldName) {
                        newRow[newName] = value;
                    } else {
                        newRow[key] = value;
                    }
                }
                return newRow;
            });
        } catch (e) {
            throw new Error(`Error al renombrar: ${e.message}`);
        }
    }
}

// Instancia global de la calculadora
const calculator = new RelationalAlgebra();

// Clase para cálculo relacional de tuplas
class TupleCalculus {
    constructor() {
        this.tables = {};
    }

    // Registrar tablas disponibles
    setTables(tables) {
        this.tables = tables;
    }

    // Parsear y ejecutar consulta tipo {t | CONDICION(t)}
    executeQuery(query) {
        try {
            // Limpiar la consulta
            query = query.trim();
            
            console.log('=== INICIO DE CONSULTA ===');
            console.log('Consulta original:', query);
            
            // Validar formato básico
            if (!query.startsWith('{') || !query.endsWith('}')) {
                throw new Error('La consulta debe estar entre llaves { }');
            }

            // Extraer contenido entre llaves
            const content = query.slice(1, -1).trim();
            
            // Separar por |
            if (!content.includes('|')) {
                throw new Error('La consulta debe tener el formato {t | condición} o {atributos | condición}');
            }

            const parts = content.split('|');
            const target = parts[0].trim();
            const condition = parts.slice(1).join('|').trim();

            console.log('Target (proyección):', target);
            console.log('Condición:', condition);

            // Determinar si hay proyección (ej: e.nombre, s.apellido)
            let projectionAttrs = null;
            let projectionVars = {};
            
            if (target.includes(',') || target.includes('.')) {
                // Hay proyección específica
                const projections = target.split(',').map(p => p.trim());
                projectionAttrs = [];
                
                projections.forEach(proj => {
                    if (proj.includes('.')) {
                        const [varName, attrName] = proj.split('.').map(s => s.trim());
                        projectionAttrs.push({var: varName, attr: attrName});
                        projectionVars[varName] = true;
                    } else {
                        projectionAttrs.push({var: null, attr: proj});
                    }
                });
                
                console.log('Proyección detectada:', projectionAttrs);
            }

            // Ejecutar la consulta con ambas sintaxis
            const result = this.evaluateCondition(condition, projectionAttrs, projectionVars);
            
            console.log('Resultado final:', result);
            console.log('=== FIN DE CONSULTA ===');
            
            return result;
        } catch (e) {
            console.error('Error en executeQuery:', e);
            throw new Error(`Error en consulta: ${e.message}`);
        }
    }

    // Evaluar la condición de la consulta
    evaluateCondition(condition, projectionAttrs = null, projectionVars = {}) {
        console.log('=== evaluateCondition ===');
        console.log('Condición recibida:', condition);
        console.log('Proyección:', projectionAttrs);
        
        // Normalizar símbolos matemáticos a operadores JavaScript
        condition = this.normalizeCondition(condition);

        // Detectar variables y tablas de la consulta
        // Soporta dos formatos:
        // 1. t ∈ A (notación con símbolo ∈)
        // 2. TABLA(t) (notación con paréntesis)
        
        const variableMap = {};
        
        // Buscar patrón TABLA(variable) - ej: EMPLEADO(e)
        const tableParenRegex = /(\w+)\s*\(\s*(\w+)\s*\)/g;
        let match;
        while ((match = tableParenRegex.exec(condition)) !== null) {
            const tableName = match[1];
            const varName = match[2];
            
            if (!this.tables[tableName]) {
                throw new Error(`La tabla ${tableName} no está definida. Tablas disponibles: ${Object.keys(this.tables).join(', ')}`);
            }
            
            variableMap[varName] = tableName;
        }
        
        // Buscar patrón variable ∈ TABLA - ej: t ∈ A
        const tableSymbolRegex = /(\w+)\s*∈\s*(\w+)/g;
        while ((match = tableSymbolRegex.exec(condition)) !== null) {
            const varName = match[1];
            const tableName = match[2];
            
            if (!this.tables[tableName]) {
                throw new Error(`La tabla ${tableName} no está definida. Tablas disponibles: ${Object.keys(this.tables).join(', ')}`);
            }
            
            variableMap[varName] = tableName;
        }

        console.log('Variables encontradas:', variableMap);

        if (Object.keys(variableMap).length === 0) {
            throw new Error('No se encontraron referencias a tablas en la consulta. Usa formato: t ∈ A o A(t)');
        }

        // Si solo hay una variable, evaluación simple
        if (Object.keys(variableMap).length === 1) {
            console.log('Evaluación con UNA variable');
            const varName = Object.keys(variableMap)[0];
            const tableName = variableMap[varName];
            return this.evaluateSingleVariable(varName, tableName, condition, projectionAttrs);
        }

        // Si hay múltiples variables, evaluación con producto cartesiano
        console.log('Evaluación con MÚLTIPLES variables');
        return this.evaluateMultipleVariables(variableMap, condition, projectionAttrs);
    }

    // Evaluar consulta con una sola variable
    evaluateSingleVariable(varName, tableName, condition, projectionAttrs) {
        const table = this.tables[tableName];
        
        // Remover la declaración de la tabla de la condición
        let restCondition = condition
            .replace(new RegExp(`${varName}\\s*∈\\s*${tableName}`, 'gi'), '')
            .replace(new RegExp(`${tableName}\\s*\\(\\s*${varName}\\s*\\)`, 'gi'), '')
            .replace(/^\s*(AND|∧)\s*/i, '')
            .trim();

        console.log('Condición después de limpiar:', restCondition);

        // Si no hay más condiciones, retornar toda la tabla
        if (!restCondition || restCondition === '') {
            if (projectionAttrs) {
                return table.map(tuple => {
                    const context = {[varName]: tuple};
                    return this.projectSingleResult(tuple, projectionAttrs, context);
                });
            }
            return table;
        }

        // Filtrar filas según la condición
        const result = table.filter(tuple => {
            try {
                return this.evaluateTupleCondition(tuple, restCondition, varName);
            } catch (e) {
                console.error('Error evaluando tupla:', e);
                return false;
            }
        });

        // Aplicar proyección si existe
        if (projectionAttrs) {
            return result.map(tuple => {
                const context = {[varName]: tuple};
                return this.projectSingleResult(tuple, projectionAttrs, context);
            });
        }
        
        return result;
    }

    // Evaluar consulta con múltiples variables (producto cartesiano + filtro)
    evaluateMultipleVariables(variableMap, condition, projectionAttrs) {
        // Crear producto cartesiano de todas las tablas
        const variables = Object.keys(variableMap);
        const tables = variables.map(v => this.tables[variableMap[v]]);
        
        console.log('Variables:', variables);
        console.log('Tablas usadas:', variableMap);
        
        // Generar todas las combinaciones
        const combinations = this.cartesianProductMultiple(tables);
        console.log('Total de combinaciones:', combinations.length);
        
        // Remover declaraciones de tablas de la condición
        let restCondition = condition;
        for (const [varName, tableName] of Object.entries(variableMap)) {
            restCondition = restCondition
                .replace(new RegExp(`${varName}\\s*∈\\s*${tableName}`, 'gi'), '')
                .replace(new RegExp(`${tableName}\\s*\\(\\s*${varName}\\s*\\)`, 'gi'), '');
        }
        
        // Limpiar operadores lógicos sobrantes (al inicio, final, o múltiples consecutivos)
        restCondition = restCondition
            .replace(/^\s*(AND|∧|&&)\s*/gi, '')
            .replace(/\s*(AND|∧|&&)\s*$/gi, '')
            .replace(/\s+(AND|∧)\s+(AND|∧)\s+/gi, ' ∧ ')
            .replace(/^\s*∧\s*/g, '')
            .replace(/\s*∧\s*$/g, '')
            .trim();
        
        console.log('Condición limpia para evaluar:', restCondition);
        
        // Si no hay condición, retornar todas las combinaciones
        if (!restCondition || restCondition === '') {
            console.log('Sin condiciones adicionales, retornando todas las combinaciones');
            
            if (projectionAttrs) {
                return combinations.map(combo => {
                    const context = {};
                    variables.forEach((varName, idx) => {
                        context[varName] = combo[idx];
                    });
                    return this.projectMultiVarResult(combo, projectionAttrs, context);
                });
            }
            
            return combinations.map(combo => {
                const combined = {};
                variables.forEach((varName, idx) => {
                    for (const [key, value] of Object.entries(combo[idx])) {
                        combined[`${varName}.${key}`] = value;
                    }
                });
                return combined;
            });
        }
        
        // Filtrar combinaciones según la condición
        const result = combinations.filter(combo => {
            const context = {};
            variables.forEach((varName, idx) => {
                context[varName] = combo[idx];
            });
            
            try {
                const match = this.evaluateMultiVarCondition(restCondition, context);
                if (match) {
                    console.log('Match encontrado:', context);
                }
                return match;
            } catch (e) {
                console.error('Error evaluando combinación:', e);
                return false;
            }
        });

        console.log('Resultados filtrados:', result.length);

        // Aplicar proyección
        if (projectionAttrs) {
            return result.map(combo => {
                const context = {};
                variables.forEach((varName, idx) => {
                    context[varName] = combo[idx];
                });
                return this.projectMultiVarResult(combo, projectionAttrs, context);
            });
        }

        // Sin proyección, combinar todos los atributos
        return result.map(combo => {
            const combined = {};
            variables.forEach((varName, idx) => {
                for (const [key, value] of Object.entries(combo[idx])) {
                    combined[`${varName}.${key}`] = value;
                }
            });
            return combined;
        });
    }

    // Producto cartesiano de múltiples arrays
    cartesianProductMultiple(arrays) {
        if (arrays.length === 0) return [[]];
        if (arrays.length === 1) return arrays[0].map(item => [item]);
        
        const result = [];
        const rest = this.cartesianProductMultiple(arrays.slice(1));
        
        for (const item of arrays[0]) {
            for (const combo of rest) {
                result.push([item, ...combo]);
            }
        }
        
        return result;
    }

    // Evaluar condición con múltiples variables
    evaluateMultiVarCondition(condition, context) {
        if (!condition || condition === '') return true;
        
        // Reemplazar referencias variable.atributo con sus valores
        let evalCondition = condition;
        
        for (const [varName, tuple] of Object.entries(context)) {
            for (const [attr, value] of Object.entries(tuple)) {
                const pattern = new RegExp(`\\b${varName}\\.${attr}\\b`, 'g');
                const replacement = typeof value === 'string' ? `"${value}"` : 
                                   value === null ? 'null' : value;
                evalCondition = evalCondition.replace(pattern, replacement);
            }
        }

        // Normalizar operadores (hacerlo antes de limpiar && sobrantes)
        evalCondition = evalCondition
            .replace(/\s+AND\s+/gi, ' && ')
            .replace(/\s+OR\s+/gi, ' || ')
            .replace(/∧/g, ' && ')
            .replace(/∨/g, ' || ')
            .replace(/¬/g, '!')
            .replace(/([^!<>])=([^=])/g, '$1===$2')
            .replace(/!===/g, '!==');

        // Limpiar && o || al inicio o final
        evalCondition = evalCondition
            .replace(/^\s*(&&|\|\|)\s*/g, '')
            .replace(/\s*(&&|\|\|)\s*$/g, '')
            .trim();

        // Evaluar
        try {
            console.log('Evaluando condición final:', evalCondition);
            const result = eval(evalCondition);
            return result;
        } catch (e) {
            console.error('Error evaluando:', evalCondition, e);
            return false;
        }
    }

    // Proyectar resultado con múltiples variables
    projectMultiVarResult(combo, projectionAttrs, context) {
        const result = {};
        
        projectionAttrs.forEach(proj => {
            if (proj.var && context[proj.var]) {
                const tuple = context[proj.var];
                if (tuple.hasOwnProperty(proj.attr)) {
                    result[`${proj.var}.${proj.attr}`] = tuple[proj.attr];
                }
            }
        });
        
        return result;
    }

    // Proyectar resultado con una variable
    projectSingleResult(tuple, projectionAttrs, context) {
        const result = {};
        
        projectionAttrs.forEach(proj => {
            if (proj.var && context[proj.var]) {
                const t = context[proj.var];
                if (t.hasOwnProperty(proj.attr)) {
                    result[proj.attr] = t[proj.attr];
                }
            } else if (tuple.hasOwnProperty(proj.attr)) {
                result[proj.attr] = tuple[proj.attr];
            }
        });
        
        return result;
    }

    // Evaluar condición para una tupla específica
    evaluateTupleCondition(tuple, condition, tupleVar) {
        // Manejar cuantificadores existenciales (∃)
        if (condition.includes('∃')) {
            return this.evaluateExistential(tuple, condition, tupleVar);
        }

        // Manejar cuantificadores universales (∀)
        if (condition.includes('∀')) {
            return this.evaluateUniversal(tuple, condition, tupleVar);
        }

        // Manejar negaciones (¬)
        if (condition.startsWith('¬')) {
            const innerCondition = condition.slice(1).trim();
            return !this.evaluateTupleCondition(tuple, innerCondition, tupleVar);
        }

        // Manejar operadores lógicos
        if (condition.includes('∧')) {
            const parts = this.splitByLogicalOperator(condition, '∧');
            return parts.every(part => this.evaluateTupleCondition(tuple, part.trim(), tupleVar));
        }

        if (condition.includes('∨')) {
            const parts = this.splitByLogicalOperator(condition, '∨');
            return parts.some(part => this.evaluateTupleCondition(tuple, part.trim(), tupleVar));
        }

        // Evaluar condición simple
        return this.evaluateSimpleCondition(tuple, condition, tupleVar);
    }

    // Evaluar cuantificador existencial ∃
    evaluateExistential(tuple, condition, mainVar) {
        // Extraer la parte del cuantificador: ∃s(s ∈ B ∧ ...)
        const existMatch = condition.match(/∃\s*(\w+)\s*\((.*)\)/);
        if (!existMatch) {
            throw new Error('Formato incorrecto para cuantificador existencial');
        }

        const quantifiedVar = existMatch[1];
        const innerCondition = existMatch[2];

        // Identificar la tabla del cuantificador
        const tableMatch = innerCondition.match(new RegExp(`${quantifiedVar}\\s*∈\\s*(\\w+)`));
        if (!tableMatch) {
            throw new Error(`No se encontró tabla para ${quantifiedVar}`);
        }

        const tableName = tableMatch[1];
        if (!this.tables[tableName]) {
            throw new Error(`Tabla ${tableName} no definida`);
        }

        // Evaluar si existe al menos una tupla que satisfaga la condición
        return this.tables[tableName].some(otherTuple => {
            const context = {};
            context[mainVar] = tuple;
            context[quantifiedVar] = otherTuple;
            return this.evaluateWithContext(innerCondition, context, quantifiedVar, tableName);
        });
    }

    // Evaluar cuantificador universal ∀
    evaluateUniversal(tuple, condition, mainVar) {
        const universalMatch = condition.match(/∀\s*(\w+)\s*\((.*)\)/);
        if (!universalMatch) {
            throw new Error('Formato incorrecto para cuantificador universal');
        }

        const quantifiedVar = universalMatch[1];
        const innerCondition = universalMatch[2];

        const tableMatch = innerCondition.match(new RegExp(`${quantifiedVar}\\s*∈\\s*(\\w+)`));
        if (!tableMatch) {
            throw new Error(`No se encontró tabla para ${quantifiedVar}`);
        }

        const tableName = tableMatch[1];
        if (!this.tables[tableName]) {
            throw new Error(`Tabla ${tableName} no definida`);
        }

        // Evaluar si todas las tuplas satisfacen la condición
        return this.tables[tableName].every(otherTuple => {
            const context = {};
            context[mainVar] = tuple;
            context[quantifiedVar] = otherTuple;
            return this.evaluateWithContext(innerCondition, context, quantifiedVar, tableName);
        });
    }

    // Evaluar con contexto de múltiples variables
    evaluateWithContext(condition, context, quantifiedVar, tableName) {
        // Remover la parte de pertenencia
        let evalCondition = condition.replace(new RegExp(`${quantifiedVar}\\s*∈\\s*${tableName}\\s*(∧|∨)?`, 'i'), '').trim();
        
        // Reemplazar referencias a variables con sus valores
        for (const [varName, tuple] of Object.entries(context)) {
            for (const [attr, value] of Object.entries(tuple)) {
                const pattern = new RegExp(`${varName}\\.${attr}`, 'g');
                const replacement = typeof value === 'string' ? `"${value}"` : value;
                evalCondition = evalCondition.replace(pattern, replacement);
            }
        }

        // Evaluar la expresión resultante
        try {
            // Reemplazar operadores
            evalCondition = evalCondition.replace(/=/g, '===').replace(/!===/g, '!==');
            return eval(evalCondition);
        } catch (e) {
            console.error('Error evaluando contexto:', e);
            return false;
        }
    }

    // Evaluar condición simple (comparaciones)
    evaluateSimpleCondition(tuple, condition, tupleVar) {
        // Reemplazar referencias t.atributo con sus valores
        let evalCondition = condition;
        
        for (const [attr, value] of Object.entries(tuple)) {
            const pattern = new RegExp(`${tupleVar}\\.${attr}`, 'g');
            const replacement = typeof value === 'string' ? `"${value}"` : value;
            evalCondition = evalCondition.replace(pattern, replacement);
        }

        // Evaluar
        try {
            evalCondition = evalCondition.replace(/=/g, '===').replace(/!===/g, '!==');
            return eval(evalCondition);
        } catch (e) {
            return false;
        }
    }

    // Dividir por operador lógico respetando paréntesis
    splitByLogicalOperator(condition, operator) {
        const parts = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < condition.length; i++) {
            const char = condition[i];
            
            if (char === '(') depth++;
            if (char === ')') depth--;
            
            if (char === operator && depth === 0) {
                parts.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current) parts.push(current);
        return parts;
    }

    // Proyectar resultado
    projectResult(table, attributes) {
        return table.map(row => {
            const newRow = {};
            attributes.forEach(attr => {
                if (row.hasOwnProperty(attr)) {
                    newRow[attr] = row[attr];
                }
            });
            return newRow;
        });
    }

    // Normalizar símbolos matemáticos
    normalizeCondition(condition) {
        // Mantener símbolos matemáticos para procesamiento
        return condition
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Instancia del cálculo de tuplas
const tupleCalculus = new TupleCalculus();

// Funciones de interfaz
function getTableA() {
    const input = document.getElementById('tableA').value.trim();
    if (!input) throw new Error("Tabla A está vacía");
    return calculator.parseTable(input);
}

function getTableB() {
    const input = document.getElementById('tableB').value.trim();
    if (!input) throw new Error("Tabla B está vacía");
    return calculator.parseTable(input);
}

function displayResult(result, operation) {
    const resultDiv = document.getElementById('result');
    
    if (!result || result.length === 0) {
        resultDiv.innerHTML = `
            <div class="error">
                <strong>Resultado vacío</strong>
                <p>La operación "${operation}" no produjo resultados.</p>
            </div>
        `;
        return;
    }

    // Crear tabla HTML
    const headers = Object.keys(result[0]);
    let html = `
        <h3>Resultado de: ${operation}</h3>
        <p><strong>Filas:</strong> ${result.length}</p>
        <table>
            <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;

    result.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            html += `<td>${row[header] !== undefined ? row[header] : 'NULL'}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    resultDiv.innerHTML = html;
}

function displayError(error) {
    const resultDiv = document.getElementById('result');
    
    // Generar mensaje de ayuda basado en el error
    let helpMessage = '';
    
    if (error.message.includes('JSON') || error.message.includes('parsear')) {
        helpMessage = `
            <p><strong>Ayuda con el formato JSON:</strong></p>
            <ul>
                <li>Debe ser un array de objetos: <code>[{...}, {...}]</code></li>
                <li>Usa comillas dobles para las claves y valores de texto</li>
                <li>Ejemplo válido: <code>[{"id":1,"nombre":"Juan"}]</code></li>
            </ul>
        `;
    } else if (error.message.includes('tabla') && error.message.includes('no está definida')) {
        helpMessage = `
            <p><strong>Problema de nombre de tabla:</strong></p>
            <ul>
                <li>Si usas <code>A(e)</code> en la consulta, la tabla debe llamarse "A"</li>
                <li>Si usas <code>EMPLEADO(e)</code>, necesitas nombrar tu tabla "EMPLEADO"</li>
                <li>Las tablas definidas arriba se llaman "A" y "B" por defecto</li>
            </ul>
        `;
    } else if (error.message.includes('formato')) {
        helpMessage = `
            <p><strong>Ejemplos de consultas válidas:</strong></p>
            <ul>
                <li>Con ∈: <code>{t | t ∈ A ∧ t.edad > 25}</code></li>
                <li>Con paréntesis: <code>{e.nombre | A(e) AND e.edad > 25}</code></li>
                <li>Join: <code>{e.nombre, s.ciudad | A(e) AND B(s) AND e.id = s.id}</code></li>
            </ul>
        `;
    }
    
    resultDiv.innerHTML = `
        <div class="error">
            <strong>Error:</strong>
            <p>${error.message}</p>
            ${helpMessage}
        </div>
    `;
}

// Operaciones
function performSelection() {
    try {
        const condition = prompt(
            'Ingresa la condición de selección (usa nombres de atributos):\n\n' +
            'Ejemplos:\n' +
            '  edad > 25\n' +
            '  nombre === "Juan"\n' +
            '  edad >= 20 && edad <= 30'
        );
        
        if (!condition) return;
        
        const tableA = getTableA();
        const result = calculator.selection(tableA, condition);
        displayResult(result, `σ Selección (${condition})`);
    } catch (e) {
        displayError(e);
    }
}

function performProjection() {
    try {
        const tableA = getTableA();
        const availableAttrs = Object.keys(tableA[0]).join(', ');
        
        const attributes = prompt(
            `Ingresa los atributos a proyectar (separados por coma):\n\n` +
            `Atributos disponibles: ${availableAttrs}\n\n` +
            `Ejemplo: id, nombre`
        );
        
        if (!attributes) return;
        
        const result = calculator.projection(tableA, attributes);
        displayResult(result, `π Proyección (${attributes})`);
    } catch (e) {
        displayError(e);
    }
}

function performUnion() {
    try {
        const tableA = getTableA();
        const tableB = getTableB();
        const result = calculator.union(tableA, tableB);
        displayResult(result, '∪ Unión (A ∪ B)');
    } catch (e) {
        displayError(e);
    }
}

function performIntersection() {
    try {
        const tableA = getTableA();
        const tableB = getTableB();
        const result = calculator.intersection(tableA, tableB);
        displayResult(result, '∩ Intersección (A ∩ B)');
    } catch (e) {
        displayError(e);
    }
}

function performDifference() {
    try {
        const tableA = getTableA();
        const tableB = getTableB();
        const result = calculator.difference(tableA, tableB);
        displayResult(result, '− Diferencia (A − B)');
    } catch (e) {
        displayError(e);
    }
}

function performProduct() {
    try {
        const tableA = getTableA();
        const tableB = getTableB();
        const result = calculator.cartesianProduct(tableA, tableB);
        displayResult(result, '× Producto Cartesiano (A × B)');
    } catch (e) {
        displayError(e);
    }
}

function performJoin() {
    try {
        const tableA = getTableA();
        const tableB = getTableB();
        const result = calculator.naturalJoin(tableA, tableB);
        displayResult(result, '⋈ Join Natural (A ⋈ B)');
    } catch (e) {
        displayError(e);
    }
}

function performRename() {
    try {
        const tableA = getTableA();
        const availableAttrs = Object.keys(tableA[0]).join(', ');
        
        const oldName = prompt(
            `Atributos disponibles: ${availableAttrs}\n\n` +
            `Ingresa el nombre del atributo a renombrar:`
        );
        if (!oldName) return;
        
        const newName = prompt('Ingresa el nuevo nombre:');
        if (!newName) return;
        
        const result = calculator.rename(tableA, oldName, newName);
        displayResult(result, `ρ Renombrar (${oldName} → ${newName})`);
    } catch (e) {
        displayError(e);
    }
}

function executeTupleQuery() {
    try {
        const query = document.getElementById('tupleQuery').value.trim();
        if (!query) {
            displayError(new Error('Por favor ingresa una consulta en el campo de texto'));
            return;
        }

        // Obtener todas las tablas desde el campo de tablas personalizadas
        const tables = {};
        
        const customInput = document.getElementById('customTables').value.trim();
        if (customInput) {
            const lines = customInput.split('\n');
            lines.forEach((line, idx) => {
                line = line.trim();
                if (!line) return;
                
                const equalIdx = line.indexOf('=');
                if (equalIdx === -1) {
                    throw new Error(`Línea ${idx + 1}: formato incorrecto. Use NOMBRE=[...JSON...]`);
                }
                
                const tableName = line.substring(0, equalIdx).trim();
                const tableJson = line.substring(equalIdx + 1).trim();
                
                if (!tableName) {
                    throw new Error(`Línea ${idx + 1}: falta el nombre de la tabla`);
                }
                
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
                    throw new Error(`Nombre de tabla inválido en línea ${idx + 1}: "${tableName}". Use solo letras, números y guiones bajos, empezando con letra.`);
                }
                
                try {
                    tables[tableName] = calculator.parseTable(tableJson);
                    console.log(`Tabla ${tableName} cargada:`, tables[tableName].length, 'filas');
                } catch (e) {
                    throw new Error(`Error en tabla ${tableName} (línea ${idx + 1}): ${e.message}`);
                }
            });
        }

        if (Object.keys(tables).length === 0) {
            throw new Error('No hay tablas definidas. Define al menos una tabla usando el formato: NOMBRE=[{...}]');
        }

        console.log('Tablas disponibles:', Object.keys(tables).join(', '));
        console.log('Consulta a ejecutar:', query);

        // Configurar tablas y ejecutar consulta
        tupleCalculus.setTables(tables);
        const result = tupleCalculus.executeQuery(query);
        
        console.log('Resultado:', result);
        
        if (!result || result.length === 0) {
            displayResult([], `Consulta: ${query}`);
        } else {
            displayResult(result, `Consulta: ${query}`);
        }
    } catch (e) {
        console.error('Error completo:', e);
        displayError(e);
    }
}

function clearAllTables() {
    if (confirm('¿Estás seguro de que quieres limpiar todas las tablas?')) {
        document.getElementById('customTables').value = '';
        document.getElementById('tupleQuery').value = '';
        
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <div class="info">
                <p>Todas las tablas han sido limpiadas.</p>
                <p>Define tus tablas y escribe una consulta para comenzar.</p>
            </div>
        `;
    }
}

function showQueryExamples() {
    const examples = `
EJEMPLOS DE CONSULTAS EN CÁLCULO RELACIONAL DE TUPLAS:

=== NOTACIÓN CON ∈ ===

1. Empleados con edad > 25:
   {t | t ∈ EMPLEADO ∧ t.edad > 25}

2. Proyección (solo nombres y edades):
   {t.nombre, t.edad | t ∈ EMPLEADO}

3. Join entre dos tablas:
   {e.nombre, d.nombre | e ∈ EMPLEADO ∧ d ∈ DEPARTAMENTO ∧ e.dept_id = d.id}

4. Join de tres tablas:
   {e.nombre, d.nombre, c.nombre | e ∈ EMPLEADO ∧ d ∈ DEPARTAMENTO ∧ c ∈ CIUDAD 
    ∧ e.dept_id = d.id ∧ e.id = c.emp_id}

=== NOTACIÓN CON PARÉNTESIS ===

5. Selección simple:
   {e.nombre, e.edad | EMPLEADO(e) AND e.edad > 25}

6. Join de dos tablas:
   {e.nombre, d.nombre | EMPLEADO(e) AND DEPARTAMENTO(d) AND e.dept_id = d.id}

7. Join múltiple (3+ tablas):
   {e.nombre, d.nombre, p.titulo | EMPLEADO(e) AND DEPARTAMENTO(d) AND PROYECTO(p) 
    AND e.dept_id = d.id AND e.id = p.emp_id}

8. Self-join (misma tabla, dos variables):
   {e.nombre, s.nombre | EMPLEADO(e) AND EMPLEADO(s) AND e.supervisor_id = s.id}

9. Condiciones complejas:
   {e.nombre | EMPLEADO(e) AND e.edad > 20 AND e.edad < 35 AND e.dept_id = 1}

=== FORMATO DE TABLAS ===

Define tus tablas así:
EMPLEADO=[{"id":1,"nombre":"Juan","edad":25,"dept_id":1}]
DEPARTAMENTO=[{"id":1,"nombre":"IT","presupuesto":100000}]

NOTA: 
- Usa cualquier nombre para tus tablas (letras, números, guiones bajos)
- Los nombres deben empezar con letra
- Los nombres en las consultas deben coincidir exactamente
- Puedes definir ilimitadas tablas
    `;
    
    alert(examples);
}

function loadExamples() {
    // Ejemplo de tablas
    const customExample = `EMPLEADO=${JSON.stringify([
        {id: 1, nombre: "Juan", edad: 25, dept_id: 1},
        {id: 2, nombre: "Ana", edad: 30, dept_id: 2},
        {id: 3, nombre: "Carlos", edad: 28, dept_id: 1},
        {id: 4, nombre: "María", edad: 35, dept_id: 3}
    ])}
DEPARTAMENTO=${JSON.stringify([
        {id: 1, nombre: "IT", presupuesto: 100000},
        {id: 2, nombre: "HR", presupuesto: 50000},
        {id: 3, nombre: "Finanzas", presupuesto: 80000}
    ])}
CIUDAD=${JSON.stringify([
        {emp_id: 1, nombre: "Madrid", pais: "España"},
        {emp_id: 2, nombre: "Barcelona", pais: "España"},
        {emp_id: 3, nombre: "Valencia", pais: "España"}
    ])}
PROYECTO=${JSON.stringify([
        {id: 1, titulo: "Web App", emp_id: 1},
        {id: 2, titulo: "Mobile App", emp_id: 2},
        {id: 3, titulo: "API REST", emp_id: 3}
    ])}`;
    
    document.getElementById('customTables').value = customExample;
    
    // Cargar consulta de ejemplo con join de múltiples tablas
    document.getElementById('tupleQuery').value = '{e.nombre, d.nombre, c.nombre | EMPLEADO(e) AND DEPARTAMENTO(d) AND CIUDAD(c) AND e.dept_id = d.id AND e.id = c.emp_id}';
    
    alert('Ejemplos cargados correctamente.\n\n' +
          'Ahora puedes:\n' +
          '  • Ejecutar la consulta de ejemplo (join de 3 tablas)\n' +
          '  • Modificar las tablas según necesites\n' +
          '  • Ver más ejemplos de consultas\n\n' +
          'Tablas cargadas: EMPLEADO, DEPARTAMENTO, CIUDAD, PROYECTO');
}

// Insertar símbolo en el textarea
function insertSymbol(symbol) {
    const textarea = document.getElementById('tupleQuery');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    // Insertar el símbolo en la posición del cursor
    textarea.value = text.substring(0, start) + symbol + text.substring(end);
    
    // Mover el cursor después del símbolo insertado
    textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
    
    // Enfocar el textarea
    textarea.focus();
}

// Toggle mostrar/ocultar teclado
function toggleKeyboard() {
    const keyboard = document.getElementById('symbolKeyboard');
    const toggleText = document.getElementById('keyboardToggleText');
    
    if (keyboard.style.display === 'none') {
        keyboard.style.display = 'grid';
        toggleText.textContent = 'Ocultar';
    } else {
        keyboard.style.display = 'none';
        toggleText.textContent = 'Mostrar';
    }
}

// Mostrar mensaje inicial
document.addEventListener('DOMContentLoaded', () => {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="info">
            <p>Define tus tablas arriba y selecciona una operación.</p>
            <p>Presiona "Cargar Ejemplo" para ver datos de muestra.</p>
            <p>Usa el teclado de símbolos para insertar operadores especiales.</p>
        </div>
    `;
});
