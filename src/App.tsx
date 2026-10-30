import { RouterProvider } from 'react-router'
import { router } from './routes'
import { AuthProvider } from './lib/authContext'
import { ThemeProvider } from './lib/theme'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
