# 🛠️ Installing the YouTube Repurpose Web App

## 👋 Introduction

This guide will help you set up the YouTube Repurpose Web App without requiring coding knowledge. We'll cover two approaches:
- Quick cloud deployment (recommended for beginners)
- Local installation (for those who want to run it on their computer)

## ☁️ Option 1: Quick Cloud Deployment (Recommended)

### Step 1: Fork the GitHub Repository

1. 🔗 Go to [https://github.com/Elvito-AI-Tools/youtube-repurpose-web](https://github.com/Elvito-AI-Tools/youtube-repurpose-web)
2. 👆 Click the "**Fork**" button in the top-right corner
3. ✅ Keep all default settings and click "**Create Fork**"

### Step 2: Deploy with Vercel (Free Tier)

1. 📝 Create a free [Vercel account](https://vercel.com/signup) using your GitHub account
2. 🚀 After signing up, click "**+ New Project**"
3. 🔍 Find and select your forked repository
4. 👆 Click "**Import**"
5. ✅ Keep all default settings and click "**Deploy**"
6. ⏱️ Wait for deployment to complete (about 1-2 minutes)
7. 🎉 When finished, Vercel will provide you with a URL to your app (e.g., `your-app-name.vercel.app`)

### Step 3: Configure Your Webhook

1. 🌐 Visit your newly deployed app
2. ⚙️ Click the "**Settings**" button
3. 📋 Enter your n8n webhook URL from Workflow 2
4. 💾 Click "**Save Settings**"

## 💻 Option 2: Local Installation

If you prefer running the app on your own computer:

### Step 1: Install Required Software

1. 📥 Download and install [Node.js](https://nodejs.org/) (LTS version)
2. 📥 Download and install [Git](https://git-scm.com/downloads)

### Step 2: Download the Application

1. 📂 Create a folder on your computer where you want to store the app
2. 🖱️ Right-click in the folder and select "**Git Bash Here**" (Windows) or open Terminal (Mac)
3. ✏️ Type this command and press Enter:
   ```
   git clone https://github.com/Elvito-AI-Tools/youtube-repurpose-web.git
   ```
4. ✏️ Navigate into the project folder:
   ```
   cd youtube-repurpose-web
   ```

### Step 3: Install Dependencies and Start the App

1. ✏️ Install the required packages:
   ```
   npm install
   ```
2. ✏️ Start the application:
   ```
   npm run dev
   ```
3. 🌐 Open your web browser and go to:
   ```
   http://localhost:3000
   ```
4. ⚙️ Configure your webhook URL in the Settings page

## 🤔 Need Help?

If you encounter any issues during installation:

- 📧 Contact our support team at support@example.com
- 🔍 Check our [Troubleshooting Guide](https://example.com/troubleshooting)
- 💬 Join our [Community Discord](https://discord.gg/example) for live assistance

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
