# GymScore - Plataforma de Competiciones de Gimnasia Artística

## Visión
Plataforma moderna para gestionar competiciones de gimnasia artística con puntuaciones en directo, resultados online y experiencia digital para clubes, jueces y espectadores.

## Usuarios

### Espectadores (público, sin login)
- Ver listado de competiciones
- Buscar competiciones
- Ver categorías de cada competición
- Ver resultados/clasificaciones en tiempo real
- Ver notas desglosadas por aparato
- Ver historial de un gimnasta

### Jueces/Administradores (con login)
- Crear y gestionar competiciones
- Crear categorías dentro de competiciones
- Registrar gimnastas y clubes
- Introducir puntuaciones por aparato
- Modificar puntuaciones en directo

## Modelo de Datos

### Competiciones
- nombre, ubicación, fecha, jornadas
- Estado: borrador, activa, finalizada

### Categorías
- nombre (Escolar Cadete, Senior, Junior, Infantil, etc.)
- género (Femenino/Masculino)
- competición a la que pertenece
- jornada

### Clubes
- nombre, bandera/escudo

### Gimnastas
- nombre completo, club

### Puntuaciones
- gimnasta, categoría
- Aparatos GAF (femenino): Salto, Paralelas asimétricas, Barra de equilibrio, Suelo
- Aparatos GAM (masculino): Suelo, Caballo con arcos, Anillas, Salto, Paralelas, Barra fija
- Cada aparato: nota_dificultad (D-score), nota_ejecución (E-score), nota_final
- Total = suma de todos los aparatos

## Páginas Públicas

1. **/** - Landing page hero con logo, título, CTA
2. **/competiciones** - Grid de competiciones con búsqueda
3. **/competiciones/[slug]/categorias** - Categorías de una competición
4. **/competiciones/[slug]/[categoriaId]** - Tabla de resultados con clasificación
5. **/competiciones/[slug]/[categoriaId]/[aparato]** - Detalle por aparato
6. **/gimnasta/[nombre]** - Historial del gimnasta

## Panel Admin (/admin)

1. **/admin** - Dashboard
2. **/admin/competiciones** - CRUD competiciones
3. **/admin/competiciones/[id]/categorias** - Gestión categorías
4. **/admin/competiciones/[id]/[categoriaId]/puntuaciones** - Input de notas

## Diseño
- Tema oscuro para landing, tema claro para resultados
- Cards con bordes suaves para competiciones y categorías
- Badges de color para género (rojo=femenino, azul=masculino)
- Iconos de aparatos en cabeceras de tabla
- Banderas de clubs en resultados
- Responsive: tablas horizontally scrollable en móvil
- Mejoras sobre original: gradientes sutiles, animaciones, mejor tipografía, dark mode toggle
