import { useEffect } from 'react'
import './App.css'
import { useUser } from './hooks/user'
import { useAccessToken } from './hooks/accessToken'
import axiosInstance, { setHeader, websocketURL } from './utils/network'
import { User } from './store/user'
import { AccessToken } from './store/accesstoken'
import { useSocket } from './hooks/socket'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './pages/lobby'
import { useGame } from './hooks/game'
import GamePage from './pages/GamePage'
import Home from './pages/Home'
import BoardPage from './pages/BoardPage'


function App() {
  const [accessToken, setAccessToken] = useAccessToken()
  const [user, setUser] = useUser()
  const [socketState, setSocketState] = useSocket()
  const [gameState, setGameState] = useGame()

  async function fetchCurrentUserDetails() {
    console.log('fetchCurrentUserDetails function called')
    try {
      const res = await axiosInstance.get<{ user: User }>(`/v1/user/${user.userId}`)
      const { email, name, picture, userId } = res.data.user
      setUser({ ...user, email, name, picture, userId, loggedIn: true })

    } catch (er) {
      console.log("failed to get user", er)
    }

  }

  async function fetchOpponentDetails() {
    console.log('fetching Opponent ')
    try {
      const res = await axiosInstance.get<{ user: User }>(`/v1/user/${gameState.opponentUserId}`)
      const { name, picture } = res.data.user
      setGameState({ ...gameState, opponentName: name, opponentPicture: picture })

    } catch (er) {
      console.log("failed to get user", er)
    }
  }

  async function updateAccessToken() {
    console.log("updateAccesstoken function called")
    try {
      const res = await axiosInstance.get<{ accessToken: AccessToken, expiresIn: number, userId: string }>(`/v1/access-token`)
      const data = res.data
      setAccessToken(data.accessToken)
      setUser({ ...user, userId: data.userId })

      if (user.loggedIn) {
        setTimeout(() => {
          updateAccessToken()
        }, (data.expiresIn - 6) * 1000)
      }

      data.expiresIn

    } catch (er) {
      console.log("Failed to get Access Token", er)
    }
  }


  useEffect(() => {
    setHeader(accessToken)
  }, [accessToken])


  useEffect(() => {
    if (accessToken && !socketState.isConnected) {
      if (socketState.socket) return
      console.log("sending socket request")

      const socket = new WebSocket(websocketURL + `?token=${accessToken}`);
      setSocketState({ ...socketState, socket })

    }

  }, [accessToken])

  useEffect(() => {

    if (gameState.opponentUserId && !(gameState.opponentName, gameState.opponentPicture)) {
      fetchOpponentDetails()
    }
  }, [gameState.opponentUserId])


  useEffect(() => {
    if (socketState.socket) {
      socketState.socket.onopen = () => {
        console.log("connected to socket")
        setSocketState({ ...socketState, isConnected: true })
      }

      socketState.socket.onclose = () => {
        console.log("disconnected from socket")
        setSocketState({ ...socketState, isConnected: false })
      }
    }
  }, [socketState.socket])

  useEffect(() => {

    if (accessToken && user.userId && !(user.name, user.email)) {
      fetchCurrentUserDetails()
    }

  }, [user.userId])

  useEffect(() => {
    updateAccessToken()
  }, [user.loggedIn])


  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
          </Routes>
        </Router>


      </div>
    </>
  )
}

export default App
