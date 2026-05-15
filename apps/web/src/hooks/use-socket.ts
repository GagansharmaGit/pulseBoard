import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(pollId: string, onUpdate: () => void) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!pollId) return

    // In a real production app, this URL should be read from env vars (e.g. VITE_API_URL).
    // The vite proxy won't proxy websockets correctly without ws: true configuration,
    // so connecting directly to the API port 3001 for socket.io is safer for local dev.
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    
    socketRef.current = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Socket connected')
      socket.emit('subscribe_poll', pollId)
    })

    socket.on('poll_updated', (data) => {
      if (data.pollId === pollId) {
        onUpdate()
      }
    })

    return () => {
      socket.emit('unsubscribe_poll', pollId)
      socket.disconnect()
    }
  }, [pollId, onUpdate])
}
