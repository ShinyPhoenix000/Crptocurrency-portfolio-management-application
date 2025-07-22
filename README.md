#FinTrack – Crypto Portfolio Tracker

FinTrack is a modern cryptocurrency tracking and portfolio management application built with React, TypeScript, Tailwind CSS, and Vite. It provides real-time price tracking, personal wallet insights, P&L calculations, and interactive charts to help users stay informed on market trends.

⸻

Features
	•	Real-time crypto price tracking using CoinGecko API
	•	Add and manage personal wallets
	•	Portfolio summary with profit/loss calculation
	•	Interactive price charts and historical data
	•	Dark mode with persistent theme storage
	•	Responsive UI for mobile and desktop

⸻

Tech Stack
	•	Frontend: React, TypeScript, Vite
	•	Styling: Tailwind CSS, shadcn-ui
	•	Charting: Recharts or Chart.js
	•	API: CoinGecko Public API
	•	Storage: localStorage (for persistent user data)

⸻

Project Structure

fintrack/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-based views
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Root app component
│   └── main.tsx            # Entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts


⸻

Getting Started

Prerequisites
	•	Node.js (v18 or later)
	•	npm or yarn

Setup Instructions
	1.	Clone the repository

git clone https://github.com/ShinyPhoenix000/FinTrack.git
cd FinTrack

	2.	Install dependencies

npm install
# or
yarn install

	3.	Run the development server

npm run dev
# or
yarn dev

	4.	Open in browser

Navigate to http://localhost:5173 to view the app.

⸻

Build for Production

npm run build
npm run preview


⸻

Deployment Options

You can deploy the build output (/dist) to platforms like:
	•	Vercel
	•	Netlify
	•	Firebase Hosting
	•	GitHub Pages

Ensure you configure environment variables if you use paid APIs or services.

⸻

Notes
	•	This project does not use any backend—data is fetched from the CoinGecko API and stored locally.
	•	API rate limits may apply based on CoinGecko usage.

⸻

License

This project is licensed under the MIT License.
See the LICENSE file for details.
⸻
