# Epic Video Player

A TikTok-style video player application built with React and Material-UI, featuring seamless video playback and a modern user interface.

## Features

- TikTok-style vertical scrolling video feed
- Responsive design optimized for mobile devices
- Material UI components for a modern look and feel
- Integration with Supabase for video storage and retrieval
- Bottom navigation for easy access to different sections
- GitHub Pages deployment ready

## Tech Stack

- React
- Material-UI
- Vite
- Supabase
- React Router

## Development

To run this project locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is configured for GitHub Pages deployment using GitHub Actions. The deployment workflow will automatically build and deploy the application when changes are pushed to the main branch.

## License

MIT
