import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api, { Api } from "../services/api"
import styles from '../styles/Home.module.scss'
import { withSSRAuth } from "../utils/withSRRAuth"

export default function Dashboard() {
  const { user } = useAuth()
  
  useEffect(() => {
    api.get('me')
      .then(response => console.log(response))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <strong>{user?.email}</strong>
    </div>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = new Api(ctx).axios
  const response = await api.get('me')
  
  console.log(response.data)

  return { 
    props: {} 
  }
})