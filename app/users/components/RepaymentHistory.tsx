import React from 'react';
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Hourglass, CreditCard } from 'lucide-react';

interface Repayment {
  repaymentId: number;
  paymentDate: string;
  month: number;
  amountPaid: number;
  principalComponent: number;
  interestComponent: number;
  remainingOutstanding: number;
  status: string;
  account?: {
    accountId: number;
    accountNumber: string;
    accountType: string;
  };
}

interface RepaymentHistoryProps {
  repayments: Repayment[];
  loanType: string;
  loanId: number;
}

const RepaymentHistory = ({ repayments, loanType, loanId }: RepaymentHistoryProps) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle };
      case 'PENDING':
        return { color: 'text-yellow-800', bg: 'bg-yellow-100', icon: Hourglass };
      case 'FAILED':
        return { color: 'text-red-800', bg: 'bg-red-100', icon: XCircle };
      default:
        return { color: 'text-gray-800', bg: 'bg-gray-100', icon: Clock };
    }
  };

  const getMonthLabel = (month: number, index: number) => `EMI #${index + 1}`;

  return (
    <div className="bg-white  rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Repayment History</h3>
              <p className="text-white/80 text-sm">{loanType.replace('_', ' ')} - Loan #{loanId}</p>
            </div>
          </div>
          <div className="text-white/80 text-sm">
            {repayments.length} payment{repayments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {repayments.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  title: 'Total Paid',
                  value: repayments.reduce((sum, r) => sum + r.amountPaid, 0),
                  icon: DollarSign,
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  text: 'text-blue-900',
                },
                {
                  title: 'Principal Paid',
                  value: repayments.reduce((sum, r) => sum + r.principalComponent, 0),
                  icon: TrendingUp,
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  text: 'text-green-900',
                },
                {
                  title: 'Interest Paid',
                  value: repayments.reduce((sum, r) => sum + r.interestComponent, 0),
                  icon: Clock,
                  bg: 'bg-orange-50',
                  border: 'border-orange-200',
                  text: 'text-orange-900',
                },
              ].map(({ title, value, icon: Icon, bg, border, text }, idx) => (
                <div key={idx} className={`${bg} rounded-xl p-4 ${border} border`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={text} />
                    <span className={`text-sm font-medium ${text}`}>{title}</span>
                  </div>
                  <p className={`text-2xl font-bold ${text}`}>{formatCurrency(value)}</p>
                </div>
              ))}
            </div>

            {/* Repayments List - Mobile Friendly */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h4>
              {repayments.map((repayment, index) => {
                const { color, bg, icon: StatusIcon } = getStatusStyles(repayment.status);

                return (
                  <div
                    key={repayment.repaymentId}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {getMonthLabel(repayment.month, index)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
                        <StatusIcon size={12} />
                        {repayment.status}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-gray-600 mb-3">
                      {formatDate(repayment.paymentDate)}
                    </div>

                    {/* Account Information */}
                    {repayment.account && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={14} className="text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">Payment Account</span>
                        </div>
                        <div className="text-sm text-blue-900">
                          {repayment.account.accountNumber} - {repayment.account.accountType}
                        </div>
                      </div>
                    )}

                    {/* Amount Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="font-semibold text-green-600 text-lg">
                          {formatCurrency(repayment.amountPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Principal</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(repayment.principalComponent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Interest</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(repayment.interestComponent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Remaining</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(repayment.remainingOutstanding)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No repayments yet</h3>
            <p className="text-gray-600">Repayment history will appear here once you make your first payment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepaymentHistory;
