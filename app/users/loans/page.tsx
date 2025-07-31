'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/inputs/Input';
import Select from '../../components/inputs/Select';
import LoanCard from '../components/LoanCard';
import RepaymentHistory from '../components/RepaymentHistory';
import { FieldValues, useForm } from 'react-hook-form';
import { Plus, Banknote, CreditCard, Wallet, History } from 'lucide-react';

const LOAN_TYPES = [
  { value: 'HOME_LOAN', label: 'Home Loan' },
  { value: 'CAR_LOAN', label: 'Car Loan' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'EDUCATION_LOAN', label: 'Education Loan' },
];

const LOAN_RATES: Record<string, number> = {
  HOME_LOAN: 7.5,
  CAR_LOAN: 8.5,
  PERSONAL_LOAN: 12.0,
  EDUCATION_LOAN: 6.5,
};

const TENURE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({ value: i + 1, label: `${i + 1} year${i === 0 ? '' : 's'}` }));

// EMI calculation function
const calculateEMI = (principal: number, annualRate: number, months: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
};

const LoansPage = () => {
  const { data: session, status } = useSession();
  const [loans, setLoans] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loanType, setLoanType] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tenure, setTenure] = useState<any>(null);
  const [interestRate, setInterestRate] = useState<number | null>(null);

  // Repayment states
  const [repaymentOpen, setRepaymentOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [activeAccounts, setActiveAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isRepaymentLoading, setIsRepaymentLoading] = useState(false);
  const [calculatedEMI, setCalculatedEMI] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Repayment history states
  const [repaymentHistoryOpen, setRepaymentHistoryOpen] = useState(false);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      loanAmount: '',
    },
  });

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe number formatting function
  const safeFormatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '₹0';
    return `₹${value.toLocaleString()}`;
  };

  // Safe string formatting function
  const safeFormatString = (value: string | undefined | null): string => {
    return value || '';
  };

  // Calculate EMI for selected loan - only on client side
  const calculateLoanEMI = () => {
    if (!selectedLoan || !isClient) return 0;
    
    try {
      // Calculate tenure in months from start and end dates
      const startDate = new Date(selectedLoan.startDate);
      const endDate = new Date(selectedLoan.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      
      if (months <= 0) return 0;
      
      return calculateEMI(selectedLoan.loanAmount || 0, selectedLoan.interestRate || 0, months);
    } catch (error) {
      console.error('Error calculating EMI:', error);
      return 0;
    }
  };

  // Update calculated EMI when selected loan changes
  useEffect(() => {
    if (selectedLoan && isClient) {
      const emi = calculateLoanEMI();
      setCalculatedEMI(emi);
    }
  }, [selectedLoan, isClient]);

  // Debug selected account
  useEffect(() => {
    if (selectedAccount) {
      console.log('Selected Account:', selectedAccount);
      console.log('Account Balance:', selectedAccount.balance);
      console.log('Account Type:', typeof selectedAccount.balance);
    }
  }, [selectedAccount]);

  // When loanType changes, set interest rate
  useEffect(() => {
    if (loanType) {
      setInterestRate(LOAN_RATES[loanType.value] || null);
    } else {
      setInterestRate(null);
    }
  }, [loanType]);

  // Fetch user's loans
  useEffect(() => {
    async function fetchLoans() {
      setIsLoading(true);
      setError(null);
      try {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        if (!username || !token) return;
        // Get userId
        const userRes = await axios.get(`http://localhost:8080/users/username/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = userRes.data.userId;
        // Get all loans for user
        const loansRes = await axios.get(`http://localhost:8080/api/loans/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoans(loansRes.data);
      } catch (err: any) {
        setError('Failed to fetch loans');
      } finally {
        setIsLoading(false);
      }
    }
    if (status === 'authenticated') fetchLoans();
  }, [status, applyOpen, repaymentOpen]);

  // Fetch branches for selection
  useEffect(() => {
    async function fetchBranches() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/branches', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(res.data);
      } catch {}
    }
    if (applyOpen) fetchBranches();
  }, [applyOpen]);

  // Fetch active accounts for repayment
  useEffect(() => {
    async function fetchActiveAccounts() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/accounts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const username = localStorage.getItem('username');
        const userAccounts = res.data.filter((account: any) => 
          account.user.username === username 
        && 
          account.status === 'VERIFIED' && 
          account.balance > 0
        );
        setActiveAccounts(userAccounts);
        console.log("active", userAccounts);
      } catch (err) {
        console.error('Failed to fetch active accounts:', err);
      }
    }
    if (repaymentOpen) fetchActiveAccounts();
  }, [repaymentOpen]);

  // Handle repayment click
  const handleRepaymentClick = (loan: any) => {
    setSelectedLoan(loan);
    setRepaymentOpen(true);
    setSelectedAccount(null);
    setSuccess(null); // Clear success message
  };

  // Handle repayment history click
  const handleHistoryClick = async (loan: any) => {
    setSelectedLoanForHistory(loan);
    setRepaymentHistoryOpen(true);
    setSuccess(null); // Clear success message
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/repayments/loan/${loan.loanAccountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepayments(res.data);
    } catch (err) {
      console.error('Failed to fetch repayment history:', err);
      setRepayments([]);
    }
  };

  
  const handleRepaymentSubmit = async () => {
    const calculateLoanEMI = (principal: number, annualRate: number, months: number): number => {
      const monthlyRate = annualRate / 12 / 100;
      return Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
      );
    };
    if (!selectedAccount || !selectedLoan) return;
  
    setIsRepaymentLoading(true);
    setError(null);
    setSuccess(null); // Clear previous success messages
  
    try {
      const token = localStorage.getItem('token');
  
      // Calculate tenure in months
      const startDate = new Date(selectedLoan.startDate);
      const endDate = new Date(selectedLoan.endDate);
      const totalMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
  
      // Get interest rate from LOAN_RATES
      const interestRate = LOAN_RATES[selectedLoan.loanType] ?? selectedLoan.interestRate;
  
      // Calculate EMI
      const emiAmount = calculateLoanEMI(selectedLoan.loanAmount, interestRate, totalMonths);
  
      if (emiAmount <= 0) {
        setError('Invalid EMI calculation');
        return;
      }
  
      if (emiAmount > selectedAccount.value.balance) {
        setError('Insufficient balance in selected account');
        return;
      }
  
      // Calculate repayment breakdown
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
  
      const principalComponent = Math.round(emiAmount * 0.7);
      const interestComponent = emiAmount - principalComponent;
      const remainingOutstanding = Math.max(
        0,
        Math.round((selectedLoan.outstandingAmount || 0) - principalComponent)
      );
  
      const emisPaid = Math.min(totalMonths, Math.floor(((selectedLoan.loanAmount || 0) - remainingOutstanding) / principalComponent));
      const emisRemaining = totalMonths - emisPaid;
  
      const repaymentData = {
        loanAccount: { loanAccountId: selectedLoan.loanAccountId },
        paymentDate: currentDate.toISOString(),
        month: month,
        amountPaid: emiAmount,
        principalComponent: principalComponent,
        interestComponent: interestComponent,
        remainingOutstanding: remainingOutstanding,
        totalLoanAmount: selectedLoan.loanAmount,
        totalEMIs: totalMonths,
        emisPaid: emisPaid,
        emisRemaining: emisRemaining,
        status: 'COMPLETED',
        account: {
          accountId: selectedAccount.value.accountId,
          accountNumber: selectedAccount.value.accountNumber,
          accountType: selectedAccount.value.accountType
        }
      };

      console.log('repay', repaymentData);
  
      // Submit repayment
      await axios.post('http://localhost:8080/api/repayments', repaymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update account balance by deducting EMI amount
      const updatedBalance = selectedAccount.value.balance - emiAmount;
      await axios.put(`http://localhost:8080/accounts/${selectedAccount.value.accountId}`, {
        balance: updatedBalance
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update loan outstanding amount
      await axios.put(`http://localhost:8080/api/loans/${selectedLoan.loanAccountId}`, {
        outstandingAmount: remainingOutstanding
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setRepaymentOpen(false);
      setSelectedLoan(null);
      setSelectedAccount(null);
      setCalculatedEMI(0);
      setSuccess('EMI repayment successful!');
  
      // Trigger success state or refresh
    } catch (err: any) {
      console.error(err);
      setError('Failed to process repayment');
    } finally {
      setIsRepaymentLoading(false);
    }
  };
  // Handle repayment submission
  // const handleRepaymentSubmit = async () => {
  //   if (!selectedAccount || !selectedLoan) return;
    
  //   setIsRepaymentLoading(true);
  //   setError(null);
    
  //   try {
  //     const token = localStorage.getItem('token');
  //     const emiAmount = calculateLoanEMI();
      
  //     if (emiAmount <= 0) {
  //       setError('Invalid EMI calculation');
  //       return;
  //     }
      
  //     if (emiAmount > selectedAccount.balance) {
  //       setError('Insufficient balance in selected account');
  //       return;
  //     }

  //     // Calculate repayment details
  //     const currentDate = new Date();
  //     const month = currentDate.getMonth() + 1; // 1-12
      
  //     // For simplicity, assuming 70% principal, 30% interest
  //     const principalComponent = emiAmount * 0.7;
  //     const interestComponent = emiAmount * 0.3;
  //     const remainingOutstanding = selectedLoan.outstandingAmount - principalComponent;
      
  //     const repaymentData = {
  //       loanAccount: { loanAccountId: selectedLoan.loanAccountId },
  //       paymentDate: currentDate.toISOString(),
  //       month: month,
  //       amountPaid: emiAmount,
  //       principalComponent: principalComponent,
  //       interestComponent: interestComponent,
  //       remainingOutstanding: remainingOutstanding,
  //       totalLoanAmount: selectedLoan.loanAmount,
  //       totalEMIs: 120, // Assuming 10 years * 12 months
  //       emisPaid: 1, // This should be calculated based on existing repayments
  //       emisRemaining: 119, // This should be calculated
  //       status: 'COMPLETED'
  //     };

  //     await axios.post('http://localhost:8080/api/repayments', repaymentData, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     setRepaymentOpen(false);
  //     setSelectedLoan(null);
  //     setSelectedAccount(null);
      
  //     // Show success message or refresh loans
  //   } catch (err: any) {
  //     setError('Failed to process repayment');
  //   } finally {
  //     setIsRepaymentLoading(false);
  //   }
  // };

  // Handle loan application
  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null); // Clear previous success messages
    try {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      if (!username || !token) throw new Error('Not authenticated');
      // Get userId
      const userRes = await axios.get(`http://localhost:8080/users/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userRes.data.userId;
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + (tenure?.value || 1));
      // Prepare request body
      const body = {
        loanType: loanType?.value,
        loanAmount: Number(data.loanAmount),
        outstandingAmount: Number(data.loanAmount),
        interestRate: interestRate,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'PENDING',
        user: { userId },
        branch: { branchId: branch?.value },
      };
      await axios.post('http://localhost:8080/api/loans', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplyOpen(false);
      reset();
      setLoanType(null);
      setBranch(null);
      setTenure(null);
      setInterestRate(null);
      setSuccess('Loan application successful!');
    } catch (err: any) {
      setError('Failed to apply for loan');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Loan Accounts
              </h1>
              <p className="text-gray-600 text-lg">View and manage your loans</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => {
                setApplyOpen(true);
                setSuccess(null); // Clear success message
              }}>
                <Plus size={20} /> Apply for Loan
              </Button>
            </div>
          </div>
        </div>
        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>
        )}
        {/* Loans List */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : loans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan: any) => (
              <div key={loan.loanAccountId} className="relative">
                <LoanCard loan={loan} onRepaymentClick={handleRepaymentClick} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHistoryClick(loan);
                    }}
                    className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
                  >
                    <History size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Banknote className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No loans yet</h3>
            <p className="text-gray-600 mb-6">Apply for your first loan to get started</p>
            <Button onClick={() => setApplyOpen(true)}>
              <Plus size={20} className="mr-2" /> Apply for Loan
            </Button>
          </div>
        )}

        {/* Apply Loan Modal */}
        <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)}>
          <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Banknote className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Apply for Loan</h2>
                <p className="text-gray-600">Fill in your details to apply for a new loan</p>
              </div>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Select
                label="Loan Type"
                value={loanType}
                onChange={setLoanType}
                options={LOAN_TYPES}
                disabled={isLoading}
              />
              <Input
                id="loanAmount"
                label="Loan Amount (₹)"
                type="number"
                register={register}
                errors={errors}
                disabled={isLoading}
                required
                min="10000"
                placeholder="Enter loan amount"
              />
              <Select
                label="Tenure"
                value={tenure}
                onChange={setTenure}
                options={TENURE_OPTIONS}
                disabled={isLoading}
              />
              {/* Interest Rate: plain input, not registered */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Interest Rate (%)</label>
                <div className="mt-2">
                  <input
                    type="number"
                    value={interestRate !== null ? interestRate : ''}
                    disabled
                    className="form-input block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6 opacity-50 cursor-default"
                    placeholder="Auto-filled by loan type"
                  />
                </div>
              </div>
              <Select
                label="Branch"
                value={branch}
                onChange={setBranch}
                options={branches.map((b: any) => ({ value: b.branchId, label: b.address }))}
                disabled={isLoading}
              />
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setApplyOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !loanType || !branch || !tenure}>
                  {isLoading ? 'Applying...' : 'Apply for Loan'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Repayment Modal */}
        <Modal isOpen={repaymentOpen} onClose={() => setRepaymentOpen(false)}>
          <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Make Repayment</h2>
                <p className="text-gray-600">Select an account to pay your monthly EMI</p>
              </div>
            </div>
            
            {selectedLoan && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Loan Type:</span>
                    <span className="ml-2 font-medium">{safeFormatString(selectedLoan.loanType).replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Outstanding:</span>
                    <span className="ml-2 font-medium">{safeFormatCurrency(selectedLoan.outstandingAmount)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Monthly EMI:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {isClient ? safeFormatCurrency(calculatedEMI) : 'Calculating...'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Interest Rate:</span>
                    <span className="ml-2 font-medium">{selectedLoan.interestRate || 0}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Select
                label="Select Account"
                value={selectedAccount}
                onChange={setSelectedAccount}
                options={activeAccounts.map((account: any) => ({
                  value: account,
                  label: `${account.accountNumber || 'N/A'} - ${account.accountType || 'N/A'} (${safeFormatCurrency(account.balance)})`
                }))}
                disabled={isRepaymentLoading}
              />

              {selectedAccount && selectedLoan && isClient && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EMI Amount:</span>
                      <span className="font-medium text-green-600">{safeFormatCurrency(calculatedEMI)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Balance:</span>
                      <span className="font-medium">{safeFormatCurrency(selectedAccount.value.balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining Balance:</span>
                      <span className={`font-medium ${(selectedAccount.value.balance || 0) - calculatedEMI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {safeFormatCurrency((selectedAccount.value.balance || 0) - calculatedEMI)}
                      </span>
                    </div>
                  </div>
                  {/* Debug info - remove this after fixing */}
                  {/* <div className="mt-4 p-2 bg-yellow-100 rounded text-xs">
                    <p>Debug Info:</p>
                    <p>Raw Balance: {JSON.stringify(selectedAccount.value.balance)}</p>
                    <p>Balance Type: {typeof selectedAccount.value.balance}</p>
                    <p>Calculated EMI: {calculatedEMI}</p>
                    <p>Remaining Calc: {(selectedAccount.value.balance || 0) - calculatedEMI}</p>
                  </div> */}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setRepaymentOpen(false)} disabled={isRepaymentLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRepaymentSubmit}
                  disabled={isRepaymentLoading || !selectedAccount || calculatedEMI <= 0 || (selectedAccount && (selectedAccount.value.balance || 0) < calculatedEMI)}
                >
                  {isRepaymentLoading ? 'Processing...' : 'Pay EMI'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Repayment History Modal */}
        <Modal isOpen={repaymentHistoryOpen} onClose={() => setRepaymentHistoryOpen(false)}>
        <div className="p-8 mx-auto ">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <History className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Repayment History</h2>
                <p className="text-gray-600">View your loan repayment history</p>
              </div>
            </div>
            {selectedLoanForHistory && (
              <RepaymentHistory 
                repayments={repayments} 
                loanType={selectedLoanForHistory.loanType}
                loanId={selectedLoanForHistory.loanAccountId}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LoansPage;