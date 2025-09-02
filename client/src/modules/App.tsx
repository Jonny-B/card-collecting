import React from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'

export default function App() {
  return (
    <div className="container py-3">
      <header className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <h1 className="h4 m-0">Football Card Binder</h1>
        <nav className="nav gap-3">
          <NavLink to="/" className={({isActive}) => 'nav-link' + (isActive ? ' fw-bold' : '')}>Dashboard</NavLink>
          <NavLink to="/rookies" className={({isActive}) => 'nav-link' + (isActive ? ' fw-bold' : '')}>Players</NavLink>
          <NavLink to="/browns" className={({isActive}) => 'nav-link' + (isActive ? ' fw-bold' : '')}>Browns</NavLink>
          <NavLink to="/binder" className={({isActive}) => 'nav-link' + (isActive ? ' fw-bold' : '')}>Binder</NavLink>
          <NavLink to="/settings" className={({isActive}) => 'nav-link' + (isActive ? ' fw-bold' : '')}>Settings</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
