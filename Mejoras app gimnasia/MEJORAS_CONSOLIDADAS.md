# Mejoras App Gimnasia - Consolidado

Fuente: Entrevista con usuaria de la app (8/5/2026) — audios + fotos + mensaje texto.

## Contexto
- Sistema oficial: **gymlive.es** (Federación Extremeña de Gimnasia, JUDEX GAF y GAM).
- Hoja de juez impresa y panel de captura de notas en producción.
- Categorías (ej.: Base 2), gimnastas con dorsal, aparatos: Salto, 2º Salto, Paralelas, Barra, Suelo.
- Nota final = 10 - DeducciónE (+ Dificultad si aplica) - Deducción Neutral.

## Modelo de Nota correcto
- **Nota D (Dificultad)**: máx 2.5
- **Deducciones Nota E**: lo que se resta a 10 (nota final ejecución)
- **Deducciones Neutrales**: penalización adicional
- Nota final = 10 - DeduccionesE - DeduccionesNeutrales + Dificultad

(Quitar concepto antiguo de "programa".)

## Lista de Mejoras

### 1. Validación dorsal-categoría
Si en un grupo hay 2 categorías y al meter notas se pone un dorsal de OTRA categoría/grupo, **no debe dejar guardar**. Mostrar error: "Este dorsal no pertenece a la categoría/grupo actual".

### 2. Deducción neutral no puede dejar nota en negativo
Si al restar la deducción neutral la nota final quedaría < 0, **no permitir** guardar esa deducción (o capear la nota a 0). Mostrar feedback al juez.

### 3. Mostrar línea `_` cuando la nota es 0 o no existe
Actualmente: si una nota se cambia a 0 manualmente, aparece `0.000`; el resto muestra `_`.
Esperado: si todos los componentes son 0 (no introducidos), mostrar línea `_` automáticamente. Tratar 0 como "no introducido" si fue un reset.

### 4. Bloquear edición fuera de la fecha de competición
Cambios antes/después del día de la competición se anulan automáticamente. Solo permitir meter/editar notas durante la fecha oficial de la competición. (O al menos bloquear cambios y avisar.)

### 5. Vista detalle por aparato: botón "Notas Generales"
Cuando el juez pulsa un icono y ve únicamente las notas de un aparato, añadir un botón visible "Notas Generales" para volver a la vista global (no obligar a pulsar de nuevo el icono ni "volver").

### 6. Botones por cada aparato + botón general
En la vista de un gimnasta, un botón por cada aparato (filtrar a ese aparato) y un botón "General" para volver a la vista total.

### 7. Orden de visualización de notas
Mostrar primero la **nota general (final)**, debajo la **nota de dificultad**. NO mostrar primero la penalización.

### 8. Pinchar la nota → mostrar Ejecución + Neutral
Al pinchar/hacer click en una nota concreta, mostrar SOLO: Nota de Ejecución + Deducciones Neutrales. (Detalle del breakdown.)

### 9. Quitar "programa" de hoja de juez
Eliminar columna/campo "programa". Estructura correcta de columnas:
- Dorsal | Gimnastas | Categoría | Club | **Nota D** | **Deducciones Nota E** | **Deducciones Neutrales**
