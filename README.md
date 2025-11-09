# DataPulse — Real-Time Bitcoin Analytics Dashboard

**DataPulse** is an interactive, real-time analytics dashboard that tracks and visualizes Bitcoin price data using the **Coingecko API**.  
The application is built with **Next.js** and **TypeScript**, rendering live price changes through a high-performance **Canvas** visualization that remains smooth even with large data sets.

---

## Features

- **Live Bitcoin Data:** Updates every few seconds using Coingecko’s public API.  
- **Efficient Canvas Rendering:** Handles thousands of data points at 60 FPS.  
- **Light and Dark Themes:** Switch between themes with dynamic background brightness.  
- **Zoom, Pan, and Replay:** Navigate and replay recent market movements.  
- **Metric Display:** Shows current, average, minimum, and maximum price values.  
- **Pause and Resume Controls:** Manage the live data feed.  
- **Image Export:** Capture and download chart snapshots as PNG files.  
- **Performance Tracking:** Displays frame rate and memory statistics during runtime.  
- **Deployment Ready:** Optimized for hosting on platforms such as Vercel.

---

## Preview
Link : http://localhost:3000/dashboard
Live Deployment: [https://datapulse.vercel.app](https://datapulse.vercel.app)

---

## Technology Stack

- **Framework:** Next.js 14 (TypeScript)  
- **Visualization:** HTML Canvas  
- **Styling:** Custom CSS with variables for theming  
- **API Source:** Coingecko  
- **Hosting:** Vercel  

---

## How It Works

1. The dashboard periodically fetches Bitcoin price data from the Coingecko API.  
2. Each new data point is plotted dynamically on the canvas in real time.  
3. Users can zoom, pan, or replay past data without performance drops.  
4. The system continuously monitors frame rate and memory to ensure smooth operation.  
5. The theme toggle and export options enhance usability and presentation.

---

## Installation and Setup

Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/DataPulse.git
cd DataPulse
npm install
npm run dev

