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
        <div className="p-4">
          {children}
        </div>
      </Sidebar>
      <div className='mt-8 text-center text-gray-500 text-sm mb-4 fixed bottom-0 left-0 right-0 border-t border-gray-200 mt-4 pt-4'>
        ABC Bank © {new Date().getFullYear()} - All rights reserved.
      </div>
    </>
  )
}

export default layout
