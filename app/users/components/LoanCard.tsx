import React, { useEffect, useState } from 'react';
import { Banknote, CheckCircle, Clock, XCircle, Calendar, Percent, Home, Car, GraduationCap, User } from 'lucide-react';
import axios from 'axios';

interface Loan {
  loanAccountId: number;
  loanType: string;
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: string;
  branch: {
    branchId: number;
    address: string;
  };
}

interface LoanCardProps {
  loan: Loan;
  onRepaymentClick: (loan: Loan) => void;
}

interface Repayment {
  emisRemaining: number;
  emisPaid: number;
  totalEMIs: number;
}

const LoanCard = ({ loan, onRepaymentClick }: LoanCardProps) => {
  const [repaymentData, setRepaymentData] = useState<Repayment | null>(null);
  const [loadingRepayment, setLoadingRepayment] = useState(false);

  // Fetch repayment data for the loan
  useEffect(() => {
    const fetchRepaymentData = async () => {
      if (loan.status !== 'ACTIVE') return;
      
      setLoadingRepayment(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:8080/api/repayments/loan/${loan.loanAccountId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.length > 0) {
          // Get the latest repayment record which has the current EMI status
          const latestRepayment = response.data[response.data.length - 1];
          setRepaymentData({
            emisRemaining: latestRepayment.emisRemaining || 0,
            emisPaid: latestRepayment.emisPaid || 0,
            totalEMIs: latestRepayment.totalEMIs || 0,
          });
        } else {
          // If no repayments yet, calculate from loan tenure
          const startDate = new Date(loan.startDate);
          const endDate = new Date(loan.endDate);
          const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                             (endDate.getMonth() - startDate.getMonth());
          
          setRepaymentData({
            emisRemaining: totalMonths,
            emisPaid: 0,
            totalEMIs: totalMonths,
          });
        }
      } catch (error) {
        console.error('Error fetching repayment data:', error);
        // Fallback calculation
        const startDate = new Date(loan.startDate);
        const endDate = new Date(loan.endDate);
        const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           (endDate.getMonth() - startDate.getMonth());
        
        setRepaymentData({
          emisRemaining: totalMonths,
          emisPaid: 0,
          totalEMIs: totalMonths,
        });
      } finally {
        setLoadingRepayment(false);
      }
    };

    fetchRepaymentData();
  }, [loan.loanAccountId, loan.status, loan.startDate, loan.endDate]);
  const getStatusConfig = () => {
    switch (loan.status) {
      case 'ACTIVE':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          icon: CheckCircle,
          text: 'Active',
        };
      case 'APPROVED':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          icon: CheckCircle,
          text: 'Approved',
        };
      case 'PENDING':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          icon: Clock,
          text: 'Pending',
        };
      case 'REJECTED':
        return {
          color: 'text-red-700',
          bg: 'bg-red-100',
          icon: XCircle,
          text: 'Rejected',
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          icon: Clock,
          text: loan.status,
        };
    }
  };

  const getLoanTypeConfig = () => {
    switch (loan.loanType) {
      case 'HOME_LOAN':
        return {
          bg: 'bg-gradient-to-br from-green-400 to-green-600',
          icon: Home,
          label: 'HOME LOAN'
        };
      case 'CAR_LOAN':
        return {
          bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
          icon: Car,
          label: 'CAR LOAN'
        };
      case 'PERSONAL_LOAN':
        return {
          bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
          icon: User,
          label: 'PERSONAL LOAN'
        };
      case 'EDUCATION_LOAN':
        return {
          bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
          icon: GraduationCap,
          label: 'EDUCATION LOAN'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
          icon: Banknote,
          label: loan.loanType.replace('_', ' ').toUpperCase()
        };
    }
  };

  const statusConfig = getStatusConfig();
  const loanTypeConfig = getLoanTypeConfig();
  const StatusIcon = statusConfig.icon;
  const LoanIcon = loanTypeConfig.icon;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isClickable = loan.status === 'ACTIVE';
  
  return (
    <div 
      className={`relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
        isClickable 
          ? 'hover:-translate-y-1 cursor-pointer' 
          : 'cursor-default opacity-90'
      }`}
      onClick={() => onRepaymentClick(loan)}
    >
      {/* Gradient Header */}
      <div className={`${loanTypeConfig.bg} p-6 text-white relative`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <LoanIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{loanTypeConfig.label}</h3>
              <p className="text-white/80 text-sm">Loan ID: #{loan.loanAccountId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm w-fit mt-2">
            <StatusIcon size={14} className={statusConfig.color} />
            <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.text}</span>
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
            <p className="font-bold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Outstanding</p>
            <p className="font-bold text-gray-900">{formatCurrency(loan.outstandingAmount)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Percent size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">Interest Rate:</span>
            <span className="font-medium text-gray-900">{loan.interestRate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" />
            <span className="text-sm text-gray-600">Tenure:</span>
            <span className="font-medium text-gray-900">{formatDate(loan.startDate)} - {formatDate(loan.endDate)}</span>
          </div>
        </div>
        
        {/* EMI Progress Section - Only show for active loans */}
        {loan.status === 'ACTIVE' && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">EMI Progress</span>
              {loadingRepayment && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
            {repaymentData && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">EMIs Paid:</span>
                  <span className="font-medium text-blue-900">{repaymentData.emisPaid} / {repaymentData.totalEMIs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Remaining:</span>
                  <span className="font-medium text-blue-900">{repaymentData.emisRemaining} months</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${repaymentData.totalEMIs > 0 ? (repaymentData.emisPaid / repaymentData.totalEMIs) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Banknote size={16} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{loan.branch.address}</p>
          </div>
        </div>
      </div>
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 rounded-2xl"></div>
      
      {/* Status Message Overlay for Non-Active Loans */}
      {!isClickable && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-gray-900">
              {loan.status === 'PENDING' && 'Awaiting Approval'}
              {loan.status === 'REJECTED' && 'Loan Rejected'}
              {loan.status === 'APPROVED' && 'Loan Approved'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {loan.status === 'PENDING' && 'Please wait for loan officer review'}
              {loan.status === 'REJECTED' && 'Contact branch for details'}
              {loan.status === 'APPROVED' && 'Will be activated soon'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCard;