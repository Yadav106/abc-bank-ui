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
  X,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Percent,
  Home,
  Car,
  GraduationCap
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

interface Loan {
  loanAccountId: number;
  loanType: string;
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: string;
  user: UserData;
  branch: {
    branchId: number;
    ifscCode: string;
    address: string;
  };
}

const LoanOfficerPage = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [processingLoan, setProcessingLoan] = useState<number | null>(null);

  // Fetch current user and all loans
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

        // Fetch all loans
        const loansResponse = await axios.get("http://localhost:8080/api/loans", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter loans by loan officer's branch
        const officerBranchId = userResponse.data.branch.branchId;
        const branchLoans = loansResponse.data.filter((loan: Loan) => 
          loan.branch.branchId === officerBranchId
        );

        setAllLoans(branchLoans);
        setFilteredLoans(branchLoans);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter loans based on search term and filters
  useEffect(() => {
    let filtered = allLoans;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanAccountId.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    // Filter by loan type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(loan => loan.loanType === typeFilter);
    }

    setFilteredLoans(filtered);
  }, [searchTerm, statusFilter, typeFilter, allLoans]);

  const approveLoan = async (loan: Loan) => {
    setProcessingLoan(loan.loanAccountId);
    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        loanType: loan.loanType,
        loanAmount: loan.loanAmount,
        outstandingAmount: loan.outstandingAmount,
        interestRate: loan.interestRate,
        startDate: loan.startDate,
        endDate: loan.endDate,
        status: "ACTIVE",
        user: {
          userId: loan.user.userId
        },
        branch: {
          branchId: loan.branch.branchId
        }
      };

      await axios.put(`http://localhost:8080/api/loans/${loan.loanAccountId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the loan in the local state
      const updatedLoans = allLoans.map(l => 
        l.loanAccountId === loan.loanAccountId 
          ? { ...l, status: 'ACTIVE' }
          : l
      );
      
      setAllLoans(updatedLoans);
      
      // Show success message
      alert(`Loan ${loan.loanAccountId} has been approved successfully!`);
      
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Failed to approve loan. Please try again.');
    } finally {
      setProcessingLoan(null);
    }
  };

  const rejectLoan = async (loan: Loan) => {
    setProcessingLoan(loan.loanAccountId);
    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        loanType: loan.loanType,
        loanAmount: loan.loanAmount,
        outstandingAmount: loan.outstandingAmount,
        interestRate: loan.interestRate,
        startDate: loan.startDate,
        endDate: loan.endDate,
        status: "REJECTED",
        user: {
          userId: loan.user.userId
        },
        branch: {
          branchId: loan.branch.branchId
        }
      };

      await axios.put(`http://localhost:8080/api/loans/${loan.loanAccountId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the loan in the local state
      const updatedLoans = allLoans.map(l => 
        l.loanAccountId === loan.loanAccountId 
          ? { ...l, status: 'REJECTED' }
          : l
      );
      
      setAllLoans(updatedLoans);
      
      // Show success message
      alert(`Loan ${loan.loanAccountId} has been rejected.`);
      
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert('Failed to reject loan. Please try again.');
    } finally {
      setProcessingLoan(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          icon: CheckCircle,
          text: 'Active'
        };
      case 'PENDING':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          icon: Clock,
          text: 'Pending'
        };
      case 'REJECTED':
        return {
          color: 'text-red-700',
          bg: 'bg-red-100',
          icon: X,
          text: 'Rejected'
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

  const getLoanTypeConfig = (type: string) => {
    switch (type) {
      case 'HOME_LOAN':
        return {
          color: 'text-white',
          bg: 'bg-green-500',
          icon: Home,
          text: 'Home Loan'
        };
      case 'CAR_LOAN':
        return {
          color: 'text-white',
          bg: 'bg-blue-500',
          icon: Car,
          text: 'Car Loan'
        };
      case 'PERSONAL_LOAN':
        return {
          color: 'text-white',
          bg: 'bg-purple-500',
          icon: User,
          text: 'Personal Loan'
        };
      case 'EDUCATION_LOAN':
        return {
          color: 'text-white',
          bg: 'bg-orange-500',
          icon: GraduationCap,
          text: 'Education Loan'
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusCount = (status: string) => {
    return allLoans.filter(loan => loan.status === status).length;
  };

  const getTypeCount = (type: string) => {
    return allLoans.filter(loan => loan.loanType === type).length;
  };

  const getTotalLoanAmount = () => {
    return allLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
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
                Loan Officer Dashboard
              </h1>
              <p className='text-gray-600 text-lg'>
                Managing loans at {currentUser?.branch.address} branch
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
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Loans</h3>
              <p className='text-3xl font-bold text-gray-900'>{allLoans.length}</p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-green-100 rounded-xl'>
                  <DollarSign className='text-green-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Loan Amount</h3>
              <p className='text-3xl font-bold text-gray-900'>{formatCurrency(getTotalLoanAmount())}</p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-yellow-100 rounded-xl'>
                  <Clock className='text-yellow-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Pending Approval</h3>
              <p className='text-3xl font-bold text-gray-900'>{getStatusCount('PENDING')}</p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-purple-100 rounded-xl'>
                  <CheckCircle className='text-purple-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Active Loans</h3>
              <p className='text-3xl font-bold text-gray-900'>{getStatusCount('ACTIVE')}</p>
            </div>
          </div>
        </div>

        {/* Loans Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <CreditCard className='text-purple-600' size={24} />
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>Branch Loans</h2>
          </div>

          {/* Search and Filter Controls */}
          <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type='text'
                  placeholder='Search loans...'
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
                  <option value='PENDING'>Pending</option>
                  <option value='ACTIVE'>Active</option>
                  <option value='REJECTED'>Rejected</option>
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
                  <option value='HOME_LOAN'>Home Loan</option>
                  <option value='CAR_LOAN'>Car Loan</option>
                  <option value='PERSONAL_LOAN'>Personal Loan</option>
                  <option value='EDUCATION_LOAN'>Education Loan</option>
                </select>
              </div>

              <div className='flex items-center justify-end'>
                <span className='text-sm text-gray-600'>
                  Showing {filteredLoans.length} of {allLoans.length} loans
                </span>
              </div>
            </div>
          </div>

          {/* Loans Table */}
          {filteredLoans.length > 0 ? (
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Loan</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Applicant</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Amount</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Type</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Status</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Applied</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Remaining</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredLoans.map((loan) => {
                      const statusConfig = getStatusConfig(loan.status);
                      const typeConfig = getLoanTypeConfig(loan.loanType);
                      const StatusIcon = statusConfig.icon;
                      const TypeIcon = typeConfig.icon;
                      
                      return (
                        <tr key={loan.loanAccountId} className='hover:bg-gray-50 transition-colors duration-200'>
                          <td className='px-6 py-4'>
                            <div className='flex items-center'>
                              <div className={`p-2 rounded-lg ${typeConfig.bg} mr-4`}>
                                <TypeIcon size={20} className={typeConfig.color} />
                              </div>
                              <div>
                                <div className='font-medium text-gray-900'>#{loan.loanAccountId}</div>
                                <div className='text-sm text-gray-500'>Rate: {loan.interestRate}%</div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='space-y-1'>
                              <div className='font-medium text-gray-900'>{loan.user.name}</div>
                              <div className='flex items-center text-sm text-gray-500'>
                                <User size={14} className='mr-1' />
                                @{loan.user.username}
                              </div>
                              <div className='flex items-center text-sm text-gray-500'>
                                <Mail size={14} className='mr-1' />
                                {loan.user.email}
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='space-y-1'>
                              <div className='font-semibold text-gray-900 text-lg'>
                                {formatCurrency(loan.loanAmount)}
                              </div>
                              <div className='text-xs text-gray-500'>
                                Outstanding: {formatCurrency(loan.outstandingAmount)}
                              </div>
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
                              {formatDate(loan.startDate)}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='text-sm text-gray-900'>
                              {loan.status === 'ACTIVE' ? (
                                <span className='font-medium text-blue-600'>
                                  {(() => {
                                    const startDate = new Date(loan.startDate);
                                    const endDate = new Date(loan.endDate);
                                    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                                       (endDate.getMonth() - startDate.getMonth());
                                    return `${totalMonths} months`;
                                  })()}
                                </span>
                              ) : (
                                <span className='text-gray-400'>-</span>
                              )}
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex flex-col gap-2'>
                              {loan.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => approveLoan(loan)}
                                    disabled={processingLoan === loan.loanAccountId}
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                      processingLoan === loan.loanAccountId
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                  >
                                    {processingLoan === loan.loanAccountId ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <ThumbsUp size={14} />
                                        Approve
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => rejectLoan(loan)}
                                    disabled={processingLoan === loan.loanAccountId}
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                      processingLoan === loan.loanAccountId
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                  >
                                    {processingLoan === loan.loanAccountId ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <ThumbsDown size={14} />
                                        Reject
                                      </>
                                    )}
                                  </button>
                                </>
                              )}
                              {loan.status === 'ACTIVE' && (
                                <div className='inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium'>
                                  <CheckCircle size={14} />
                                  Approved
                                </div>
                              )}
                              {loan.status === 'REJECTED' && (
                                <div className='inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium'>
                                  <X size={14} />
                                  Rejected
                                </div>
                              )}
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
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'No loans found' : 'No loans in this branch'}
              </h3>
              <p className='text-gray-600'>
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Loan applications at this branch will appear here'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanOfficerPage 