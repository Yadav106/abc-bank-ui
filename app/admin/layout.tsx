import React from 'react'
import Sidebar from '../components/sidebar/Sidebar'

const layout = ({
    children
}: {
    children: React.ReactNode
}) => {
  return (
    <>
      <Sidebar>
        <div>
          {children}
        </div>
      </Sidebar>
    </>
  )
}

export default layout
