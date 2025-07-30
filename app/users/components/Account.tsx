import React from 'react'

interface Account {
    accountHolderName: string;
    accountId: number;
    accountNumber: string;
    accountType: string;
    address: string;
    balance: number;
    overdraftLimit: number;
    status: string;
    user: {
        userId: number;
        username: string;
        role: string;
    };
    active: boolean;
    branch: {
        branchId: number;
        ifscCode: string;
        address: string;
    };
    createdAt: string;
    email: string;
    joinDate: string;
    manager?: any; // can be null
    name: string;
    pan: string;
    password?: any; // can be null
    phone: string;
}

const Account = ({ account }: { account: Account }) => {
  return (
    <div className='flex flex-col gap-4 p-4 rounded-lg border shadow-sm w-[30%] cursor-pointer hover:shadow-lg hover:scale-105 transition'>
        <div className='flex justify-between items-center'>
            <p>Account No: <b>{account.accountNumber}</b></p>
            {
                !account.active && (
                    <p className='text-red-500'>Inactive</p>
                )
            }
        </div>

        <div className='flex justify-between items-center'>
            <p>Account Type: {account.accountType}</p>
            <p>{account.balance} INR</p>
        </div>
    </div>
  )
}

export default Account
