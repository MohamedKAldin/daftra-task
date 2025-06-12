import Navbar from './Navbar'

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="flex-grow-1">
        {children}
      </main>
    </div>
  )
}

export default Layout 