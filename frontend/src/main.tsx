import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { UserProfileProvider } from './contexts/UserProfileProvider'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, retry: 1 } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProfileProvider>
    </QueryClientProvider>
  </StrictMode>,
)
