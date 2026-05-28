Diseña en Figma una aplicación móvil moderna, profesional e intuitiva para Android e iOS desarrollada para la empresa textil Maintegral. Este diseño corresponde al SEGUNDO SPRINT del proyecto universitario, por lo que debe enfocarse únicamente en las nuevas funcionalidades agregadas al MVP ya existente y en las historias de usuario prioritarias del Sprint 2.

La aplicación YA cuenta con una implementación funcional desarrollada con React, TypeScript y Supabase, por lo que el diseño debe respetar una arquitectura realista, modular y fácil de implementar sin cambios complejos en la base de datos ni en la lógica actual.

La interfaz debe transmitir eficiencia industrial, claridad visual y facilidad de uso para operarios, encargados de inventario, supervisores y gerentes. Usa un estilo UI moderno tipo SaaS/mobile enterprise app, con colores relacionados al sector textil e industrial:

* azul oscuro
* blanco
* gris claro
* detalles en naranja, rojo y verde para alertas y estados

## CONTEXTO DEL PROYECTO

Maintegral es una empresa textil colombiana con más de 10 años de experiencia confeccionando prendas para marcas reconocidas como Americanino y J Balvin.

Actualmente está migrando sus procesos manuales a una plataforma digital móvil para centralizar:

* control de inventarios
* producción
* gestión operativa entre sedes

El Sprint 1 ya implementó exitosamente:

* Login
* Dashboard principal
* Registro de insumos
* Registro de órdenes de producción
* Consulta de órdenes
* Gestión de producción
* Alertas de faltantes
* Control básico de inventario

Ahora el Sprint 2 busca mejorar:

* priorización de órdenes
* control entre sedes
* automatización de inventario
* eliminación de órdenes
* monitoreo operativo

## IMPORTANTE

Diseñar SOLAMENTE funcionalidades del Sprint 2.

NO diseñar:

* dashboards complejos
* inteligencia artificial
* analítica avanzada
* gráficas avanzadas
* ERP web
* automatizaciones industriales complejas
* integraciones externas
* sistemas desktop

Debe verse como una evolución REALISTA del MVP ya desarrollado.

## HISTORIAS DE USUARIO DEL SPRINT 2

### HU1

Como Jefe de Producción
Quiero adicionar las órdenes de producción con mayor prioridad
Para cumplir fechas de entrega críticas y evitar penalizaciones

### HU2

Como Dueño/Gerente
Quiero consultar la producción de ambas sedes
Para detectar retrasos o cuellos de botella

### HU3

Como Encargado de Inventario
Quiero eliminar órdenes de la lista
Para desechar proyectos descartados o finalizados

### HU4

Como Encargado de Inventario
Quiero actualizar automáticamente el inventario después de cada venta
Para evitar inconsistencias

# CONTEXTO TÉCNICO REAL (MUY IMPORTANTE)

La aplicación YA está desarrollada usando:

* React
* TypeScript
* React Router
* TailwindCSS
* Supabase
* Lucide React

El diseño debe respetar esta implementación real.

NO generar interfaces imposibles de implementar.

## RUTAS YA EXISTENTES

La app ya usa navegación real con React Router:

* /dashboard
* /login
* /ordenes/consulta
* /ordenes/registro
* /produccion/gestion
* /insumos/registro
* /insumos/faltantes

Las nuevas pantallas deben sentirse conectadas a esta estructura.

## COMPONENTES YA EXISTENTES

La app YA reutiliza:

* Card
* CardContent
* Button
* Input
* Select
* Badge
* MobileNav

Por lo tanto:

* reutilizar cards modernas
* reutilizar modales
* reutilizar badges
* reutilizar navegación inferior
* reutilizar formularios
* mantener consistencia visual

NO crear estilos completamente diferentes.

## ESTILO VISUAL YA IMPLEMENTADO

La aplicación actual usa:

* fondo gris claro
* cards blancas
* bordes redondeados
* sombras suaves
* diseño mobile-first
* navegación inferior fija
* encabezados sticky
* estilo SaaS industrial

Colores ya existentes:

* azul principal:

  * #1e3a8a
  * #3b82f6

Estados:

* rojo = crítico
* naranja = advertencia
* verde = correcto

El Sprint 2 debe sentirse como una evolución natural del Sprint 1.

# BASE DE DATOS YA IMPLEMENTADA EN SUPABASE

## Tabla usuarios

Contiene:

* id_usuario
* nombre
* usuario_acceso
* contrasena
* id_sede

## Tabla insumos

Contiene:

* id_insumo
* nombre
* categoria
* cantidad
* unidad_medida
* stock_minimo
* id_sede
* id_usuario_responsable

## Tabla movimientosinventario

Contiene:

* tipo
* id_insumo
* cantidad
* motivo
* id_usuario
* id_sede

## Tabla ordenesproduccion

Contiene:

* id_orden
* cliente
* prenda
* cantidad
* fecha_entrega
* prioridad
* estado
* id_sede
* id_usuario_responsable

# FUNCIONALIDADES YA IMPLEMENTADAS

La app YA tiene:

* Login funcional
* Persistencia con localStorage
* Consultas Supabase
* Inserts y updates
* Gestión por sedes
* Alertas automáticas
* Estados visuales
* Filtros
* Búsquedas
* Prioridades
* Progreso de producción
* Gestión de stock
* Historial de movimientos

Las nuevas pantallas deben reutilizar esta lógica existente.

NO rediseñar completamente la arquitectura.

# PANTALLAS QUE DEBE DISEÑAR FIGMA

## 1. Dashboard Mejorado del Sprint 2

Debe verse como evolución del dashboard actual.

Agregar:

* resumen operativo por sedes
* órdenes prioritarias
* alertas críticas
* accesos rápidos nuevos
* producción resumida
* indicadores simples de retraso

NO usar analytics complejos.

## 2. Pantalla de Priorización de Órdenes

Relacionada con HU1.

Debe incluir:

* lista de órdenes activas
* selector de prioridad
* chips visuales:

  * alta
  * media
  * baja
* fecha límite
* estado actual
* reordenamiento visual
* indicadores urgentes
* modal de confirmación

Debe parecer fácilmente implementable usando cards y badges existentes.

## 3. Pantalla de Producción por Sedes

Relacionada con HU2.

Debe incluir:

* comparación entre sedes
* cantidad de órdenes activas
* estado operativo
* tarjetas comparativas
* filtros simples
* indicadores:

  * en tiempo
  * riesgo
  * retraso
* resumen visual sencillo

NO usar gráficas complejas.

## 4. Pantalla de Eliminación de Órdenes

Relacionada con HU3.

Debe incluir:

* lista de órdenes
* buscador
* filtros básicos
* botón eliminar
* modal de confirmación
* motivo opcional
* indicador visual seguro

La experiencia debe sentirse controlada y empresarial.

## 5. Pantalla de Actualización Automática de Inventario

Relacionada con HU4.

Debe mostrar:

* historial reciente
* movimientos automáticos
* actualización visual de stock
* cambios recientes
* alertas automáticas
* actividad reciente
* confirmaciones automáticas

Debe transmitir automatización simple y confiable.

## 6. Pantalla de Historial de Movimientos

Basada en movimientosinventario.

Debe incluir:

* entrada/salida
* motivo
* usuario
* sede
* cantidad
* fecha
* buscador
* filtros rápidos

Diseño tipo ERP móvil moderno.

# FUNCIONALIDADES EXISTENTES QUE DEBEN EXTENDERSE

## ConsultaOrdenes

Actualmente ya tiene:

* búsqueda
* filtros
* badges
* cards

Sprint 2 debe extenderlo para:

* eliminación de órdenes
* priorización avanzada
* ordenamiento por urgencia

## GestionProduccion

Actualmente ya tiene:

* actualización de estado
* progreso visual
* edición de órdenes

Sprint 2 debe extenderlo para:

* control entre sedes
* alertas de retraso
* prioridad avanzada

## Dashboard

Actualmente ya tiene:

* estadísticas simples
* accesos rápidos
* alertas recientes

Sprint 2 debe evolucionarlo agregando:

* indicadores por sede
* métricas simples
* prioridades operativas

## ReporteFaltantes

Actualmente ya tiene:

* alertas críticas
* reportes automáticos
* actualización de stock

Sprint 2 debe extenderlo para:

* automatización tras ventas
* historial de movimientos
* trazabilidad simple

# ESTILO VISUAL

* UI moderna tipo SaaS industrial
* diseño minimalista empresarial
* mobile-first
* navegación inferior fija
* cards modernas
* sombras suaves
* bordes redondeados
* tipografía limpia
* diseño consistente
* componentes reutilizables
* modales modernos
* badges de estado
* chips de prioridad

# EXPERIENCIA DE USUARIO

La aplicación debe sentirse:

* rápida
* intuitiva
* empresarial
* moderna
* industrial
* organizada
* operativa
* realista técnicamente
* coherente con React + Supabase

# ENTREGA VISUAL ESPERADA

Genera:

* wireframes low fidelity
* mockups high fidelity
* prototipo navegable básico
* sistema de diseño actualizado
* componentes reutilizables
* estados vacíos
* estados de error
* modales
* confirmaciones
* flujo completo del Sprint 2

# REFERENCIAS VISUALES

Inspirarse en:

* SAP Fiori
* Notion
* Monday
* Trello Mobile
* ERP industriales móviles
* aplicaciones SaaS operativas
* sistemas modernos de inventario

# OBJETIVO FINAL

El resultado debe parecer:

* un Sprint 2 realista
* una evolución profesional del MVP ya implementado
* una app universitaria muy bien desarrollada
* un sistema móvil industrial moderno
* una aplicación realmente implementable usando React + TypeScript + Tailwind + Supabase
