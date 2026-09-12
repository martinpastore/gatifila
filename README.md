# 🐱 GatiFila — Sopa de Gatitos

Juego de navegador pensado para celulares: una variante de "sopa de letras" donde en vez de
buscar palabras, arrastrás en línea recta para armar hileras de 3 o más gatitos del mismo tipo.

## Cómo jugar

- Arrastrá desde una celda en línea recta (horizontal, vertical o diagonal).
- La selección se marca en verde si todas las celdas coinciden, o en rojo si no.
- Al soltar con 3 o más celdas del mismo tipo, se juntan, suman puntos y las columnas
  caen y se rellenan con gatitos nuevos.
- El tablero siempre garantiza que exista al menos una jugada posible; si en algún momento
  no queda ninguna, se reordena solo.

## Modos de juego

- **⏱️ Clásico**: 90 segundos, sumás +1s de tiempo por cada fila acertada, competís por tu mejor puntaje.
- **🌿 AntiAnsiedad**: sin cronómetro ni presión, para jugar a tu propio ritmo.

## Stack

Un solo archivo HTML autocontenido (`index.html`): HTML + CSS + JavaScript vanilla, sin
dependencias ni build step. Los gatitos están dibujados en SVG inline. Pensado mobile-first
(gestos táctiles, `touch-action`, layout centrado).

## Correrlo localmente

Abrí `index.html` directamente en el navegador, o serví la carpeta con cualquier servidor
estático:

```bash
npx serve .
```

## Deploy

Este proyecto está desplegado en Vercel como sitio estático (el propio `index.html` es la
raíz del sitio).
