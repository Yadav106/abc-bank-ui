import React from 'react'
import Sidebar from '../components/sidebar/Sidebar'

const layout = ({
    children
}: {
    children: React.ReactNode
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar>
        <div className="flex-1">
          {children}
        </div>
      </Sidebar>
    </div>
  )
}

export default layout
