import { useState } from 'react'
import './App.css'
import JoinCreateChat from './components/JoinCreateChat'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <JoinCreateChat />
    </>
  )
}

export default App
