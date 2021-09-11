import { Api } from "../services/api"
import { withSSRAuth } from "../utils/withSRRAuth"

export default function Dashboard() {
  return <h1>Metrics</h1>
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = new Api(ctx).axios
  const response = await api.get('me')  

  return { 
    props: {} 
  }
}, {
  roles: ['administrator']
})