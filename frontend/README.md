# Edegal – Fast Web Image Gallery

## Responsive Web Frontend

This is the browser frontend for desktop & mobile browsers. Technology choices include

* TypeScript
* React
  * Simple state management, no Redux etc.

## Getting started

### The Docker Compose Way

This is the recommended way to develop Edegal. There is a single unified Docker Compose development environment for both the frontend and the backend. For instructions, see `README.md` in the parent directory.

When developing with Docker Compose, the frontend will use the local backend running under Docker Compose.

### The Traditional Way

If, for some reason, you want to develop the Edegal frontend without using Docker, follow these instructions.

When developing without Docker, the frontend will, by default, use the Conikuvat.fi live production backend. If you want to use another backend, change `proxy` in `package.json`.

Requirements:

* Node.js 12.x (10.x or 8.x may work, but are not supported)

Yarn is not supported, only `npm` is.

You should get up and running with the following commands:

    git clone git@github.com:conikuvat/edegal
    cd edegal/frontend
    npm install
    npm start
    iexplore http://localhost:3000
