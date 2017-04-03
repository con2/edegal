# Edegal – Fast Web Image Gallery

## Responsive Web Frontend

This is the browser frontend for desktop & mobile browsers. Technology choices include

* TypeScript
* React
* Redux
* Material UI

## Getting started

### The Docker Compose Way

This is the recommended way to develop Edegal. There is a single unified Docker Compose development environment for both the frontend and the backend. For instructions, see `README.md` in the parent directory.

### The Traditional Way

If, for some reason, you want to develop the Edegal frontend without using Docker, follow these instructions.

Requirements:

* Node.js 7.x (tested: 7.6)

Yarn is recommended over `npm`.

You should get up and running with the following commands:

    git clone git@github.com:conikuvat/edegal-frontend
    cd edegal-frontend
    yarn install # or npm install
    yarn start   # or npm start
    iexplore http://localhost:8080
