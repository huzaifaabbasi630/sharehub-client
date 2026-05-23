import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { SocketProvider } from './context/SocketContext.jsx';
import { RoomProvider } from './context/RoomContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <RoomProvider>
          <App />
        </RoomProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
