'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { FieldValues, useForm } from 'react-hook-form'
import Input from '../../components/inputs/Input'
import Select from '../../components/inputs/Select'
import { ArrowRightLeft, Send, Wallet, AlertCircle, CheckCircle, CreditCard, User, Hash, X } from 'lucide-react'
import axios from 'axios'

const TransferPage = () => {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<AccountType[]>([])
  const [selectedSenderAccount, setSelectedSenderAccount] = useState<AccountType | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [transferError, setTransferError] = useState('')
  const [transferDetails, setTransferDetails] = useState<any>(null)

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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      senderAccountId: '',
      receiverAccountNumber: '',
      amount: '',
      description: ''
    }
  })

  const watchAmount = watch('amount')
  const watchSenderAccountId = watch('senderAccountId')

  useEffect(() => {
    async function getAllAccounts() {
      try {
        const res = await axios.get("http://localhost:8080/accounts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        const currentUserAccounts = res.data.filter((account: any) => 
          account.user.username === localStorage.getItem('username') && 
          account.status === 'VERIFIED'
        );
        setAccounts(currentUserAccounts);
        console.log('Verified Accounts:', currentUserAccounts);
      } catch (error) {
        console.log('Error fetching accounts:', error);
        setTransferError('Failed to fetch accounts. Please try again.');
      }
    }

    getAllAccounts();
  }, [])

  useEffect(() => {
    if (watchSenderAccountId) {
      const account = accounts.find(acc => acc.accountId.toString() === watchSenderAccountId);
      setSelectedSenderAccount(account || null);
    }
  }, [watchSenderAccountId, accounts])

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    setTransferError('');
    setShowSuccessModal(false);
    setShowErrorModal(false);

    try {
      // Validate amount
      const amount = parseFloat(data.amount);
      if (!amount || amount <= 0) {
        setTransferError('Please enter a valid amount');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // Check balance
      if (selectedSenderAccount && amount > selectedSenderAccount.balance) {
        setTransferError('Insufficient balance in sender account');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // Find receiver account
      const allAccountsRes = await axios.get("http://localhost:8080/accounts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const receiverAccount = allAccountsRes.data.find((account: any) => 
        account.accountNumber === data.receiverAccountNumber
      );

      if (!receiverAccount) {
        setTransferError('Receiver account not found. Please check the account number.');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      if (receiverAccount.accountId === selectedSenderAccount?.accountId) {
        setTransferError('Cannot transfer to the same account');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // Prepare transaction data
      const transactionData = {
        type: "TRANSFER",
        amount: amount,
        timestamp: new Date().toISOString(),
        senderAccount: {
          accountId: selectedSenderAccount?.accountId
        },
        receiverAccount: {
          accountId: receiverAccount.accountId
        },
        account: {
          accountId: selectedSenderAccount?.accountId
        }
      };

      console.log('Transaction Data:', transactionData);

      // Make the transfer
      const response = await axios.post("http://localhost:8080/api/transactions", transactionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Transfer Response:', response.data);
      
      // Set transfer details for success modal
      setTransferDetails({
        amount: amount,
        senderAccount: selectedSenderAccount,
        receiverAccount: receiverAccount,
        transactionId: response.data.transactionId || 'N/A',
        timestamp: new Date().toLocaleString()
      });
      
      setShowSuccessModal(true);
      reset();
      setSelectedSenderAccount(null);

    } catch (error: any) {
      console.log('Transfer Error:', error);
      setTransferError(error.response?.data?.message || 'Transfer failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }

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
        <div className='max-w-4xl mx-auto p-6'>
          {/* Header Section */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <ArrowRightLeft className='text-blue-600' size={28} />
              </div>
              <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  Transfer Money
                </h1>
                <p className='text-gray-600 text-lg'>Send money securely between accounts</p>
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6'>
              <div className='flex items-center gap-3'>
                <Send className='text-white' size={24} />
                <h2 className='text-2xl font-bold text-white'>New Transfer</h2>
              </div>
            </div>

            <div className='p-8'>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                {/* Sender Account Selection */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <User className='text-gray-600' size={20} />
                    <label className='text-lg font-semibold text-gray-900'>From Account</label>
                  </div>
                  
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <Select
                      value={undefined}
                      onChange={(value) => {
                        reset({ ...watch(), senderAccountId: value.value });
                      }}
                      options={accounts.map(account => ({
                        value: account.accountId.toString(),
                        label: `${account.accountNumber} - ${account.accountType} (₹${account.balance.toLocaleString()})`
                      }))}
                      disabled={isLoading || accounts.length === 0}
                      label={accounts.length === 0 ? "No verified accounts available" : "Select sender account"}
                    />
                    
                    {selectedSenderAccount && (
                      <div className='mt-4 p-4 bg-white rounded-lg border border-gray-200'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-semibold text-gray-900'>{selectedSenderAccount.accountHolderName}</p>
                            <p className='text-gray-600'>{selectedSenderAccount.accountNumber}</p>
                            <p className='text-sm text-gray-500'>{selectedSenderAccount.accountType} Account</p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-600'>Available Balance</p>
                            <p className='text-2xl font-bold text-green-600'>₹{selectedSenderAccount.balance.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receiver Account */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Hash className='text-gray-600' size={20} />
                    <label className='text-lg font-semibold text-gray-900'>To Account</label>
                  </div>
                  
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <Input
                      id="receiverAccountNumber"
                      label="Receiver Account Number"
                      register={register}
                      errors={errors}
                      disabled={isLoading}
                      required
                      placeholder="Enter 10-digit account number"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Wallet className='text-gray-600' size={20} />
                    <label className='text-lg font-semibold text-gray-900'>Amount</label>
                  </div>
                  
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <Input
                      id="amount"
                      label="Transfer Amount (₹)"
                      type="number"
                      register={register}
                      errors={errors}
                      disabled={isLoading}
                      required
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                    />
                    
                    {watchAmount && selectedSenderAccount && (
                      <div className='mt-3 p-3 bg-white rounded-lg border border-gray-200'>
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-gray-600'>Transfer Amount:</span>
                          <span className='font-semibold'>₹{parseFloat(watchAmount).toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between items-center text-sm mt-1'>
                          <span className='text-gray-600'>Remaining Balance:</span>
                          <span className={`font-semibold ${
                            (selectedSenderAccount.balance - parseFloat(watchAmount)) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ₹{(selectedSenderAccount.balance - parseFloat(watchAmount || '0')).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className='space-y-4'>
                  <label className='text-lg font-semibold text-gray-900'>Description (Optional)</label>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <Input
                      id="description"
                      label="Transfer Description"
                      register={register}
                      errors={errors}
                      disabled={isLoading}
                      placeholder="What's this transfer for?"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className='pt-6 border-t border-gray-200'>
                  <Button
                    type="submit"
                    disabled={isLoading || !selectedSenderAccount || accounts.length === 0}
                    // todo
                    // className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing Transfer...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Send size={20} />
                        Transfer Money
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Security Notice */}
              <div className='mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200'>
                <div className='flex items-start gap-3'>
                  <CreditCard className='text-blue-600 mt-1' size={20} />
                  <div>
                    <h4 className='font-semibold text-blue-900 mb-1'>Security Notice</h4>
                    <ul className='text-sm text-blue-800 space-y-1'>
                      <li>• Verify the receiver account number before proceeding</li>
                      <li>• Transfers are processed immediately and cannot be reversed</li>
                      <li>• Only verified accounts can send money</li>
                      <li>• Keep your transaction details safe for future reference</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Modal */}
          <Modal
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              window.location.reload(); // Refresh to show updated balances
            }}
          >
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transfer Successful!</h3>
              <p className="text-gray-600 mb-6">Your money has been transferred successfully.</p>
              
              {transferDetails && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-4">Transaction Details</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600">₹{transferDetails.amount?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">{transferDetails.senderAccount?.accountNumber}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium">{transferDetails.receiverAccount?.accountNumber}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receiver:</span>
                      <span className="font-medium">{transferDetails.receiverAccount?.accountHolderName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-blue-600">{transferDetails.transactionId}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{transferDetails.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    window.location.reload();
                  }}
                  // todo
                  // className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl transition-all duration-300"
                >
                  Done
                </Button>
              </div>
            </div>
          </Modal>

          {/* Error Modal */}
          <Modal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
          >
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transfer Failed</h3>
              <p className="text-gray-600 mb-6">{transferError}</p>
              
              <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-1" size={20} />
                  <div className="text-left">
                    <h4 className="font-semibold text-red-900 mb-1">What went wrong?</h4>
                    <p className="text-sm text-red-800">{transferError}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowErrorModal(false)}
                  // todo
                  // className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl transition-colors"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}

export default TransferPage
