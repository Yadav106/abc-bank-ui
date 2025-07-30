'use client'

import React from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal';

const page = () => {
  const [addBranchOpen, setAddBranchOpen] = React.useState(false);

  return (
    <div>
      <div className='flex justify-between mb-4 border-b border-gray-200 pb-4'>
            <p className='text-3xl font-semibold'>Welcome, admin</p>
            <Button
              onClick={() => {
                setAddBranchOpen(true);
              }}
            >
              Add New Branch
            </Button>
          </div>

          <Modal isOpen={addBranchOpen} onClose={() => setAddBranchOpen(false)}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Branch</h2>
              {/* Form fields for adding a new branch */}
            </div>
          </Modal>
    </div>
  )
}

export default page
