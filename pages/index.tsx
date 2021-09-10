import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Home.module.scss'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useAuth()

  function handleSubmit(evt: FormEvent) {
    evt.preventDefault()

    const data = {
      email,
      password
    }

    signIn(data)
  }
  
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}
