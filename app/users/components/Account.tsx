import React, { useState } from 'react'
import { CreditCard, Wallet, Eye, EyeOff, Building2, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Account {
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

const Account = ({ account }: { account: Account }) => {
    const [showBalance, setShowBalance] = useState(false);

    const parseAndFormatDate = (dateString: string) => {
        try {
            // First try the normal Date constructor
            let date = new Date(dateString);

            // If that fails and it's an ISO string, try manual parsing
            if (isNaN(date.getTime()) && typeof dateString === 'string') {
                // Remove the timezone and milliseconds for simpler parsing
                const cleanDateString = dateString.replace(/\.\d{3}\+\d{2}:\d{2}$/, '').replace('T', ' ');
                date = new Date(cleanDateString);
            }

            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusConfig = () => {
        switch (account.status) {
            case 'VERIFIED':
                return {
                    color: 'text-green-700',
                    bg: 'bg-green-100',
                    icon: CheckCircle,
                    text: 'Active'
                };
            case 'UNVERIFIED':
                return {
                    color: 'text-yellow-700',
                    bg: 'bg-yellow-100',
                    icon: Clock,
                    text: 'Pending'
                };
            case 'BLOCKED':
                return {
                    color: 'text-red-700',
                    bg: 'bg-red-100',
                    icon: XCircle,
                    text: 'Blocked'
                };
            default:
                return {
                    color: 'text-gray-700',
                    bg: 'bg-gray-100',
                    icon: Clock,
                    text: 'Unknown'
                };
        }
    };

    const getAccountTypeConfig = () => {
        switch (account.accountType) {
            case 'SAVINGS':
                return {
                    color: 'text-green-600',
                    bg: 'bg-gradient-to-br from-green-400 to-green-600',
                    icon: Wallet,
                    label: 'Savings Account'
                };
            case 'CURRENT':
                return {
                    color: 'text-blue-600',
                    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
                    icon: CreditCard,
                    label: 'Current Account'
                };
            default:
                return {
                    color: 'text-purple-600',
                    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
                    icon: CreditCard,
                    label: account.accountType
                };
        }
    };

    const statusConfig = getStatusConfig();
    const accountTypeConfig = getAccountTypeConfig();
    const StatusIcon = statusConfig.icon;
    const AccountIcon = accountTypeConfig.icon;

    const formatAccountNumber = (accountNumber: string) => {
        return `••••••${accountNumber.slice(-4)}`;
    };

    const formatBalance = (balance: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(balance);
    };

    return (
        <div className='relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group'>
            {/* Gradient Header */}
            <div className={`${accountTypeConfig.bg} p-6 text-white relative`}>
                <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16'></div>
                <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12'></div>

                <div className='relative z-10'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                                <AccountIcon size={24} className='text-white' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-lg'>{accountTypeConfig.label}</h3>
                                <p className='text-white/80 text-sm'>Account No: {formatAccountNumber(account.accountNumber)}</p>
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-white/80 text-sm mb-1'>Available Balance</p>
                            <div className='flex items-center gap-2'>
                                <p className='text-2xl font-bold'>
                                    {showBalance ? formatBalance(account.balance) : '••••••'}
                                </p>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className='p-1 hover:bg-white/20 rounded-lg transition-colors'
                                >
                                    {showBalance ?
                                        <EyeOff size={18} className='text-white/80' /> :
                                        <Eye size={18} className='text-white/80' />
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig.bg} backdrop-blur-sm w-fit mt-4`}>
                        <StatusIcon size={14} className={statusConfig.color} />
                        <span className={`text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.text}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className='p-6 space-y-4'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gray-100 rounded-lg'>
                        <Building2 size={16} className='text-gray-600' />
                    </div>
                    <div className='flex-1'>
                        {/* <p className='text-sm text-gray-600'>Branch</p> */}
                        <p className='font-medium text-gray-900'>{account.branch.address}</p>
                    </div>
                    <div className='text-right'>
                        <p className='text-xs text-gray-500'>Account ID</p>
                        <p className='text-sm font-mono font-medium text-gray-700'>#{account.accountId}</p>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <p className='text-sm text-gray-600 mb-1'>IFSC Code</p>
                        <p className='font-mono text-sm font-medium text-gray-900'>{account.branch.ifscCode}</p>
                    </div>
                    <div>
                        <p className='text-sm text-gray-600 mb-1'>Account Holder</p>
                        <p className='text-sm font-medium text-gray-900 truncate'>{account.accountHolderName}</p>
                    </div>
                </div>

                {account.accountType === 'CURRENT' && account.overdraftLimit > 0 && (
                    <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-blue-700 font-medium'>Overdraft Limit</p>
                                <p className='text-lg font-bold text-blue-900'>{formatBalance(account.overdraftLimit)}</p>
                            </div>
                            <div className='p-2 bg-blue-100 rounded-lg'>
                                <CreditCard size={20} className='text-blue-600' />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hover Effect Overlay */}
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 rounded-2xl'></div>
        </div>
    )
}

export default Account