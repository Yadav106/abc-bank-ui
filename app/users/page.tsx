'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { FieldValues, useForm } from 'react-hook-form'
import Input from '../components/inputs/Input'
import axios from 'axios'
import Select from '../components/inputs/Select'
import Account from './components/Account'

const page = () => {
  interface Branch {
    branchId: number;
    address: string;
    [key: string]: any; // Add this if there are more properties you expect from the API
  }

  const { data: session, status } = useSession()

  const [addAccountOpen, setAddAccountOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  interface AccountType {
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

  const [accounts, setAccounts] = React.useState<AccountType[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [accountType, setAccountType] = React.useState('');

  useEffect(() => {
    async function getAllAccounts() {
      try {
        const res = await axios.get("http://localhost:8080/accounts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        const currentUserAccounts = res.data.filter((account: any) => account.user.username === localStorage.getItem('username'));

        setAccounts(currentUserAccounts);

        console.log('Accounts:', currentUserAccounts);
      } catch (error) {
        console.log('Error fetching accounts:', error);
      }

    }

    getAllAccounts();
  }, [])

  useEffect(() => {
    if (addAccountOpen) {

    }
  }, [addAccountOpen])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      accountNumber: '',
      accountType: '',
      balance: 0,
      overdraftLimit: 0,
      status: 'UNVERIFIED',
      accountHolderName: '',
      mobile: '',
      email: '',
      address: '',
      pan: '',
    }
  })

  // Fetch default values from API and set them in the form
  useEffect(() => {
    async function fetchDefaultValues() {
      const username = localStorage.getItem('username');
      try {
        const response = await axios.get(`http://localhost:8080/users/username/${username}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        console.log('Response Data:', response.data);
        const formData = {
          accountHolderName: response.data.name,
          mobile: response.data.phone,
          email: response.data.email,
          address: response.data.address,
          pan: response.data.pan,
          accountNumber: '',
          accountType: '',
          balance: 0,
          overdraftLimit: 0,
          status: 'UNVERIFIED',
          branch: {
            branchId: 1
          },
          user: {
            userId: response.data.userId
          }
        }

        reset(formData);
      } catch (error) {
        console.log('Error fetching default values:', error);
      }
    }

    async function fetchBranches() {
      try {
        const response = await axios.get("http://localhost:8080/branches", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setBranches(response.data);
        console.log('Branches:', response.data);
      } catch (error) {
        console.log('Error fetching branches:', error);
      }
    }

    if (addAccountOpen) {
      fetchDefaultValues();
      fetchBranches();
    }
  }, [addAccountOpen, reset]);

  const onSubmit = async (data: FieldValues) => {
    data.status = 'UNVERIFIED';
    data.balance = 0;
    data.overdraftLimit = 0;
    data.accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    data.accountType = accountType;

    console.log('Form Data:', data);

    setIsLoading(true);

    const res = await axios.post("http://localhost:8080/accounts/create", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    console.log('Response:', res.data);

    setIsLoading(false);
    setAddAccountOpen(false);
    window.location.reload();
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className='h-[100%]'>
      {session && (
        <div className='h-[100%]'>
          <div className='flex justify-between mb-4 border-b border-gray-200 pb-4'>
            <p className='text-3xl font-semibold'>Welcome, {localStorage.getItem('username')}</p>
            <Button
              onClick={() => {
                setAddAccountOpen(true);
              }}
            >
              Open New Account
            </Button>
          </div>

          {
            accounts.length > 0 ? (
              <div className="flex items-center flex-wrap gap-4">
                {accounts.map((account) => (
                  <Account key={account.accountId} account={account} />
                ))}
              </div>
            ) : (
              <p className='flex justify-center items-center h-[70vh] text-gray-500'>
                No accounts found.
              </p>
            )
          }

          <Modal
            isOpen={addAccountOpen}
            onClose={() => setAddAccountOpen(false)}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Open New Account</h2>
              {/* Form fields for opening a new account */}
              <form
                className="space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Input
                  id="user.userId"
                  label="User ID"
                  register={register}
                  errors={errors}
                  disabled={true}
                />
                <Input
                  id="accountHolderName"
                  label="Name"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                />

                <Input
                  id="mobile"
                  label="Mobile"
                  type="tel"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                />

                <Input
                  id="address"
                  label="Address"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                />

                <Input
                  id="pan"
                  label="PAN"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                />

                <Select
                  label="Account Type"
                  value={undefined}
                  onChange={(value) => {
                    setAccountType(value.value);
                  }}
                  options={[
                    { value: 'SAVINGS', label: 'Savings' },
                    { value: 'CURRENT', label: 'Current' },
                  ]}
                  disabled={isLoading}
                />

                <Select
                  label="Branch"
                  value={undefined}
                  onChange={(value) => {
                    reset({ branch: { branchId: value.value } });
                  }}
                  options={branches.map(branch => ({
                    value: branch.branchId,
                    label: branch.address
                  }))}
                  disabled={isLoading}
                />

                <div>
                  <Button
                    disabled={isLoading}
                    fullWidth
                    type="submit"
                  >
                    Add Account
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}

export default page