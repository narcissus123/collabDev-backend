# CollabDev 🤝

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-green.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0.0-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-black.svg)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black.svg)](https://vercel.com/)
[![Heroku](https://img.shields.io/badge/Heroku-Deployment-purple.svg)](https://heroku.com/)

CollabDev is an innovative platform that transforms how developers connect and collaborate on projects. We bring together project discovery, meaningful connections, and seamless communication in one cohesive space. Whether you're passionate about coding and want to join exciting projects, or you're looking for talented developers to bring your ideas to life, CollabDev makes the journey from idea to collaboration simple and effective.

## 🌟 Why CollabDev?

Finding the right project or collaborator can be challenging in the vast developer landscape. CollabDev solves this by providing:

- **Meaningful Connections**: Connect with developers who share your interests and complement your skills
- **Streamlined Collaboration**: Move from discovery to partnership through clear, built-in processes
- **Integrated Tools**: Access all essential collaboration features in one cohesive environment
- **Growth Opportunities**: Perfect for both experienced developers and newcomers looking to gain hands-on experience and enjoy collaborative development

## 🚀 Key Features

### Project Discovery & Management
- Advanced filtering capabilities
- Detailed project profiles with tech stack, goals, requirements, ...
- Project browsing with sorting and pagination
- Like projects to show interest and support
- Interactive Home Page (Coming Soon)
- Project settings page for managing collaborators, project ownership, and project lifecycle  (coming soon)
- Progress tracking dashboard (Coming)

### Collaboration Tools
- Real-time chat functionality
- Structured collaboration requests system
- Personalized invitation messages
- Enhanced chat features - search, reply, presence status (Coming)
- Team coordination tools (Coming)

### Professional Profiles
- Skill showcase
- Project portfolio
- Customizable user profiles
- Profile image storage using AWS S3
- User search functionality (Coming Soon)
- AI-powered skill matching (Coming)

### Security & Authentication
- JWT-based authentication
- Role-based access control
- Secure data handling
- Passwordless authentication using Okta (Coming Soon)


_This is just the beginning - many more features are in our development pipeline!_



## 🛠 Technology Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT
- **Cloud Storage**: AWS S3
- **API Documentation**: Swagger/OpenAPI

### Development Tools
- **Language**: TypeScript
- **Code Quality**: ESLint
- **Development Server**: Nodemon

### Deployment
- **Backend**: Heroku
- **Frontend**: Vercel

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm/yarn
- AWS Account (for S3 storage)

### Backend Installation

1. Clone the repository
```bash
git clone https://github.com/narcissus123/collabDev-backend.git
cd collabDev-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start development server
```bash
npm run dev
```

### Frontend Installation

1. Clone the repository
```bash
git clone https://github.com/narcissus123/collabDev-frontend.git
cd collabDev-frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start React
```bash
npm start
```

## 🔗 Links

- [Frontend Repository](https://github.com/narcissus123/collabDev-frontend)
- [Backend Repository](https://github.com/narcissus123/collabDev-backend)

---

<p align="center">
  <sub>Built with ❤️ by developers, for developers</sub>
</p>
