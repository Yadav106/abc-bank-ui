'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Shield, 
  Briefcase, 
  CheckCircle, 
  Clock,
  Calendar,
  Hash,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Plus,
  X
} from 'lucide-react'

interface Branch {
  branchId: number;
  ifscCode: string;
  address: string;
}

interface UserData {
  userId: number;
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pan: string;
  createdAt: string;
  joinDate: string;
  branch: {
    branchId: number;
    ifscCode: string;
    address: string;
  };
  manager: any;
  active: boolean;
}

interface Account {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  overdraftLimit: number;
  createdOn: string;
  status: string;
  accountHolderName: string;
  mobile: string;
  email: string;
  address: string;
  pan: string;
  user: UserData;
  branch: {
    branchId: number;
    ifscCode: string;
    address: string;
  };
}

const ManagerPage = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifyingAccount, setVerifyingAccount] = useState<number | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    accountHolderName: '',
    email: '',
    mobile: '',
    address: '',
    pan: '',
    overdraftLimit: 0
  });
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateDialogMessage, setUpdateDialogMessage] = useState('');
  const [updateDialogType, setUpdateDialogType] = useState<'success' | 'error'>('success');

  // Fetch current user and all accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (!token || !username) {
          console.error('Token or username not found');
          return;
        }

        // Fetch current user info
        const userResponse = await axios.get(`http://localhost:8080/users/username/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(userResponse.data);

        // Fetch all accounts
        const accountsResponse = await axios.get("http://localhost:8080/accounts", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter accounts by manager's branch
        const managerBranchId = userResponse.data.branch.branchId;
        const branchAccounts = accountsResponse.data.filter((account: Account) => 
          account.branch.branchId === managerBranchId
        );

        setAllAccounts(branchAccounts);
        setFilteredAccounts(branchAccounts);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter accounts based on search term and filters
  useEffect(() => {
    let filtered = allAccounts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber.includes(searchTerm) ||
        account.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.mobile.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => account.status === statusFilter);
    }

    // Filter by account type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(account => account.accountType === typeFilter);
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, statusFilter, typeFilter, allAccounts]);

  const verifyAccount = async (account: Account) => {
    setVerifyingAccount(account.accountId);
    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        overdraftLimit: account.overdraftLimit,
        createdOn: account.createdOn,
        status: "VERIFIED",
        accountHolderName: account.accountHolderName,
        mobile: account.mobile,
        email: account.email,
        address: account.address,
        pan: account.pan,
        user: {
          userId: account.user.userId
        },
        branch: {
          branchId: account.branch.branchId
        }
      };

      await axios.put(`http://localhost:8080/accounts/${account.accountId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the account in the local state
      const updatedAccounts = allAccounts.map(acc => 
        acc.accountId === account.accountId 
          ? { ...acc, status: 'VERIFIED' }
          : acc
      );
      
      setAllAccounts(updatedAccounts);
      
      // Show success message (you can add a toast notification here)
      alert(`Account ${account.accountNumber} has been verified successfully!`);
      
    } catch (error) {
      console.error('Error verifying account:', error);
      alert('Failed to verify account. Please try again.');
    } finally {
      setVerifyingAccount(null);
    }
  };

  const openDepositModal = (account: Account) => {
    setSelectedAccount(account);
    setDepositAmount('');
    setDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setDepositModalOpen(false);
    setSelectedAccount(null);
    setDepositAmount('');
  };

  const openUpdateModal = (account: Account) => {
    setSelectedAccount(account);
    setUpdateFormData({
      accountHolderName: account.accountHolderName,
      email: account.email,
      mobile: account.mobile,
      address: account.address,
      pan: account.pan,
      overdraftLimit: account.overdraftLimit
    });
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedAccount(null);
    setUpdateFormData({
      accountHolderName: '',
      email: '',
      mobile: '',
      address: '',
      pan: '',
      overdraftLimit: 0
    });
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        accountNumber: selectedAccount.accountNumber,
        accountType: selectedAccount.accountType,
        balance: selectedAccount.balance,
        overdraftLimit: updateFormData.overdraftLimit,
        createdOn: selectedAccount.createdOn,
        status: selectedAccount.status,
        accountHolderName: updateFormData.accountHolderName,
        mobile: updateFormData.mobile,
        email: updateFormData.email,
        address: updateFormData.address,
        pan: updateFormData.pan,
        user: {
          userId: selectedAccount.user.userId
        },
        branch: {
          branchId: selectedAccount.branch.branchId
        }
      };

      await axios.put(`http://localhost:8080/accounts/${selectedAccount.accountId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the account in the local state
      const updatedAccounts = allAccounts.map(acc => 
        acc.accountId === selectedAccount.accountId 
          ? { 
              ...acc, 
              accountHolderName: updateFormData.accountHolderName,
              email: updateFormData.email,
              mobile: updateFormData.mobile,
              address: updateFormData.address,
              pan: updateFormData.pan,
              overdraftLimit: updateFormData.overdraftLimit
            }
          : acc
      );
      
      setAllAccounts(updatedAccounts);
      
      // Show success message
      setUpdateDialogMessage(`Account ${selectedAccount.accountNumber} has been updated successfully!`);
      setUpdateDialogType('success');
      setShowUpdateDialog(true);
      
      // Close modal
      closeUpdateModal();
      
    } catch (error) {
      console.error('Error updating account:', error);
      setUpdateDialogMessage('Failed to update account. Please try again.');
      setUpdateDialogType('error');
      setShowUpdateDialog(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    setDepositing(true);
    try {
      const token = localStorage.getItem('token');
      const newBalance = selectedAccount.balance + parseFloat(depositAmount);
      
      const requestBody = {
        accountNumber: selectedAccount.accountNumber,
        accountType: selectedAccount.accountType,
        balance: newBalance,
        overdraftLimit: selectedAccount.overdraftLimit,
        createdOn: selectedAccount.createdOn,
        status: selectedAccount.status,
        accountHolderName: selectedAccount.accountHolderName,
        mobile: selectedAccount.mobile,
        email: selectedAccount.email,
        address: selectedAccount.address,
        pan: selectedAccount.pan,
        user: {
          userId: selectedAccount.user.userId
        },
        branch: {
          branchId: selectedAccount.branch.branchId
        }
      };

      await axios.put(`http://localhost:8080/accounts/${selectedAccount.accountId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the account in the local state
      const updatedAccounts = allAccounts.map(acc => 
        acc.accountId === selectedAccount.accountId 
          ? { ...acc, balance: newBalance }
          : acc
      );
      
      setAllAccounts(updatedAccounts);
      
      // Show success message
      alert(`Successfully deposited ${formatCurrency(parseFloat(depositAmount))} to account ${selectedAccount.accountNumber}`);
      
      // Close modal
      closeDepositModal();
      
    } catch (error) {
      console.error('Error depositing money:', error);
      alert('Failed to deposit money. Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          icon: CheckCircle,
          text: 'Verified'
        };
      case 'UNVERIFIED':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          icon: Clock,
          text: 'Unverified'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          icon: Clock,
          text: status
        };
    }
  };

  const getAccountTypeConfig = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return {
          color: 'text-white',
          bg: 'bg-green-500',
          icon: TrendingUp,
          text: 'Savings'
        };
      case 'CURRENT':
        return {
          color: 'text-white',
          bg: 'bg-blue-500',
          icon: CreditCard,
          text: 'Current'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          icon: CreditCard,
          text: type.replace('_', ' ')
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusCount = (status: string) => {
    return allAccounts.filter(account => account.status === status).length;
  };

  const getTypeCount = (type: string) => {
    return allAccounts.filter(account => account.accountType === type).length;
  };

  const getTotalBalance = () => {
    return allAccounts.reduce((sum, account) => sum + account.balance, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <div className='max-w-7xl mx-auto p-6'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                Manager Dashboard
              </h1>
              <p className='text-gray-600 text-lg'>
                Managing accounts at {currentUser?.branch.address} branch
              </p>
            </div>
            <div className='mt-4 md:mt-0 flex items-center gap-3'>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <Building2 className='text-blue-600' size={24} />
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Branch</p>
                <p className='font-semibold text-gray-900'>{currentUser?.branch.ifscCode}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-blue-100 rounded-xl'>
                  <CreditCard className='text-blue-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Accounts</h3>
              <p className='text-3xl font-bold text-gray-900'>{allAccounts.length}</p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-green-100 rounded-xl'>
                  <DollarSign className='text-green-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Balance</h3>
              <p className='text-3xl font-bold text-gray-900'>{formatCurrency(getTotalBalance())}</p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-purple-100 rounded-xl'>
                  <CheckCircle className='text-purple-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Verified Accounts</h3>
              <p className='text-3xl font-bold text-gray-900'>{getStatusCount('VERIFIED')}</p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-yellow-100 rounded-xl'>
                  <Clock className='text-yellow-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Pending Verification</h3>
              <p className='text-3xl font-bold text-gray-900'>{getStatusCount('UNVERIFIED')}</p>
            </div>
          </div>
        </div>

        {/* Accounts Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <CreditCard className='text-purple-600' size={24} />
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>Branch Accounts</h2>
          </div>

          {/* Search and Filter Controls */}
          <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type='text'
                  placeholder='Search accounts...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              
              <div className='relative'>
                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white'
                >
                  <option value='all'>All Status</option>
                  <option value='VERIFIED'>Verified</option>
                  <option value='UNVERIFIED'>Unverified</option>
                </select>
              </div>

              <div className='relative'>
                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white'
                >
                  <option value='all'>All Types</option>
                  <option value='SAVINGS'>Savings</option>
                  <option value='CURRENT'>Current</option>
                </select>
              </div>

              <div className='flex items-center justify-end'>
                <span className='text-sm text-gray-600'>
                  Showing {filteredAccounts.length} of {allAccounts.length} accounts
                </span>
              </div>
            </div>
          </div>

          {/* Accounts Table */}
          {filteredAccounts.length > 0 ? (
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Account</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Holder</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Balance</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Type</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Status</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Created</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredAccounts.map((account) => {
                      const statusConfig = getStatusConfig(account.status);
                      const typeConfig = getAccountTypeConfig(account.accountType);
                      const StatusIcon = statusConfig.icon;
                      const TypeIcon = typeConfig.icon;
                      
                      return (
                        <tr key={account.accountId} className='hover:bg-gray-50 transition-colors duration-200'>
                          <td className='px-6 py-4'>
                            <div className='flex items-center'>
                              <div className={`p-2 rounded-lg ${typeConfig.bg} mr-4`}>
                                <TypeIcon size={20} className={typeConfig.color} />
                              </div>
                              <div>
                                <div className='font-medium text-gray-900'>{account.accountNumber}</div>
                                <div className='text-sm text-gray-500'>ID: {account.accountId}</div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='space-y-1'>
                              <div className='font-medium text-gray-900'>{account.accountHolderName}</div>
                              <div className='flex items-center text-sm text-gray-500'>
                                <User size={14} className='mr-1' />
                                @{account.user.username}
                              </div>
                              <div className='flex items-center text-sm text-gray-500'>
                                <Mail size={14} className='mr-1' />
                                {account.email}
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='space-y-1'>
                              <div className='font-semibold text-gray-900 text-lg'>
                                {formatCurrency(account.balance)}
                              </div>
                              {account.overdraftLimit > 0 && (
                                <div className='text-xs text-gray-500'>
                                  OD: {formatCurrency(account.overdraftLimit)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${typeConfig.bg}`}>
                              <TypeIcon size={14} className={typeConfig.color} />
                              <span className={`text-xs font-medium ${typeConfig.color}`}>
                                {typeConfig.text}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig.bg}`}>
                              <StatusIcon size={14} className={statusConfig.color} />
                              <span className={`text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.text}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center text-sm text-gray-900'>
                              <Calendar size={14} className='text-gray-400 mr-2' />
                              {formatDate(account.createdOn)}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex flex-col gap-2'>
                              {account.status === 'UNVERIFIED' && (
                                <button
                                  onClick={() => verifyAccount(account)}
                                  disabled={verifyingAccount === account.accountId}
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                    verifyingAccount === account.accountId
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-green-500 text-white hover:bg-green-600'
                                  }`}
                                >
                                  {verifyingAccount === account.accountId ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                      Verifying...
                                    </>
                                  ) : (
                                    <>
                                      <CheckSquare size={14} />
                                      Verify
                                    </>
                                  )}
                                </button>
                              )}
                              {account.status === 'VERIFIED' && (
                                <button
                                  onClick={() => openDepositModal(account)}
                                  className='inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200'
                                >
                                  <Plus size={14} />
                                  Deposit
                                </button>
                              )}
                              <button
                                onClick={() => openUpdateModal(account)}
                                className='inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200'
                              >
                                <User size={14} />
                                Update
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className='bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center'>
              <div className='p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                <CreditCard className='text-gray-400' size={32} />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'No accounts found' : 'No accounts in this branch'}
              </h3>
              <p className='text-gray-600'>
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Accounts created at this branch will appear here'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && selectedAccount && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <Plus className='text-blue-600' size={24} />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>Deposit Money</h2>
                  <p className='text-gray-600 text-sm'>Add funds to account</p>
                </div>
              </div>
              <button
                onClick={closeDepositModal}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
              >
                <X size={20} className='text-gray-500' />
              </button>
            </div>

            <div className='space-y-6'>
              {/* Account Info */}
              <div className='bg-gray-50 rounded-xl p-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Account Number:</span>
                    <span className='text-sm font-medium text-gray-900'>{selectedAccount.accountNumber}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Holder:</span>
                    <span className='text-sm font-medium text-gray-900'>{selectedAccount.accountHolderName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Current Balance:</span>
                    <span className='text-sm font-medium text-gray-900'>{formatCurrency(selectedAccount.balance)}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Amount Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Deposit Amount (₹)
                </label>
                <input
                  type='number'
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder='Enter amount to deposit'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  min='0'
                  step='0.01'
                />
              </div>

              {/* New Balance Preview */}
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-blue-700'>Current Balance:</span>
                      <span className='text-sm font-medium text-blue-900'>{formatCurrency(selectedAccount.balance)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-blue-700'>Deposit Amount:</span>
                      <span className='text-sm font-medium text-blue-900'>+{formatCurrency(parseFloat(depositAmount))}</span>
                    </div>
                    <div className='border-t border-blue-200 pt-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm font-semibold text-blue-900'>New Balance:</span>
                        <span className='text-sm font-bold text-blue-900'>{formatCurrency(selectedAccount.balance + parseFloat(depositAmount))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4'>
                <button
                  onClick={closeDepositModal}
                  disabled={depositing}
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                  className='flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {depositing ? (
                    <div className='flex items-center justify-center gap-2'>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Depositing...
                    </div>
                  ) : (
                    'Deposit Money'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Account Modal */}
      {updateModalOpen && selectedAccount && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <User className='text-purple-600' size={24} />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>Update Account</h2>
                  <p className='text-gray-600 text-sm'>Modify account details</p>
                </div>
              </div>
              <button
                onClick={closeUpdateModal}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
              >
                <X size={20} className='text-gray-500' />
              </button>
            </div>

            <div className='space-y-6'>
              {/* Account Info */}
              <div className='bg-gray-50 rounded-xl p-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='text-sm text-gray-600'>Account Number:</span>
                    <p className='text-sm font-medium text-gray-900'>{selectedAccount.accountNumber}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>Account Type:</span>
                    <p className='text-sm font-medium text-gray-900'>{selectedAccount.accountType}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>Current Balance:</span>
                    <p className='text-sm font-medium text-gray-900'>{formatCurrency(selectedAccount.balance)}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>Status:</span>
                    <p className='text-sm font-medium text-gray-900'>{selectedAccount.status}</p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Account Holder Name *
                  </label>
                  <input
                    type='text'
                    value={updateFormData.accountHolderName}
                    onChange={(e) => setUpdateFormData({...updateFormData, accountHolderName: e.target.value})}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email Address *
                  </label>
                  <input
                    type='email'
                    value={updateFormData.email}
                    onChange={(e) => setUpdateFormData({...updateFormData, email: e.target.value})}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Mobile Number *
                  </label>
                  <input
                    type='tel'
                    value={updateFormData.mobile}
                    onChange={(e) => setUpdateFormData({...updateFormData, mobile: e.target.value})}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    PAN Number *
                  </label>
                  <input
                    type='text'
                    value={updateFormData.pan}
                    onChange={(e) => setUpdateFormData({...updateFormData, pan: e.target.value})}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Address *
                  </label>
                  <textarea
                    value={updateFormData.address}
                    onChange={(e) => setUpdateFormData({...updateFormData, address: e.target.value})}
                    rows={3}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Overdraft Limit (₹)
                  </label>
                  <input
                    type='number'
                    value={updateFormData.overdraftLimit}
                    onChange={(e) => setUpdateFormData({...updateFormData, overdraftLimit: parseFloat(e.target.value) || 0})}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    min='0'
                    step='0.01'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4 border-t border-gray-200'>
                <button
                  onClick={closeUpdateModal}
                  disabled={updating}
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAccount}
                  disabled={updating || !updateFormData.accountHolderName || !updateFormData.email || !updateFormData.mobile || !updateFormData.address || !updateFormData.pan}
                  className='flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {updating ? (
                    <div className='flex items-center justify-center gap-2'>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Account Dialog */}
      {showUpdateDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl'>
            <div className='text-center'>
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${
                updateDialogType === 'success' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {updateDialogType === 'success' ? (
                  <CheckCircle className='h-8 w-8 text-green-600' />
                ) : (
                  <AlertCircle className='h-8 w-8 text-red-600' />
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-3 ${
                updateDialogType === 'success' 
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                {updateDialogType === 'success' ? 'Update Successful!' : 'Update Failed'}
              </h3>
              
              <p className={`text-gray-600 mb-6 ${
                updateDialogType === 'success' 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                {updateDialogMessage}
              </p>
              
              <button
                onClick={() => setShowUpdateDialog(false)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  updateDialogType === 'success'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {updateDialogType === 'success' ? 'Continue' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerPage
