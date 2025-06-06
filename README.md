# PSU Hub

PSU Hub is a full-stack platform designed to streamline the creation, management, and attendance of university events at Prince Sultan University (PSU). It supports multiple user roles including Admin, PSU Admin (Board Member), and Faculty, each with tailored dashboards and analytics. The system includes real-time notifications via Socket.IO and provides comprehensive analytics with export capabilities.

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Usage & Workflows](#usage--workflows)
- [Additional Notes](#additional-notes)
- [License](#license)

## Overview

PSU Hub facilitates the complete event lifecycle at Prince Sultan University. Key functionalities include:
- **Event Management:** Create, edit, delete, and publish events.
- **Role-Based Dashboards:** 
  - **Admin:** Manage events, publish approved events, and view analytics.
  - **PSU Admin (Board Member):** Approve or reject pending events.
  - **Faculty:** Browse published events, view detailed event information, and register for events.
- **Real-Time Notifications:** Receive updates as events are added or modified.
- **Analytics:** View overall statistics (total events, approved events, attendance, and users) and advanced analytics (top events by attendance, date-range based attendance) with CSV/Excel export options.

## Key Features

- **Event Lifecycle Management:**  
  - Creation of events with optional image uploads.
  - Automated QR code generation for attendance tracking.
  - Approval/rejection process for pending events (PSU Admin) and publishing of approved events (Admin).
- **Role-Specific Dashboards:**  
  - **Admin Dashboard:** View events by category (All, Awaiting, Published, Drafts) and access analytics.
  - **PSU Admin Dashboard:** Review and manage pending events.
  - **Faculty Dashboard & Home:** View published events, read detailed event information, and register.
- **Analytics:**  
  - Overview statistics and advanced analytics with export functionality.
- **Real-Time Notifications:**  
  - Implemented with Socket.IO for instant updates.

## Tech Stack

- **Frontend:** React, Material UI, React Router, Socket.IO Client, Chart.js
- **Backend:** Node.js, Express, Socket.IO, Sequelize (MySQL), Helmet, Express Rate Limit
- **Database:** MySQL
- **Additional Tools:** dotenv, multer, qrcode, papaparse, xlsx, winston

## Prerequisites

- **Node.js** (v16 or above recommended)
- **npm** or **Yarn**
- **MySQL** database server
- Basic command-line knowledge

## Installation & Setup

Clone the repository and install dependencies in one go:

```bash
# Clone the repository
git clone https://github.com/your-username/psu-hub.git
cd psu-hub

# Install root dependencies (for concurrently running both projects)
npm install

# Install backend dependencies
cd psu-hub-backend
npm install

# Install frontend dependencies
cd ../psu-hub-frontend
npm install

# Return to the root directory
cd ..
```

## Database Setup

Create a MySQL database (e.g., psu_hub_db).

In the psu-hub-backend folder, create a .env file with your credentials and configuration:

NODE_ENV=development
PORT=3001

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=psu_hub_db

# JWT Secret
JWT_SECRET=some-secret-key

# CORS / Socket Origin
DEV_ORIGIN=http://localhost:3000

# Rate Limiter Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_MESSAGE=Too many requests, please try again after 15 minutes

# (Optional) 
In the psu-hub-frontend folder, create a .env file (if needed) with:
REACT_APP_API_URL=http://localhost:3001


## Scripts & Commands
Root package.json:

npm run dev – Run both backend and frontend concurrently.

npm run start:backend – Run the backend server.

npm run start:frontend – Run the frontend server.

Backend package.json:

npm start – Start the backend server.

npx sequelize-cli db:migrate – Run database migrations.

npx sequelize-cli db:seed:all – (Optional) Run seeders if provided.

## Frontend package.json:

npm start – Start the React development server.

npm run build – Create a production build of the React app.

## Usage & Workflows
Admin
Event Management: Create, edit, delete, and publish events.

Analytics: Access overall and advanced statistics with options to export data (CSV/Excel).

PSU Admin (Board Member)
Review Pending Events: Approve or reject events that are pending.

Faculty
View Events: Browse published events on the home page and dashboard.

Event Details: View extended event details. (Mark attendance via QR code scanning will be implemented later.)

Registration: Register or unregister for events.

## Additional Notes
Real-Time Notifications: Socket.IO handles real-time notifications (e.g., when new events are added).

File Uploads: Event images and other uploads are stored in the uploads/ directory (this folder is gitignored).

Rate Limiting: The backend implements rate limiting to secure the API. Adjust these settings in your .env file if needed.

QR Codes & Attendance: QR codes are generated for events to manage attendance. Future updates will allow marking attendance via scanning.

Consistent Styling: Event cards are designed to be symmetrical and spacious, with extra padding between cards across dashboards and pages.
