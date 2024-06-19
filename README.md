# Project Title

CollabDev: Collaborative Developer Projects Platform (Backend)

## Table of Contents

1. [Project Features](#project-features)
2. [Overview](#overview)
3. [Problem](#problem)
4. [Features](#features)
5. [Nice-to-Haves](#nice-to-haves)
6. [Tech Stack](#tech-stack)
7. [Installation](#installation)

## Overview

CollabDev is a platform designed to facilitate collaboration among developers on real-world projects. It serves as a meeting point where developers can bring their projects and seek collaborators or explore projects based on their interests and skills. The platform includes essential features like user profile management, project browsing, and real-time chat functionality to support effective collaboration. Future enhancements, such as AI-driven matchmaking, are planned to further personalize and streamline the collaboration process, providing both experienced developers and newcomers with meaningful opportunities for growth and development. The backend of CollabDev provides the server-side functionality, including API endpoints, database management, and real-time communication handling.

## Problem

The developer community often faces challenges in finding suitable projects to work on or collaborators with compatible skill sets and interests. Traditional coding practice platforms may not fully address the need for meaningful collaboration and practical project experience. CollabDev aims to bridge this gap by providing a comprehensive solution tailored specifically for collaborative project development.

## Features

- Account Management:
  - Integrate authentication using JWT, authorization, and security mechanisms like encryption.
- Project Browsing / Interaction:
  - Implement a feature-rich REST API to handle project browsing, sorting, filtering, and pagination.
  - View detailed project information, including description, goals, tech stack, and collaborators.
  - Employ a multi-step form for streamlined creation of new projects.
  - Like projects to show interest and support.
- Collaboration Requests:
  - Implement endpoints for creating, accepting, rejecting, and deleting collaboration / invitation requests, including personalized messages and user authentication.
  - Manage requests with MongoDB, updating related project and user data, and initializing chat upon acceptance.
- Real-time Communication:
  - Establish a Socket.io server with user registration, room management, and real-time messaging capabilities.
  - Implement message persistence, status updates, and deletion using MongoDB and Mongoose.

## Nice-to-haves

-	Passwordless authentication using Okta 
-	User search feature 
-	Firebase integration for saving files and images.
-	Enhanced chat functionality with search, reply, and presence status 
-	Using OpenAI's API for matchmaking based on user and project information.
-	Gamification elements and a points system based on user performance

 ## Tech Stack
 
-	Backend: Express
-	Database: MongoDB with Mongoose
-	Language: TypeScript
-	Linting: ESLint
-	Real-time Communication: Socket.io

## Installation

To run CollabDev locally, follow these steps:
1.  Clone the repository:

```bash
git clone https://github.com/narcissus123/collabDev-backend.git
```

2. Install dependencies:

```bash
npm install
```
   
3. Set up environment variables:  

  -	Create a `.env` file in the root directory and add the necessary environment variables (e.g., MongoDB URI, JWT secret). Please refer to `.env-sample` for an example setup.

4. Run the project:
   
```bash
npm run dev
```

## Links:

- GitHub repository - Backend: [https://github.com/narcissus123/collabDev-backend](https://github.com/narcissus123/collabDev-backend)
- GitHub repository - Frontend: [https://github.com/narcissus123/collabDev-frontend](https://github.com/narcissus123/collabDev-frontend)


