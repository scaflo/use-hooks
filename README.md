# @scaflo/use-hooks

A comprehensive collection of React hooks for modern web applications. Enhance your React projects with 16 carefully crafted hooks covering animation, storage, device APIs, performance optimization, and user interactions.

## 🚀 Installation

\\\bash
npm install @scaflo/use-hooks
\\\

## 📚 Hooks Overview

### Animation

- **useAnimationFrame** - Manage requestAnimationFrame loops with start/stop controls

### Device APIs

- **useBattery** - Access device battery status and charging information
- **useGeolocation** - Get device location with position watching
- **useLocationData** - Enhanced geolocation with reverse geocoding support

### Storage

- **useCookie** - Manage cookies with automatic serialization
- **useLocalStorage** - Sync state with localStorage including cross-tab sync
- **useSessionStorage** - Sync state with sessionStorage for temporary data

### Performance

- **useDebounce** - Debounce rapidly changing values with configurable delay
- **useThrottle** - Throttle values to limit update frequency
- **useRetryable** - Add retry logic to async operations

### User Interaction

- **useIdle** - Detect when user becomes idle based on activity events
- **useKeyboard** - Handle keyboard shortcuts and key events
- **useScrollPosition** - Track scroll position for window or elements

### Communication & Events

- **useBroadcastChannel** - Enable cross-tab communication
- **useEventListener** - Attach event listeners with automatic cleanup

### Network

- **useOnlineStatus** - Track network connectivity status in real-time

## 🔧 Usage Examples

### useAnimationFrame

\\\tsx
import { useAnimationFrame } from '@scaflo/use-hooks'

function AnimationDemo() {
  const { start, stop, isRunning } = useAnimationFrame((time) => {
    // Your animation logic here
    console.log('Frame:', time)
  }, { autoStart: false })

  return (
    <div>
      <button onClick={start} disabled={isRunning()}>Start</button>
      <button onClick={stop} disabled={!isRunning()}>Stop</button>
      <p>Animation {isRunning() ? 'running' : 'stopped'}</p>
    </div>
  )
}
\\\

### useLocalStorage

\\\tsx
import { useLocalStorage } from '@scaflo/use-hooks'

function Counter() {
  const [count, setCount, removeCount] = useLocalStorage('count', 0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={removeCount}>Reset</button>
    </div>
  )
}
\\\

### useDebounce

\\\tsx
import { useDebounce } from '@scaflo/use-hooks'
import { useState } from 'react'

function SearchInput() {
  const [input, setInput] = useState('')
  const { value: debouncedValue, cancel } = useDebounce(input, 500)

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type to search..."
      />
      <p>Debounced: {debouncedValue}</p>
      <button onClick={cancel}>Cancel</button>
    </div>
  )
}
\\\

### useBattery

\\\tsx
import { useBattery } from '@scaflo/use-hooks'

function BatteryStatus() {
  const { supported, battery } = useBattery()

  if (!supported) return <p>Battery API not supported</p>

  return (
    <div>
      <p>Level: {(battery?.level * 100).toFixed(0)}%</p>
      <p>Charging: {battery?.charging ? 'Yes' : 'No'}</p>
      <p>Time remaining: {battery?.dischargingTime}min</p>
    </div>
  )
}
\\\

### useKeyboard

\\\tsx
import { useKeyboard } from '@scaflo/use-hooks'
import { useState } from 'react'

function KeyboardDemo() {
  const [pressed, setPressed] = useState('')

  useKeyboard(['Enter', 'Escape', 'Space'], (event) => {
    setPressed(event.key)
    setTimeout(() => setPressed(''), 1000)
  })

  return (
    <div>
      <p>Press Enter, Escape, or Space</p>
      {pressed && <p>You pressed: {pressed}</p>}
    </div>
  )
}
\\\

### useOnlineStatus

\\\tsx
import { useOnlineStatus } from '@scaflo/use-hooks'

function NetworkStatus() {
  const isOnline = useOnlineStatus()

  return (
    <div className={status ${isOnline ? 'online' : 'offline'}}>
      Status: {isOnline ? 'Online' : 'Offline'}
    </div>
  )
}
\\\

### useGeolocation

\\\tsx
import { useGeolocation } from '@scaflo/use-hooks'

function LocationDemo() {
  const { coords, error, getCurrentPosition, startWatch, stopWatch } = useGeolocation()

  return (
    <div>
      {coords && (
        <p>Lat: {coords.latitude}, Lng: {coords.longitude}</p>
      )}
      {error && <p>Error: {error.message}</p>}
      <button onClick={getCurrentPosition}>Get Location</button>
      <button onClick={startWatch}>Start Watching</button>
      <button onClick={stopWatch}>Stop Watching</button>
    </div>
  )
}
\\\

### useBroadcastChannel

\\\tsx
import { useBroadcastChannel } from '@scaflo/use-hooks'

function CrossTabDemo() {
  const { post } = useBroadcastChannel('my-channel', {
    onMessage: (data) => {
      console.log('Received:', data)
    }
  })

  return (
    <button onClick={() => post({ type: 'hello', timestamp: Date.now() })}>
      Send Message to Other Tabs
    </button>
  )
}
\\\

### useRetryable

\\\tsx
import { useRetryable } from '@scaflo/use-hooks'

function RetryDemo() {
  const { run, attempts, error } = useRetryable(
    async () => {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed')
      return response.json()
    },
    { retries: 3, delay: 1000 }
  )

  return (
    <div>
      <button onClick={run}>Fetch Data</button>
      <p>Attempts: {attempts}</p>
      {error && <p>Error: {error.message}</p>}
    </div>
  )
}
\\\

## 🎯 Hook Categories

- **Animation**: useAnimationFrame
- **Device**: useBattery, useGeolocation, useLocationData
- **Storage**: useCookie, useLocalStorage, useSessionStorage
- **Performance**: useDebounce, useThrottle, useRetryable
- **User Interaction**: useIdle, useKeyboard, useScrollPosition
- **Communication**: useBroadcastChannel, useEventListener
- **Network**: useOnlineStatus

## 🔗 Links

- [GitHub Repository](https://github.com/scaflo/use-hooks)
- [NPM Package](https://www.npmjs.com/package/@scaflo/use-hooks)

## 📄 License

MIT License - see the [LICENSE](https://github.com/scaflo/use-hooks/blob/main/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for the React community
