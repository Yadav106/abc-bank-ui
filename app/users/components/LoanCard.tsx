import React from 'react';
import { Banknote, CheckCircle, Clock, XCircle, Calendar, Percent, Home, Car, GraduationCap, User } from 'lucide-react';

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

const LoanCard = ({ loan, onRepaymentClick }: LoanCardProps) => {
  const getStatusConfig = () => {
    switch (loan.status) {
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

  return (
    <div 
      className="relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group"
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
    </div>
  );
};

export default LoanCard;