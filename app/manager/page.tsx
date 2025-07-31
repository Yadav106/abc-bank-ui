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
  CheckSquare
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
                            {account.status === 'UNVERIFIED' && (
                              <button
                                onClick={() => verifyAccount(account)}
                                disabled={verifyingAccount === account.accountId}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                  verifyingAccount === account.accountId
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                {verifyingAccount === account.accountId ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <CheckSquare size={16} />
                                    Verify
                                  </>
                                )}
                              </button>
                            )}
                            {account.status === 'VERIFIED' && (
                              <div className='flex items-center gap-1 text-green-700'>
                                <CheckCircle size={16} />
                                <span className='text-sm font-medium'>Verified</span>
                              </div>
                            )}
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
    </div>
  )
}

export default ManagerPage
