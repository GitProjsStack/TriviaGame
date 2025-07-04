<p align="center">
  <img src="public/triviagame-logo.png" alt="TriviaShare Logo" width="150" />
</p>

<h1 align="center">TriviaShare</h1>

<p align="center">
  A web app for creating, sharing, and playing custom trivia games with friends.
  <br/>
  View Live Site: <a href="https://triviashare.netlify.app">https://triviashare.netlify.app</a>
</p>

---

## Key Features

- Multiplayer trivia with score tracking
- Create your own trivia sets with categories and custom points
- Share trivias with others via username
- Answer-stealing mechanic when a question is missed

## Tech Stack

- **Next.js 14 (App Router)**
- **React + TypeScript**
- **Supabase (Auth, DB, Storage)**
- **Netlify (Deployment)**

## Getting Started

To run this project locally, you will need to:

- Create a Supabase project
- Set up your database tables and columns as per the schema
- Configure authentication policies and storage buckets
- Provide the necessary environment variables (Supabase URL and anon key)

This project is primarily designed to run as a deployed web app accessible through a browser rather than a local development environment.

If you want to try it locally, clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/TriviaShare.git
cd TriviaShare
npm install
npm run dev

Remember to create a local .env.local file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key