'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { CreditCard, ArrowRightLeft, AlertCircle } from 'lucide-react'

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
        const verifiedAccounts = accountsRes.data.filter((acc: any) => acc.status === "VERIFIED")

        // Fetch transactions for each verified account
        const allTransactions: any[] = []
        for (const acc of verifiedAccounts) {
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <AlertCircle className="text-red-500 mb-4" size={40} />
        <p className="text-lg text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-xl">
            <ArrowRightLeft className="text-blue-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        </div>
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-6">Your recent transactions will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx.transactionId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold">
                      {tx.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {tx.senderAccount?.accountHolderName
                        ? `${tx.senderAccount.accountHolderName} (${tx.senderAccount.accountNumber})`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {tx.receiverAccount?.accountHolderName
                        ? `${tx.receiverAccount.accountHolderName} (${tx.receiverAccount.accountNumber})`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistoryPage
