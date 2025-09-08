import * as React from "react"

interface ChatTimerProps {
  platform: string
  lastMessageTimestamp?: string | number
  onSessionExpired: () => void
  onSessionActive: () => void
}

export const ChatTimer: React.FC<ChatTimerProps> = ({ 
  platform, 
  lastMessageTimestamp, 
  onSessionExpired, 
  onSessionActive 
}) => {
  const [timer, setTimer] = React.useState({ hours: "00", minutes: "00", seconds: "00" })
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const getPlatformWindowMs = React.useCallback((platform: string): number => {
    const p = (platform || "").toLowerCase()
    if (p.includes("whatsapp")) return 24 * 60 * 60 * 1000 
    if (p.includes("instagram") || p.includes("messenger") || p === "facebook") return 7 * 24 * 60 * 60 * 1000 // 7 days
    return 7 * 24 * 60 * 60 * 1000 
  }, [])

  const calculateEndTime = React.useCallback((initialTime: number): number => {
    return initialTime + getPlatformWindowMs(platform)
  }, [platform, getPlatformWindowMs])

  const destroyExistingInterval = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const updateCountDown = React.useCallback((remainingTime: number) => {
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000)

    const newTimer = {
      hours: hours < 10 ? "0" + hours : hours.toString(),
      minutes: minutes < 10 ? "0" + minutes : minutes.toString(),
      seconds: seconds < 10 ? "0" + seconds : seconds.toString(),
    }
    
    console.log('ChatTimer: Updating countdown:', newTimer, 'from remaining time:', remainingTime)
    setTimer(newTimer)
  }, [])

  const updateTimer = React.useCallback((endTime: number) => {
    const now = Date.now()
    const remainingTime = endTime - now
    
    console.log('ChatTimer: Update timer - now:', now, 'endTime:', endTime, 'remaining:', remainingTime)

    if (remainingTime <= 0) {
      console.log('ChatTimer: Session expired')
      onSessionExpired()
      destroyExistingInterval()
      updateCountDown(0)
    } else {
      updateCountDown(remainingTime)
      onSessionActive()
    }
  }, [onSessionExpired, onSessionActive, destroyExistingInterval, updateCountDown])

  const startTimer = React.useCallback((initialTime: number) => {
    console.log('ChatTimer: Starting timer with initial time:', initialTime)
    destroyExistingInterval()
    const endTime = calculateEndTime(initialTime)
    console.log('ChatTimer: Setting interval for end time:', endTime)
    intervalRef.current = setInterval(() => updateTimer(endTime), 1000)
    updateTimer(endTime)
  }, [calculateEndTime, destroyExistingInterval, updateTimer])

  React.useEffect(() => {
    console.log('ChatTimer: Platform:', platform, 'Timestamp:', lastMessageTimestamp)
    
    if (platform && lastMessageTimestamp) {
      let initialTime: number
      
      if (typeof lastMessageTimestamp === 'number') {
        initialTime = lastMessageTimestamp > 1e12 ? lastMessageTimestamp : lastMessageTimestamp * 1000
      } else if (typeof lastMessageTimestamp === 'string') {
        initialTime = new Date(lastMessageTimestamp).getTime()
      } else {
        console.log('ChatTimer: Invalid timestamp format')
        return
      }
      
      console.log('ChatTimer: Initial time:', initialTime, 'End time:', calculateEndTime(initialTime))
      
      if (!isNaN(initialTime) && initialTime > 0) {
        startTimer(initialTime)
      } else {
        console.log('ChatTimer: Invalid initial time')
      }
    } else {
      console.log('ChatTimer: Missing platform or timestamp')
    }
    
    return destroyExistingInterval
  }, [platform, lastMessageTimestamp, startTimer, destroyExistingInterval, calculateEndTime])

  React.useEffect(() => {
    if (platform && !lastMessageTimestamp) {
      console.log('ChatTimer: No timestamp provided, starting with current time')
      const currentTime = Date.now()
      startTimer(currentTime)
    }
  }, [platform, lastMessageTimestamp, startTimer])

  return (
    <span className="font-mono text-sm">
      {`${timer.hours}:${timer.minutes}:${timer.seconds}`}
    </span>
  )
}
