// 'use client'

// import React, { useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import Button from '../components/Button'
// import Modal from '../components/Modal'
// import { FieldValues, useForm } from 'react-hook-form'
// import Input from '../components/inputs/Input'
// import axios from 'axios'
// import Select from '../components/inputs/Select'
// import Account from './components/Account'

// const page = () => {
//   interface Branch {
//     branchId: number;
//     address: string;
//     [key: string]: any; // Add this if there are more properties you expect from the API
//   }

//   const { data: session, status } = useSession()

//   const [addAccountOpen, setAddAccountOpen] = React.useState(false);
//   const [isLoading, setIsLoading] = React.useState(false);
//   interface AccountType {
//     accountHolderName: string;
//     accountId: number;
//     accountNumber: string;
//     accountType: string;
//     address: string;
//     balance: number;
//     overdraftLimit: number;
//     status: string;
//     user: {
//       userId: number;
//       username: string;
//       role: string;
//     };
//     active: boolean;
//     branch: {
//       branchId: number;
//       ifscCode: string;
//       address: string;
//     };
//     createdAt: string;
//     email: string;
//     joinDate: string;
//     manager?: any; // can be null
//     name: string;
//     pan: string;
//     password?: any; // can be null
//     phone: string;
//   }

//   const [accounts, setAccounts] = React.useState<AccountType[]>([]);
//   const [branches, setBranches] = React.useState<Branch[]>([]);
//   const [accountType, setAccountType] = React.useState('');

//   useEffect(() => {
//     async function getAllAccounts() {
//       try {
//         const res = await axios.get("http://localhost:8080/accounts", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         })

//         const currentUserAccounts = res.data.filter((account: any) => account.user.username === localStorage.getItem('username'));

//         setAccounts(currentUserAccounts);

//         console.log('Accounts:', currentUserAccounts);
//       } catch (error) {
//         console.log('Error fetching accounts:', error);
//       }

//     }

//     getAllAccounts();
//   }, [])

//   useEffect(() => {
//     if (addAccountOpen) {

//     }
//   }, [addAccountOpen])

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors }
//   } = useForm<FieldValues>({
//     defaultValues: {
//       accountNumber: '',
//       accountType: '',
//       balance: 0,
//       overdraftLimit: 0,
//       status: 'UNVERIFIED',
//       accountHolderName: '',
//       mobile: '',
//       email: '',
//       address: '',
//       pan: '',
//     }
//   })

//   // Fetch default values from API and set them in the form
//   useEffect(() => {
//     async function fetchDefaultValues() {
//       const username = localStorage.getItem('username');
//       try {
//         const response = await axios.get(`http://localhost:8080/users/username/${username}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem('token')}`
//             }
//           }
//         );

//         console.log('Response Data:', response.data);
//         const formData = {
//           accountHolderName: response.data.name,
//           mobile: response.data.phone,
//           email: response.data.email,
//           address: response.data.address,
//           pan: response.data.pan,
//           accountNumber: '',
//           accountType: '',
//           balance: 0,
//           overdraftLimit: 0,
//           status: 'UNVERIFIED',
//           branch: {
//             branchId: 1
//           },
//           user: {
//             userId: response.data.userId
//           }
//         }

//         reset(formData);
//       } catch (error) {
//         console.log('Error fetching default values:', error);
//       }
//     }

//     async function fetchBranches() {
//       try {
//         const response = await axios.get("http://localhost:8080/branches", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         });

//         setBranches(response.data);
//         console.log('Branches:', response.data);
//       } catch (error) {
//         console.log('Error fetching branches:', error);
//       }
//     }

//     if (addAccountOpen) {
//       fetchDefaultValues();
//       fetchBranches();
//     }
//   }, [addAccountOpen, reset]);

//   const onSubmit = async (data: FieldValues) => {
//     data.status = 'UNVERIFIED';
//     data.balance = 0;
//     data.overdraftLimit = 0;
//     data.accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
//     data.accountType = accountType;

//     console.log('Form Data:', data);

//     setIsLoading(true);

//     const res = await axios.post("http://localhost:8080/accounts/create", data, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`
//       }
//     })

//     console.log('Response:', res.data);

//     setIsLoading(false);
//     setAddAccountOpen(false);
//     window.location.reload();
//   }

//   if (status === 'loading') {
//     return <div>Loading...</div>
//   }

//   return (
//     <div className='h-[100%]'>
//       {session && (
//         <div className='h-[100%]'>
//           <div className='flex justify-between mb-4 border-b border-gray-200 pb-4'>
//             <p className='text-3xl font-semibold'>Welcome, {localStorage.getItem('username')}</p>
//             <Button
//               onClick={() => {
//                 setAddAccountOpen(true);
//               }}
//             >
//               Open New Account
//             </Button>
//           </div>

//           {
//             accounts.length > 0 ? (
//               <div className="flex items-center flex-wrap gap-4">
//                 {accounts.map((account) => (
//                   <Account key={account.accountId} account={account} />
//                 ))}
//               </div>
//             ) : (
//               <p className='flex justify-center items-center h-[70vh] text-gray-500'>
//                 No accounts found.
//               </p>
//             )
//           }

//           <Modal
//             isOpen={addAccountOpen}
//             onClose={() => setAddAccountOpen(false)}
//           >
//             <div className="p-6">
//               <h2 className="text-lg font-semibold mb-4">Open New Account</h2>
//               {/* Form fields for opening a new account */}
//               <form
//                 className="space-y-6"
//                 onSubmit={handleSubmit(onSubmit)}
//               >
//                 <Input
//                   id="user.userId"
//                   label="User ID"
//                   register={register}
//                   errors={errors}
//                   disabled={true}
//                 />
//                 <Input
//                   id="accountHolderName"
//                   label="Name"
//                   register={register}
//                   errors={errors}
//                   disabled={isLoading}
//                 />

//                 <Input
//                   id="mobile"
//                   label="Mobile"
//                   type="tel"
//                   register={register}
//                   errors={errors}
//                   disabled={isLoading}
//                 />
//                 <Input
//                   id="email"
//                   label="Email"
//                   type="email"
//                   register={register}
//                   errors={errors}
//                   disabled={isLoading}
//                 />

//                 <Input
//                   id="address"
//                   label="Address"
//                   register={register}
//                   errors={errors}
//                   disabled={isLoading}
//                 />

//                 <Input
//                   id="pan"
//                   label="PAN"
//                   register={register}
//                   errors={errors}
//                   disabled={isLoading}
//                 />

//                 <Select
//                   label="Account Type"
//                   value={undefined}
//                   onChange={(value) => {
//                     setAccountType(value.value);
//                   }}
//                   options={[
//                     { value: 'SAVINGS', label: 'Savings' },
//                     { value: 'CURRENT', label: 'Current' },
//                   ]}
//                   disabled={isLoading}
//                 />

//                 <Select
//                   label="Branch"
//                   value={undefined}
//                   onChange={(value) => {
//                     reset({ branch: { branchId: value.value } });
//                   }}
//                   options={branches.map(branch => ({
//                     value: branch.branchId,
//                     label: branch.address
//                   }))}
//                   disabled={isLoading}
//                 />

//                 <div>
//                   <Button
//                     disabled={isLoading}
//                     fullWidth
//                     type="submit"
//                   >
//                     Add Account
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           </Modal>
//         </div>
//       )}
//     </div>
//   )
// }

// export default page


'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { FieldValues, useForm } from 'react-hook-form'
import Input from '../components/inputs/Input'

import Select from '../components/inputs/Select'
import Account from './components/Account'
import { Plus, CreditCard, TrendingUp, Eye, EyeOff, Wallet, Building2, Shield, CheckCircle } from 'lucide-react'
import axios from 'axios'

const page = () => {
  interface Branch {
    branchId: number;
    address: string;
    [key: string]: any;
  }

  const { data: session, status } = useSession()

  const [addAccountOpen, setAddAccountOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showBalance, setShowBalance] = React.useState(true);
  
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
    manager?: any;
    name: string;
    pan: string;
    password?: any;
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

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/accounts/create", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      console.log('Response:', res.data);
      setAddAccountOpen(false);
      window.location.reload();
    } catch (error) {
      console.log('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const inactiveAccounts = accounts.filter(account => account.status === 'UNVERIFIED').length;
  const verifiedAccounts = accounts.filter(account => account.status === 'VERIFIED').length;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      {session && (
        <div className='max-w-7xl mx-auto p-6'>
          {/* Header Section */}
          <div className='mb-8'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
              <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  Welcome back, {localStorage.getItem('username')}
                </h1>
                <p className='text-gray-600 text-lg'>Manage your accounts and track your finances</p>
              </div>
              <div className='mt-4 md:mt-0'>
                <Button
                  onClick={() => setAddAccountOpen(true)}
                  // todo
                  // className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Open New Account
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-green-100 rounded-xl'>
                    <Wallet className='text-green-600' size={24} />
                  </div>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    {showBalance ? <Eye size={20} className='text-gray-500' /> : <EyeOff size={20} className='text-gray-500' />}
                  </button>
                </div>
                <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Balance</h3>
                <p className='text-3xl font-bold text-gray-900'>
                  {showBalance ? `₹${totalBalance.toLocaleString()}` : '••••••'}
                </p>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-blue-100 rounded-xl'>
                    <CreditCard className='text-blue-600' size={24} />
                  </div>
                </div>
                <h3 className='text-gray-600 text-sm font-medium mb-1'>Inactive Accounts</h3>
                <p className='text-3xl font-bold text-gray-900'>{inactiveAccounts}</p>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-purple-100 rounded-xl'>
                    <Shield className='text-purple-600' size={24} />
                  </div>
                </div>
                <h3 className='text-gray-600 text-sm font-medium mb-1'>Verified Accounts</h3>
                <p className='text-3xl font-bold text-gray-900'>{verifiedAccounts}</p>
              </div>
            </div>
          </div>

          {/* Accounts Section */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Building2 className='text-blue-600' size={24} />
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>Your Accounts</h2>
            </div>

            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <div key={account.accountId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Account account={account} />
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center'>
                <div className='p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                  <CreditCard className='text-gray-400' size={32} />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>No accounts yet</h3>
                <p className='text-gray-600 mb-6'>Get started by opening your first account</p>
                <Button
                  onClick={() => setAddAccountOpen(true)}
                  // todo
                  // className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus size={20} className="mr-2" />
                  Open Account
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Modal */}
          <Modal
            isOpen={addAccountOpen}
            onClose={() => setAddAccountOpen(false)}
          >
            <div className="p-8 max-w-2xl mx-auto">
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-3 bg-blue-100 rounded-xl'>
                  <Plus className='text-blue-600' size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Open New Account</h2>
                  <p className="text-gray-600">Fill in your details to create a new account</p>
                </div>
              </div>

              <div className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="user.userId"
                    label="User ID"
                    register={register}
                    errors={errors}
                    disabled={true}
                    // todo
                    // className="bg-gray-50"
                  />
                  <Input
                    id="accountHolderName"
                    label="Full Name"
                    register={register}
                    errors={errors}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="mobile"
                    label="Mobile Number"
                    type="tel"
                    register={register}
                    errors={errors}
                    disabled={isLoading}
                    required
                  />
                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    register={register}
                    errors={errors}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Input
                  id="address"
                  label="Address"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                  required
                />

                <Input
                  id="pan"
                  label="PAN Number"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type *
                    </label>
                    <Select
                      value={undefined}
                      onChange={(value) => setAccountType(value.value)}
                      options={[
                        { value: 'SAVINGS', label: '💰 Savings Account' },
                        { value: 'CURRENT', label: '🏢 Current Account' },
                      ]}
                      disabled={isLoading}
                      label="Select account type"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch *
                    </label>
                    <Select
                      value={undefined}
                      onChange={(value) => {
                        reset({ branch: { branchId: value.value } });
                      }}
                      options={branches.map(branch => ({
                        value: branch.branchId,
                        label: `🏦 ${branch.address}`
                      }))}
                      disabled={isLoading}
                      label="Select branch"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-blue-600" size={20} />
                    <h4 className="font-semibold text-blue-900">Account Creation Notes</h4>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Account will be created with UNVERIFIED status</li>
                    <li>• Initial balance will be ₹0</li>
                    <li>• Account number will be generated automatically</li>
                    <li>• Please visit the branch for verification</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => setAddAccountOpen(false)}
                    // todo
                    // className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isLoading}
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    // todo
                    // className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}

export default page