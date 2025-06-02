import './globals.css'

export const metadata = {
  title: 'Samuka - Seguimiento Deportistas',
  description: 'App de seguimiento emocional para deportistas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
