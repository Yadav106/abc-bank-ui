'use client'

import React from 'react'
import { signOut, useSession } from 'next-auth/react'

const page = () => {
  const { data: session, status } = useSession()

  const handleLogout = () => {
    signOut({
      callbackUrl: '/' // Redirect to home page after logout
    })
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      {session && (
        <div>
          <p>Welcome, {session.user?.name || session.user?.email}</p>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default page