import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export function useSocket() {
  return useContext(SocketContext)
}

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'https://devmart-api.onrender.com'

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('register', user._id || user.id)
    })

    socket.on('orderStatusUpdate', (data) => {
      toast.success(data.message || 'Order status updated')
      setLastOrderUpdate(data)
    })

    return () => {
      socket.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ lastOrderUpdate }}>
      {children}
    </SocketContext.Provider>
  )
}