import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
// import { SocketProvider } from './context/SocketContext.jsx'; // WebSocket disabled
import { PusherProvider } from './context/PusherContext.jsx'; // Using Pusher instead
import { RoomProvider } from './context/RoomContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PusherProvider>
        <RoomProvider>
          <App />
        </RoomProvider>
      </PusherProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
