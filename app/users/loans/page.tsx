'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/inputs/Input';
import Select from '../../components/inputs/Select';
import LoanCard from '../components/LoanCard';
import { FieldValues, useForm } from 'react-hook-form';
import { Plus, Banknote } from 'lucide-react';

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

const LoansPage = () => {
  const { data: session, status } = useSession();
  const [loans, setLoans] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loanType, setLoanType] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tenure, setTenure] = useState<any>(null);
  const [interestRate, setInterestRate] = useState<number | null>(null);

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
        console.log("loan", loans);
      } catch (err: any) {
        setError('Failed to fetch loans');
      } finally {
        setIsLoading(false);
      }
    }
    if (status === 'authenticated') fetchLoans();
  }, [status, applyOpen]);

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

  // Handle loan application
  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    setError(null);
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
              <Button onClick={() => setApplyOpen(true)}>
                <Plus size={20} /> Apply for Loan
              </Button>
            </div>
          </div>
        </div>
        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {/* Loans List */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : loans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan: any) => (
              <LoanCard key={loan.loan_account_id} loan={loan} />
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
      </div>
    </div>
  );
};

export default LoansPage;