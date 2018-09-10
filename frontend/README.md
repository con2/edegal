# Edegal – Fast Web Image Gallery

## Responsive Web Frontend

This is the browser frontend for desktop & mobile browsers. Technology choices include

* TypeScript
* React
* Redux

## Getting started

### The Docker Compose Way

This is the recommended way to develop Edegal. There is a single unified Docker Compose development environment for both the frontend and the backend. For instructions, see `README.md` in the parent directory.

### The Traditional Way

If, for some reason, you want to develop the Edegal frontend without using Docker, follow these instructions.

Requirements:

* Node.js 10.x or 8.x

Yarn is not supported, only `npm` is.

Change `proxy` in `package.json` to point to wherever you are running the Django backend.

You should get up and running with the following commands:

    git clone git@github.com:conikuvat/edegal-frontend
    cd edegal-frontend
    npm install
    npm start
    iexplore http://localhost:8080
