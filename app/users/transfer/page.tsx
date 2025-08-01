// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useSession } from 'next-auth/react'
// import Button from '../../components/Button'
// import Modal from '../../components/Modal'
// import { FieldValues, useForm } from 'react-hook-form'
// import Input from '../../components/inputs/Input'
// import Select from '../../components/inputs/Select'
// import { ArrowRightLeft, Send, Wallet, AlertCircle, CheckCircle, CreditCard, User, Hash } from 'lucide-react'
// import axios from 'axios'

// const TransferPage = () => {
//   const { data: session, status } = useSession()
//   const [isLoading, setIsLoading] = useState(false)
//   const [accounts, setAccounts] = useState<AccountType[]>([])
//   const [selectedSenderAccount, setSelectedSenderAccount] = useState<AccountType | null>(null)
//   const [showSuccessModal, setShowSuccessModal] = useState(false)
//   const [showErrorModal, setShowErrorModal] = useState(false)
//   const [transferError, setTransferError] = useState('')
//   const [transferDetails, setTransferDetails] = useState<any>(null)

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
//     manager?: any;
//     name: string;
//     pan: string;
//     password?: any;
//     phone: string;
//   }

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors }
//   } = useForm<FieldValues>({
//     defaultValues: {
//       senderAccountId: '',
//       receiverAccountNumber: '',
//       amount: '',
//       description: ''
//     }
//   })

//   const watchAmount = watch('amount')
//   const watchSenderAccountId = watch('senderAccountId')

//   useEffect(() => {
//     async function getAllAccounts() {
//       try {
//         const res = await axios.get("http://localhost:8080/accounts", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         })
//         const currentUserAccounts = res.data.filter((account: any) =>
//           account.user.username === localStorage.getItem('username') &&
//           account.status === 'VERIFIED'
//         );
//         setAccounts(currentUserAccounts);
//       } catch (error) {
//         setTransferError('Failed to fetch accounts. Please try again.');
//       }
//     }
//     getAllAccounts();
//   }, [])

//   useEffect(() => {
//     if (watchSenderAccountId) {
//       const account = accounts.find(acc => acc.accountId.toString() === watchSenderAccountId);
//       setSelectedSenderAccount(account || null);
//     }
//   }, [watchSenderAccountId, accounts])

//   const onSubmit = async (data: FieldValues) => {
//     setIsLoading(true);
//     setTransferError('');
//     setShowSuccessModal(false);
//     setShowErrorModal(false);

//     try {
//       const amount = parseFloat(data.amount);
//       if (!amount || amount <= 0) {
//         setTransferError('Please enter a valid amount');
//         setShowErrorModal(true);
//         setIsLoading(false);
//         return;
//       }
//       if (selectedSenderAccount && amount > selectedSenderAccount.balance) {
//         setTransferError('Insufficient balance in sender account');
//         setShowErrorModal(true);
//         setIsLoading(false);
//         return;
//       }
//       const allAccountsRes = await axios.get("http://localhost:8080/accounts", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       const receiverAccount = allAccountsRes.data.find((account: any) =>
//         account.accountNumber === data.receiverAccountNumber
//       );
//       if (!receiverAccount) {
//         setTransferError('Receiver account not found. Please check the account number.');
//         setShowErrorModal(true);
//         setIsLoading(false);
//         return;
//       }
//       if (receiverAccount.accountId === selectedSenderAccount?.accountId) {
//         setTransferError('Cannot transfer to the same account');
//         setShowErrorModal(true);
//         setIsLoading(false);
//         return;
//       }
//       const transactionData = {
//         type: "TRANSFER",
//         amount: amount,
//         timestamp: new Date().toISOString(),
//         senderAccount: {
//           accountId: selectedSenderAccount?.accountId
//         },
//         receiverAccount: {
//           accountId: receiverAccount.accountId
//         },
//         account: {
//           accountId: selectedSenderAccount?.accountId
//         }
//       };
//       const response = await axios.post("http://localhost:8080/api/transactions", transactionData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       setTransferDetails({
//         amount: amount,
//         senderAccount: selectedSenderAccount,
//         receiverAccount: receiverAccount,
//         transactionId: response.data.transactionId || 'N/A',
//         timestamp: new Date().toLocaleString()
//       });
//       setShowSuccessModal(true);
//       reset();
//       setSelectedSenderAccount(null);
//     } catch (error: any) {
//       setTransferError(error.response?.data?.message || 'Transfer failed. Please try again.');
//       setShowErrorModal(true);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
//           <p className="text-gray-600 font-medium">Loading transfer page...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       {/* Background decorative elements */}
//       <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//       <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//       <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
//       {session && (
//         <div className="max-w-4xl mx-auto p-6 relative z-10">
//           {/* Header */}
//           <div className="mb-10">
//             <div className="flex items-center gap-6 mb-6">
//               <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-xl">
//                 <ArrowRightLeft className="text-white" size={32} />
//               </div>
//               <div>
//                 <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
//                   Transfer Money
//                 </h1>
//                 <p className="text-gray-600 text-lg">Send money securely between your accounts with instant processing</p>
//               </div>
//             </div>
//           </div>

//           {/* Transfer Form */}
//           <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
//             {/* Decorative background pattern */}
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50"></div>
//             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
//             <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            
//             <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 relative">
//               <div className="absolute inset-0 bg-black/10"></div>
//               <div className="relative z-10 flex items-center gap-4">
//                 <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
//                   <Send className="text-white" size={32} />
//                 </div>
//                 <div>
//                   <h2 className="text-4xl font-bold text-white mb-2">New Transfer</h2>
//                   <p className="text-blue-100 text-lg">Complete the form below to transfer funds securely</p>
//                 </div>
//               </div>
//             </div>
//             <div className="p-12 relative z-10">
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
//                 {/* Sender Account */}
//                 <div className="space-y-8">
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
//                       <User className="text-white" size={28} />
//                     </div>
//                     <div>
//                       <label className="text-2xl font-bold text-gray-900">From Account</label>
//                       <p className="text-gray-500 text-base">Select the account to transfer from</p>
//                     </div>
//                   </div>
//                   <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-blue-200 shadow-xl">
//                     <div className="mb-6">
//                       <Select
//                         value={undefined}
//                         onChange={(value) => {
//                           reset({ ...watch(), senderAccountId: value.value });
//                         }}
//                         options={accounts.map(account => ({
//                           value: account.accountId.toString(),
//                           label: `${account.accountNumber} - ${account.accountType} (₹${account.balance.toLocaleString()})`
//                         }))}
//                         disabled={isLoading || accounts.length === 0}
//                         label={accounts.length === 0 ? "No verified accounts available" : "Select sender account"}
//                       />
//                     </div>
//                     {selectedSenderAccount && (
//                       <div className="bg-white rounded-3xl border border-blue-200 shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
//                         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="text-2xl font-bold">{selectedSenderAccount.accountHolderName}</p>
//                               <p className="text-blue-100 text-lg">{selectedSenderAccount.accountNumber}</p>
//                             </div>
//                             <div className="text-right">
//                               <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
//                                 <span className="text-sm font-medium">{selectedSenderAccount.accountType} Account</span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="p-6">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="text-sm text-gray-600 mb-2">Available Balance</p>
//                               <p className="text-4xl font-bold text-green-600">₹{selectedSenderAccount.balance.toLocaleString()}</p>
//                             </div>
//                             <div className="text-right">
//                               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
//                                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
//                                   <span className="text-white font-bold text-lg">100%</span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
//                             <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Receiver Account */}
//                 <div className="space-y-8">
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
//                       <Hash className="text-white" size={28} />
//                     </div>
//                     <div>
//                       <label className="text-2xl font-bold text-gray-900">To Account</label>
//                       <p className="text-gray-500 text-base">Enter the recipient's account number</p>
//                     </div>
//                   </div>
//                   <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border border-green-200 shadow-xl">
//                     <div className="relative">
//                       <Input
//                         id="receiverAccountNumber"
//                         label="Receiver Account Number"
//                         register={register}
//                         errors={errors}
//                         disabled={isLoading}
//                         required
//                         placeholder="Enter 10-digit account number"
//                       />
//                       <div className="absolute top-4 right-4">
//                         <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                           <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="mt-6 p-4 bg-white rounded-2xl border border-green-200">
//                       <div className="flex items-center gap-3">
//                         <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                         <p className="text-sm text-green-700 font-medium">Enter a valid 10-digit account number</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                                 {/* Amount */}
//                 <div className="space-y-8">
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
//                       <Wallet className="text-white" size={28} />
//                     </div>
//                     <div>
//                       <label className="text-2xl font-bold text-gray-900">Amount</label>
//                       <p className="text-gray-500 text-base">Enter the amount you want to transfer</p>
//                     </div>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-8 border border-purple-200 shadow-xl">
//                     <div className="relative">
//                       <Input
//                         id="amount"
//                         label="Transfer Amount (₹)"
//                         type="number"
//                         register={register}
//                         errors={errors}
//                         disabled={isLoading}
//                         required
//                         placeholder="0.00"
//                         min="1"
//                         step="0.01"
//                       />
//                       <div className="absolute top-4 right-4">
//                         <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//                           <span className="text-purple-600 font-bold text-sm">₹</span>
//                         </div>
//                       </div>
//                     </div>
//                     {watchAmount && selectedSenderAccount && (
//                       <div className="mt-8 bg-white rounded-3xl border border-purple-200 shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
//                         <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="text-sm text-purple-100 mb-1">Transfer Amount</p>
//                               <p className="text-3xl font-bold">₹{parseFloat(watchAmount).toLocaleString()}</p>
//                             </div>
//                             <div className="text-right">
//                               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                                 <span className="text-white font-bold text-lg">
//                                   {Math.round((parseFloat(watchAmount || '0') / selectedSenderAccount.balance) * 100)}%
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="p-6">
//                           <div className="grid grid-cols-2 gap-6">
//                             <div className="text-center">
//                               <p className="text-sm text-gray-600 mb-2">Remaining Balance</p>
//                               <p className={`text-2xl font-bold ${
//                                 (selectedSenderAccount.balance - parseFloat(watchAmount)) >= 0
//                                   ? 'text-green-600'
//                                   : 'text-red-600'
//                               }`}>
//                                 ₹{(selectedSenderAccount.balance - parseFloat(watchAmount || '0')).toLocaleString()}
//                               </p>
//                             </div>
//                             <div className="text-center">
//                               <p className="text-sm text-gray-600 mb-2">Balance Used</p>
//                               <p className="text-2xl font-bold text-purple-600">
//                                 {Math.round((parseFloat(watchAmount || '0') / selectedSenderAccount.balance) * 100)}%
//                               </p>
//                             </div>
//                           </div>
//                           <div className="mt-6">
//                             <div className="flex justify-between text-sm text-gray-500 mb-2">
//                               <span>0%</span>
//                               <span>Balance Usage</span>
//                               <span>100%</span>
//                             </div>
//                             <div className="w-full bg-gray-200 rounded-full h-4">
//                               <div 
//                                 className={`h-4 rounded-full transition-all duration-700 ease-out ${
//                                   (selectedSenderAccount.balance - parseFloat(watchAmount)) >= 0
//                                     ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600'
//                                     : 'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
//                                 }`}
//                                 style={{ 
//                                   width: `${Math.min(100, (parseFloat(watchAmount || '0') / selectedSenderAccount.balance) * 100)}%` 
//                                 }}
//                               ></div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-8">
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
//                       <AlertCircle className="text-white" size={28} />
//                     </div>
//                     <div>
//                       <label className="text-2xl font-bold text-gray-900">Description (Optional)</label>
//                       <p className="text-gray-500 text-base">Add a note to remember this transfer</p>
//                     </div>
//                   </div>
//                   <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-8 border border-orange-200 shadow-xl">
//                     <div className="relative">
//                       <Input
//                         id="description"
//                         label="Transfer Description"
//                         register={register}
//                         errors={errors}
//                         disabled={isLoading}
//                         placeholder="What's this transfer for?"
//                       />
//                       <div className="absolute top-4 right-4">
//                         <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
//                           <span className="text-orange-600 font-bold text-sm">📝</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="mt-6 p-4 bg-white rounded-2xl border border-orange-200">
//                       <div className="flex items-center gap-3">
//                         <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
//                         <p className="text-sm text-orange-700 font-medium">Optional: Add a description to help you remember this transfer</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                                                                    {/* Transfer Summary */}
//                   {watchAmount && selectedSenderAccount && watch('receiverAccountNumber') && (
//                     <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-indigo-200 shadow-xl transform hover:scale-105 transition-all duration-300">
//                       <div className="flex items-center gap-4 mb-6">
//                         <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
//                           <CheckCircle className="text-white" size={24} />
//                         </div>
//                         <div>
//                           <h3 className="text-2xl font-bold text-indigo-900">Transfer Summary</h3>
//                           <p className="text-indigo-600 text-base">Review your transfer details</p>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-lg transform hover:scale-105 transition-all duration-200">
//                           <div className="flex items-center gap-3 mb-3">
//                             <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//                             <div className="text-sm text-gray-600 font-medium">From Account</div>
//                           </div>
//                           <div className="font-bold text-gray-900 text-lg">{selectedSenderAccount.accountNumber}</div>
//                           <div className="text-sm text-gray-500 mt-1">{selectedSenderAccount.accountHolderName}</div>
//                         </div>
//                         <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-lg transform hover:scale-105 transition-all duration-200">
//                           <div className="flex items-center gap-3 mb-3">
//                             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                             <div className="text-sm text-gray-600 font-medium">To Account</div>
//                           </div>
//                           <div className="font-bold text-gray-900 text-lg">{watch('receiverAccountNumber')}</div>
//                           <div className="text-sm text-gray-500 mt-1">Recipient Account</div>
//                         </div>
//                         <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-lg transform hover:scale-105 transition-all duration-200">
//                           <div className="flex items-center gap-3 mb-3">
//                             <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
//                             <div className="text-sm text-gray-600 font-medium">Amount</div>
//                           </div>
//                           <div className="font-bold text-indigo-600 text-2xl">₹{parseFloat(watchAmount).toLocaleString()}</div>
//                           <div className="text-sm text-gray-500 mt-1">Transfer Amount</div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                                    {/* Submit Button */}
//                   <div className="pt-10 border-t border-gray-200">
//                     <div className="w-full">
//                       <Button
//                         type="submit"
//                         disabled={isLoading || !selectedSenderAccount || accounts.length === 0}
//                         className="w-full py-6 text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-2xl"
//                       >
//                         {isLoading ? (
//                           <div className="flex items-center justify-center gap-4">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//                             <span className="text-lg">Processing Transfer...</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center justify-center gap-4">
//                             <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
//                               <Send size={28} />
//                             </div>
//                             <span className="text-lg">Transfer Money</span>
//                           </div>
//                         )}
//                       </Button>
//                     </div>
//                   </div>
//               </form>

//               {/* Security Notice */}
//               <div className="mt-10 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 shadow-lg transform hover:scale-105 transition-all duration-300">
//                 <div className="flex items-start gap-4">
//                   <div className="p-3 bg-blue-100 rounded-2xl">
//                     <CreditCard className="text-blue-600" size={24} />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="text-xl font-bold text-blue-900 mb-3">Security Notice</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
//                         <span className="text-sm text-blue-800">Verify the receiver account number before proceeding</span>
//                       </div>
//                       <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
//                         <span className="text-sm text-blue-800">Transfers are processed immediately and cannot be reversed</span>
//                       </div>
//                       <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
//                         <span className="text-sm text-blue-800">Only verified accounts can send money</span>
//                       </div>
//                       <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
//                         <span className="text-sm text-blue-800">Keep your transaction details safe for future reference</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Success Modal */}
//           <Modal
//             isOpen={showSuccessModal}
//             onClose={() => {
//               setShowSuccessModal(false);
//               window.location.reload();
//             }}
//           >
//             <div className="p-10 text-center">
//               <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-8 shadow-lg">
//                 <CheckCircle className="h-10 w-10 text-green-600" />
//               </div>
//               <h3 className="text-3xl font-bold text-gray-900 mb-3">Transfer Successful!</h3>
//               <p className="text-gray-600 mb-8 text-lg">Your money has been transferred successfully.</p>
//               {transferDetails && (
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 mb-8 text-left border border-green-200 shadow-lg">
//                   <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     Transaction Details
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="bg-white rounded-2xl p-4 border border-green-200">
//                       <div className="text-sm text-gray-600 mb-1">Amount</div>
//                       <div className="text-2xl font-bold text-green-600">₹{transferDetails.amount?.toLocaleString()}</div>
//                     </div>
//                     <div className="bg-white rounded-2xl p-4 border border-green-200">
//                       <div className="text-sm text-gray-600 mb-1">Transaction ID</div>
//                       <div className="text-lg font-semibold text-blue-600">{transferDetails.transactionId}</div>
//                     </div>
//                     <div className="bg-white rounded-2xl p-4 border border-green-200">
//                       <div className="text-sm text-gray-600 mb-1">From Account</div>
//                       <div className="text-lg font-semibold text-gray-900">{transferDetails.senderAccount?.accountNumber}</div>
//                     </div>
//                     <div className="bg-white rounded-2xl p-4 border border-green-200">
//                       <div className="text-sm text-gray-600 mb-1">To Account</div>
//                       <div className="text-lg font-semibold text-gray-900">{transferDetails.receiverAccount?.accountNumber}</div>
//                     </div>
//                     <div className="bg-white rounded-2xl p-4 border border-green-200 md:col-span-2">
//                       <div className="text-sm text-gray-600 mb-1">Receiver Name</div>
//                       <div className="text-lg font-semibold text-gray-900">{transferDetails.receiverAccount?.accountHolderName}</div>
//                     </div>
//                     <div className="bg-white rounded-2xl p-4 border border-green-200 md:col-span-2">
//                       <div className="text-sm text-gray-600 mb-1">Date & Time</div>
//                       <div className="text-lg font-semibold text-gray-900">{transferDetails.timestamp}</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <Button
//                     onClick={() => {
//                       setShowSuccessModal(false);
//                       window.location.reload();
//                     }}
//                     className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
//                   >
//                     Done
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </Modal>

//           {/* Error Modal */}
//           <Modal
//             isOpen={showErrorModal}
//             onClose={() => setShowErrorModal(false)}
//           >
//             <div className="p-10 text-center">
//               <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 mb-8 shadow-lg">
//                 <AlertCircle className="h-10 w-10 text-red-600" />
//               </div>
//               <h3 className="text-3xl font-bold text-gray-900 mb-3">Transfer Failed</h3>
//               <p className="text-gray-600 mb-8 text-lg">{transferError}</p>
//               <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 mb-8 border border-red-200 shadow-lg">
//                 <div className="flex items-start gap-4">
//                   <div className="p-3 bg-red-100 rounded-2xl">
//                     <AlertCircle className="text-red-600" size={24} />
//                   </div>
//                   <div className="text-left flex-1">
//                     <h4 className="text-xl font-bold text-red-900 mb-3">What went wrong?</h4>
//                     <p className="text-red-800 leading-relaxed">{transferError}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <Button
//                     onClick={() => setShowErrorModal(false)}
//                     className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
//                   >
//                     Try Again
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </Modal>
//         </div>
//       )}
//     </div>
//   )
// }

// export default TransferPage

'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { FieldValues, useForm } from 'react-hook-form'
import Input from '../../components/inputs/Input'
import Select from '../../components/inputs/Select'
import { ArrowRightLeft, Send, Wallet, AlertCircle, CheckCircle, CreditCard, User, Hash } from 'lucide-react'
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
      } catch (error) {
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
      const amount = parseFloat(data.amount);
      if (!amount || amount <= 0) {
        setTransferError('Please enter a valid amount');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }
      if (selectedSenderAccount && amount > selectedSenderAccount.balance) {
        setTransferError('Insufficient balance in sender account');
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }
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
      const response = await axios.post("http://localhost:8080/api/transactions", transactionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
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
      setTransferError(error.response?.data?.message || 'Transfer failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading transfer page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {session && (
        <div className="max-w-3xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <ArrowRightLeft className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Transfer Money
                </h1>
                <p className="text-gray-600 mt-1">Send money securely between your accounts</p>
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center gap-3">
                <Send className="text-white" size={24} />
                <h2 className="text-2xl font-bold text-white">New Transfer</h2>
              </div>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Sender Account */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-600" size={20} />
                    <label className="text-lg font-semibold text-gray-900">From Account</label>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
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
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{selectedSenderAccount.accountHolderName}</p>
                            <p className="text-gray-600">{selectedSenderAccount.accountNumber}</p>
                            <p className="text-sm text-gray-500">{selectedSenderAccount.accountType} Account</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Available Balance</p>
                            <p className="text-2xl font-bold text-green-600">₹{selectedSenderAccount.balance.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receiver Account */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hash className="text-gray-600" size={20} />
                    <label className="text-lg font-semibold text-gray-900">To Account</label>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
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
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="text-gray-600" size={20} />
                    <label className="text-lg font-semibold text-gray-900">Amount</label>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
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
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Transfer Amount:</span>
                          <span className="font-semibold">₹{parseFloat(watchAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-gray-600">Remaining Balance:</span>
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
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-900">Description (Optional)</label>
                  <div className="bg-gray-50 rounded-xl p-4">
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
                <div className="pt-6 border-t border-gray-200">
                  <div className="w-full">
                    <Button
                      type="submit"
                      disabled={isLoading || !selectedSenderAccount || accounts.length === 0}
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
                </div>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <CreditCard className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Security Notice</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
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
              window.location.reload();
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
                <div className="flex-1">
                  <Button
                    onClick={() => {
                      setShowSuccessModal(false);
                      window.location.reload();
                    }}
                  >
                    Done
                  </Button>
                </div>
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
                <div className="flex-1">
                  <Button
                    onClick={() => setShowErrorModal(false)}
                  >
                    Try Again
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

export default TransferPage