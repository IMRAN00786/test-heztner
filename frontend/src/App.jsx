import { useState, useEffect } from 'react'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        setHealth({ status: 'error', message: err.message })
        setLoading(false)
      })
  }, [])

  return (
    <div className="container">
      <h1>React + Node.js App</h1>
      <div className="card">
        <h2>Backend Health Status</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}

export default App
