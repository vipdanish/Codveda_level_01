# Full-Stack Development Internship - Level_1 @Codveda

Welcome to Level 1 of the **Codveda Technology Full-Stack Development Internship**. This document outlines the tasks, setup instructions, and objectives for the first level.

---

## How to Set Up and Run the Project

### Create a Project Directory
```sh
mkdir my_project && cd my_project
```
---
### Save the level_1.js file in this directory
copy form this ripo (you need to copy just level_1 file )

---
### Install Dependencies
```sh
npm install express ejs sequelize sqlite3 method-override
```
---
### Run the Application
```sh
node level_1.js
```
---
## Access the Website
```sh
http://localhost:3000
```
---

This application is entirely contained in a single file (`level_1.js`) that:

1. Sets up the Express application
2. Creates necessary directories and files
3. Defines the database model
4. Sets up all routes
5. Configures error handling
6. Starts the server

When you run the application, it automatically creates a SQLite database file in the project directory.

---

## How to Contribute

1. Fork this repository
2. Create a new branch for your feature
3. Add your changes
4. Submit a pull request

---

## Deployment

To deploy this application to production:

1. Set `NODE_ENV=production`
2. Consider using a process manager like **PM2**
3. Use a reverse proxy like **Nginx** or **Apache**

---

Thanks for Visiting! ⭐ Give a star to the repo! 🚀

