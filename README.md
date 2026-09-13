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
- Los gatitos comodín (✦) completan cualquier fila, sin importar el tipo del resto.

## Modos de juego

- **⏱️ Clásico**: 90 segundos, sumás +1s de tiempo por cada fila acertada, competís por tu mejor puntaje.
- **🌿 AntiAnsiedad**: sin cronómetro ni presión, para jugar a tu propio ritmo.

## Música

Hay una pista lofi generada 100% con la Web Audio API (sin archivos de audio externos),
con un botón para mutear/desmutear que recuerda tu preferencia entre visitas.

## Stack

Sitio estático sin build step: HTML + CSS + JavaScript vanilla con ES Modules nativos
del navegador (`<script type="module">`), sin dependencias ni empaquetador. Los gatitos
están dibujados en SVG inline. Pensado mobile-first (gestos táctiles, `touch-action`,
layout centrado).

### Estructura del proyecto

```
index.html          Marcado de la página (HUD, tablero, overlays)
css/
  styles.css         Todos los estilos
js/
  cats.js            Tipos de gatitos (incluye el comodín) y su dibujo en SVG
  audio.js           Música lofi (Web Audio API) y control de mute
  game.js            Lógica del juego: tablero, matching, puntaje, modos y UI
```

`game.js` importa desde `cats.js` y `audio.js` con `import`/`export` estándar; no hace
falta ningún paso de compilación, sirve tal cual desde cualquier hosting estático.

## Correrlo localmente

Como el juego usa ES Modules (`import`/`export`), los navegadores no los cargan si abrís
`index.html` directamente como archivo local (`file://`). Hay que servir la carpeta con
cualquier servidor estático:

```bash
npx serve .
```

## Deploy

Este proyecto está desplegado en Vercel como sitio estático (el propio `index.html` es la
raíz del sitio), conectado directamente a este repo: cada push a `main` dispara un deploy
automático.
