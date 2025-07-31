'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { CreditCard, ArrowRightLeft, AlertCircle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Calendar, IndianRupee } from 'lucide-react'

interface Transaction {
  transactionId: number
  type: string
  amount: number
  timestamp: string
  senderAccount?: {
    accountNumber: string
    accountHolderName: string
  }
  receiverAccount?: {
    accountNumber: string
    accountHolderName: string
  }
  description?: string
}

const TransactionHistoryPage = () => {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userAccountNumbers, setUserAccountNumbers] = useState<string[]>([])
  const [verifiedAccounts, setVerifiedAccounts] = useState<any[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const username = localStorage.getItem('username')
        const token = localStorage.getItem('token')
        if (!username || !token) {
          setError('User not authenticated')
          setIsLoading(false)
          return
        }
        // Get userId
        const userRes = await axios.get(`http://localhost:8080/users/username/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userId = userRes.data.userId

        // Get all accounts for the user
        const accountsRes = await axios.get(`http://localhost:8080/accounts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const verified = accountsRes.data.filter((acc: any) => acc.status === "VERIFIED")
        setUserAccountNumbers(verified.map((acc: any) => acc.accountNumber))
        setVerifiedAccounts(verified)

        // Fetch transactions for each verified account
        const allTransactions: any[] = []
        for (const acc of verified) {
          const txRes = await axios.get(`http://localhost:8080/api/transactions/account/${acc.accountId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const txs = Array.isArray(txRes.data) ? txRes.data : [txRes.data]
          allTransactions.push(...txs)
        }

        // Optional: sort by timestamp descending
        allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setTransactions(allTransactions)
      } catch (err: any) {
        setError('Failed to fetch transaction history')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  // Calculate total balance
  const totalBalance = verifiedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)

  const getTransactionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'TRANSFER':
        return <ArrowRightLeft className="text-blue-500" size={20} />
      case 'DEPOSIT':
        return <TrendingUp className="text-green-500" size={20} />
      case 'WITHDRAWAL':
        return <TrendingDown className="text-red-500" size={20} />
      default:
        return <CreditCard className="text-gray-500" size={20} />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'TRANSFER':
        return 'bg-blue-50 border-blue-200'
      case 'DEPOSIT':
        return 'bg-green-50 border-green-200'
      case 'WITHDRAWAL':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-red-100 rounded-full mb-4">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <ArrowRightLeft className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Transaction History
              </h1>
              <p className="text-gray-600 mt-1">View all your account transactions</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalBalance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <IndianRupee className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Latest Transaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.length > 0 ? formatDate(transactions[0].timestamp).date : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CreditCard className="text-gray-400" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No transactions yet</h3>
            <p className="text-gray-600 text-lg mb-6">Your recent transactions will appear here once you start banking.</p>
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
              <ArrowUpRight size={16} />
              <span>Start your first transaction</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const { date, time } = formatDate(tx.timestamp)
              // Determine if the transaction is incoming or outgoing for the user
              const isReceived = tx.receiverAccount?.accountNumber ? userAccountNumbers.includes(tx.receiverAccount.accountNumber) : false
              const isSent = tx.senderAccount?.accountNumber ? userAccountNumbers.includes(tx.senderAccount.accountNumber) : false
              return (
                <div 
                  key={tx.transactionId} 
                  className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${getTransactionColor(tx.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                        {getTransactionIcon(tx.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {tx.type.toLowerCase()}
                          </h3>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            #{tx.transactionId}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>•</span>
                            <span>{time}</span>
                          </div>
                        </div>
                        
                        {/* Account Details */}
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          {tx.senderAccount && (
                            <div className="flex items-center gap-2">
                              <ArrowDownLeft size={14} className="text-red-500" />
                              <span className="text-gray-700">
                                From: <span className="font-medium">{tx.senderAccount.accountHolderName}</span>
                                <span className="text-gray-500 ml-1">({tx.senderAccount.accountNumber})</span>
                              </span>
                            </div>
                          )}
                          
                          {tx.receiverAccount && (
                            <div className="flex items-center gap-2">
                              <ArrowUpRight size={14} className="text-green-500" />
                              <span className="text-gray-700">
                                To: <span className="font-medium">{tx.receiverAccount.accountHolderName}</span>
                                <span className="text-gray-500 ml-1">({tx.receiverAccount.accountNumber})</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isReceived ? 'text-green-600' : isSent ? 'text-red-600' : 'text-gray-900'}`}>
                        {isReceived ? '+' : isSent ? '-' : ''}₹{tx.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {isReceived ? 'Received' : isSent ? 'Sent' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistoryPage
