'use client'

import React, { useEffect, useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { FieldValues, useForm } from 'react-hook-form'
import Input from '../components/inputs/Input'
import Select from '../components/inputs/Select'
import axios from 'axios'
import { 
  Building2, 
  Users, 
  Plus, 
  MapPin, 
  Hash, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Briefcase,
  Globe,
  Edit,
  CreditCard,
  BarChart3,
  AlertCircle,
  Calendar
} from 'lucide-react'

interface Branch {
  branchId: number;
  ifscCode: string;
  address: string;
}

interface Employee {
  userId: number;
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pan: string;
  createdAt: string;
  joinDate: string;
  branch: {
    branchId: number;
    ifscCode: string;
    address: string;
  };
  manager: any;
  active: boolean;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'employees' | 'loans'>('overview');
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [updateBranchOpen, setUpdateBranchOpen] = useState(false);
  const [updateEmployeeOpen, setUpdateEmployeeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [isUpdateBranchLoading, setIsUpdateBranchLoading] = useState(false);
  const [isUpdateEmployeeLoading, setIsUpdateEmployeeLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedEmployeeForUpdate, setSelectedEmployeeForUpdate] = useState<Employee | null>(null);
  const [selectedBranchForUpdate, setSelectedBranchForUpdate] = useState<Branch | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateDialogMessage, setUpdateDialogMessage] = useState('');
  const [updateDialogType, setUpdateDialogType] = useState<'success' | 'error'>('success');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      ifscCode: '',
      address: ''
    },
    mode: 'onChange'
  })

  const {
    register: registerEmployee,
    handleSubmit: handleSubmitEmployee,
    reset: resetEmployee,
    setValue: setEmployeeValue,
    formState: { errors: employeeErrors }
  } = useForm<FieldValues>({
    defaultValues: {
      username: '',
      password: '',
      role: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      pan: '',
      branch: null
    },
    mode: 'onChange'
  })

  const {
    register: registerUpdateBranch,
    handleSubmit: handleSubmitUpdateBranch,
    reset: resetUpdateBranch,
    setValue: setUpdateBranchValue,
    formState: { errors: updateBranchErrors }
  } = useForm<FieldValues>({
    defaultValues: {
      ifscCode: '',
      address: ''
    },
    mode: 'onChange'
  })

  const {
    register: registerUpdateEmployee,
    handleSubmit: handleSubmitUpdateEmployee,
    reset: resetUpdateEmployee,
    setValue: setUpdateEmployeeValue,
    formState: { errors: updateEmployeeErrors }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      pan: ''
    },
    mode: 'onChange'
  })

  // Fetch branches, employees, and loans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch branches
        const branchesResponse = await axios.get("http://localhost:8080/branches", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBranches(branchesResponse.data);

        // Fetch users
        const usersResponse = await axios.get("http://localhost:8080/users", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter employees (ROLE_MANAGER and ROLE_LOAN_OFFICER)
        const employeeUsers = usersResponse.data.filter((user: Employee) => 
          user.role === 'ROLE_MANAGER' || user.role === 'ROLE_LOAN_OFFICER'
        );
        setEmployees(employeeUsers);

        // Fetch loans
        try {
          const loansResponse = await axios.get("http://localhost:8080/api/loans", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setLoans(loansResponse.data);
        } catch (loanError) {
          console.log('Loans endpoint not available, setting empty array');
          setLoans([]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post("http://localhost:8080/branches/create", data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAddBranchOpen(false);
      reset();
      // Refresh branches list
      const response = await axios.get("http://localhost:8080/branches", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBranches(response.data);
    } catch (error) {
      console.error('Error creating branch:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmitEmployee = async (data: FieldValues) => {
    setIsEmployeeLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Combine form data with selected role and branch
      const requestData = {
        ...data,
        role: selectedRole,
        branch: selectedBranch
      };
      
      console.log('Sending employee data:', requestData);
      
      await axios.post("http://localhost:8080/api/auth/register", requestData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAddEmployeeOpen(false);
      resetEmployee();
      setSelectedRole('');
      setSelectedBranch(null);
      
      // Refresh employees list
      const usersResponse = await axios.get("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const employeeUsers = usersResponse.data.filter((user: Employee) => 
        user.role === 'ROLE_MANAGER' || user.role === 'ROLE_LOAN_OFFICER'
      );
      setEmployees(employeeUsers);
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setIsEmployeeLoading(false);
    }
  }

  const openUpdateBranchModal = (branch: Branch) => {
    setSelectedBranchForUpdate(branch);
    setUpdateBranchValue('ifscCode', branch.ifscCode);
    setUpdateBranchValue('address', branch.address);
    setUpdateBranchOpen(true);
  }

  const closeUpdateBranchModal = () => {
    setUpdateBranchOpen(false);
    setSelectedBranchForUpdate(null);
    resetUpdateBranch();
  }

  const onSubmitUpdateBranch = async (data: FieldValues) => {
    if (!selectedBranchForUpdate) return;
    
    setIsUpdateBranchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:8080/branches/${selectedBranchForUpdate.branchId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setBranches(prevBranches => 
        prevBranches.map(branch => 
          branch.branchId === selectedBranchForUpdate.branchId 
            ? { ...branch, ...data }
            : branch
        )
      );
      
      setUpdateDialogMessage('Branch updated successfully!');
      setUpdateDialogType('success');
      setShowUpdateDialog(true);
      closeUpdateBranchModal();
      
    } catch (error) {
      console.error('Error updating branch:', error);
      setUpdateDialogMessage('Failed to update branch. Please try again.');
      setUpdateDialogType('error');
      setShowUpdateDialog(true);
    } finally {
      setIsUpdateBranchLoading(false);
    }
  }

  const openUpdateEmployeeModal = (employee: Employee) => {
    setSelectedEmployeeForUpdate(employee);
    setUpdateEmployeeValue('name', employee.name);
    setUpdateEmployeeValue('email', employee.email);
    setUpdateEmployeeValue('phone', employee.phone);
    setUpdateEmployeeValue('address', employee.address);
    setUpdateEmployeeValue('pan', employee.pan);
    setUpdateEmployeeOpen(true);
  }

  const closeUpdateEmployeeModal = () => {
    setUpdateEmployeeOpen(false);
    setSelectedEmployeeForUpdate(null);
    resetUpdateEmployee();
  }

  const onSubmitUpdateEmployee = async (data: FieldValues) => {
    if (!selectedEmployeeForUpdate) return;
    
    setIsUpdateEmployeeLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:8080/users/${selectedEmployeeForUpdate.userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setEmployees(prevEmployees => 
        prevEmployees.map(employee => 
          employee.userId === selectedEmployeeForUpdate.userId 
            ? { ...employee, ...data }
            : employee
        )
      );
      
      setUpdateDialogMessage('Employee updated successfully!');
      setUpdateDialogType('success');
      setShowUpdateDialog(true);
      closeUpdateEmployeeModal();
      
    } catch (error) {
      console.error('Error updating employee:', error);
      setUpdateDialogMessage('Failed to update employee. Please try again.');
      setUpdateDialogType('error');
      setShowUpdateDialog(true);
    } finally {
      setIsUpdateEmployeeLoading(false);
    }
  }

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'ROLE_MANAGER':
        return {
          color: 'text-white',
          bg: 'bg-purple-400',
          icon: Shield,
          text: 'Manager'
        };
      case 'ROLE_LOAN_OFFICER':
        return {
          color: 'text-white',
          bg: 'bg-blue-400',
          icon: Briefcase,
          text: 'Loan Officer'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          icon: User,
          text: role.replace('ROLE_', '')
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <div className='max-w-7xl mx-auto p-6'>
                 {/* Header Section */}
         <div className='mb-8'>
           <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
             <div>
               <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                 Admin Dashboard
               </h1>
               <p className='text-gray-600 text-lg'>Manage branches, employees, and loans</p>
             </div>
             <div className='mt-4 md:mt-0 flex gap-3'>
               <Button
                 onClick={() => setAddEmployeeOpen(true)}
               >
                 <Users size={20} className="mr-2" />
                 Add Employee
               </Button>
               <Button
                 onClick={() => setAddBranchOpen(true)}
               >
                 <Plus size={20} className="mr-2" />
                 Add New Branch
               </Button>
             </div>
           </div>

           {/* Stats Cards */}
           <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
             <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
               <div className='flex items-center justify-between mb-4'>
                 <div className='p-3 bg-blue-100 rounded-xl'>
                   <Building2 className='text-blue-600' size={24} />
                 </div>
               </div>
               <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Branches</h3>
               <p className='text-3xl font-bold text-gray-900'>{branches.length}</p>
             </div>

             <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
               <div className='flex items-center justify-between mb-4'>
                 <div className='p-3 bg-purple-100 rounded-xl'>
                   <Users className='text-purple-600' size={24} />
                 </div>
               </div>
               <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Employees</h3>
               <p className='text-3xl font-bold text-gray-900'>{employees.length}</p>
             </div>

             <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
               <div className='flex items-center justify-between mb-4'>
                 <div className='p-3 bg-green-100 rounded-xl'>
                   <TrendingUp className='text-green-600' size={24} />
                 </div>
               </div>
               <h3 className='text-gray-600 text-sm font-medium mb-1'>Active Employees</h3>
               <p className='text-3xl font-bold text-gray-900'>
                 {employees.filter(emp => emp.active).length}
               </p>
             </div>

             <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
               <div className='flex items-center justify-between mb-4'>
                 <div className='p-3 bg-orange-100 rounded-xl'>
                   <CreditCard className='text-orange-600' size={24} />
                 </div>
               </div>
               <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Loans</h3>
               <p className='text-3xl font-bold text-gray-900'>{loans.length}</p>
             </div>
           </div>
         </div>

         {/* Tab Navigation */}
         <div className='mb-8'>
           <div className='flex space-x-1 bg-gray-100 p-1 rounded-xl'>
             <button
               onClick={() => setActiveTab('overview')}
               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                 activeTab === 'overview'
                   ? 'bg-white text-blue-600 shadow-sm'
                   : 'text-gray-600 hover:text-gray-900'
               }`}
             >
               <BarChart3 size={20} />
               Overview
             </button>
             <button
               onClick={() => setActiveTab('branches')}
               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                 activeTab === 'branches'
                   ? 'bg-white text-blue-600 shadow-sm'
                   : 'text-gray-600 hover:text-gray-900'
               }`}
             >
               <Building2 size={20} />
               Branches
             </button>
             <button
               onClick={() => setActiveTab('employees')}
               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                 activeTab === 'employees'
                   ? 'bg-white text-purple-600 shadow-sm'
                   : 'text-gray-600 hover:text-gray-900'
               }`}
             >
               <Users size={20} />
               Employees
             </button>
             <button
               onClick={() => setActiveTab('loans')}
               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                 activeTab === 'loans'
                   ? 'bg-white text-orange-600 shadow-sm'
                   : 'text-gray-600 hover:text-gray-900'
               }`}
             >
               <CreditCard size={20} />
               Loans
             </button>
           </div>
         </div>

         {/* Tab Content */}
         {activeTab === 'overview' && (
           <div className='space-y-8'>
             {/* Quick Actions */}
             <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
               <h3 className='text-xl font-bold text-gray-900 mb-4'>Quick Actions</h3>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                 <button
                   onClick={() => setAddBranchOpen(true)}
                   className='flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors'
                 >
                   <Building2 className='text-blue-600' size={24} />
                   <div className='text-left'>
                     <p className='font-semibold text-blue-900'>Add New Branch</p>
                     <p className='text-sm text-blue-700'>Create a new branch location</p>
                   </div>
                 </button>
                 <button
                   onClick={() => setAddEmployeeOpen(true)}
                   className='flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors'
                 >
                   <Users className='text-purple-600' size={24} />
                   <div className='text-left'>
                     <p className='font-semibold text-purple-900'>Add New Employee</p>
                     <p className='text-sm text-purple-700'>Create a new employee account</p>
                   </div>
                 </button>
               </div>
             </div>

             {/* Recent Activity */}
             <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
               <h3 className='text-xl font-bold text-gray-900 mb-4'>Recent Activity</h3>
               <div className='space-y-4'>
                 <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                   <div className='p-2 bg-blue-100 rounded-lg'>
                     <Building2 className='text-blue-600' size={16} />
                   </div>
                   <div className='flex-1'>
                     <p className='font-medium text-gray-900'>Branches Overview</p>
                     <p className='text-sm text-gray-600'>{branches.length} branches registered</p>
                   </div>
                 </div>
                 <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                   <div className='p-2 bg-purple-100 rounded-lg'>
                     <Users className='text-purple-600' size={16} />
                   </div>
                   <div className='flex-1'>
                     <p className='font-medium text-gray-900'>Employees Overview</p>
                     <p className='text-sm text-gray-600'>{employees.length} employees registered</p>
                   </div>
                 </div>
                 <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                   <div className='p-2 bg-orange-100 rounded-lg'>
                     <CreditCard className='text-orange-600' size={16} />
                   </div>
                   <div className='flex-1'>
                     <p className='font-medium text-gray-900'>Loans Overview</p>
                     <p className='text-sm text-gray-600'>{loans.length} loans in system</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {activeTab === 'branches' && (
           <div className='space-y-6'>
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-2 bg-blue-100 rounded-lg'>
                 <Building2 className='text-blue-600' size={24} />
               </div>
               <h2 className='text-2xl font-bold text-gray-900'>Branches</h2>
             </div>

             {branches.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {branches.map((branch) => (
                   <div key={branch.branchId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                     <div className='relative bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white rounded-xl mb-4'>
                       <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16'></div>
                       <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12'></div>
                       
                       <div className='relative z-10'>
                         <div className='flex items-center gap-3 mb-4'>
                           <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                             <Building2 size={24} className='text-white' />
                           </div>
                           <div>
                             <h3 className='font-semibold text-lg'>Branch #{branch.branchId}</h3>
                             <p className='text-white/80 text-sm'>IFSC: {branch.ifscCode}</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className='space-y-4'>
                       <div className='flex items-center gap-3'>
                         <div className='p-2 bg-gray-100 rounded-lg'>
                           <MapPin size={16} className='text-gray-600' />
                         </div>
                         <div className='flex-1'>
                           <p className='text-sm text-gray-600'>Location</p>
                           <p className='font-medium text-gray-900'>{branch.address}</p>
                         </div>
                       </div>

                       <div className='flex items-center gap-3'>
                         <div className='p-2 bg-gray-100 rounded-lg'>
                           <Hash size={16} className='text-gray-600' />
                         </div>
                         <div className='flex-1'>
                           <p className='text-sm text-gray-600'>IFSC Code</p>
                           <p className='font-mono text-sm font-medium text-gray-900'>{branch.ifscCode}</p>
                         </div>
                       </div>

                       <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
                         <div className='flex items-center justify-between'>
                           <div>
                             <p className='text-sm text-blue-700 font-medium'>Employees at this branch</p>
                             <p className='text-lg font-bold text-blue-900'>
                               {employees.filter(emp => emp.branch.branchId === branch.branchId).length}
                             </p>
                           </div>
                           <div className='p-2 bg-blue-100 rounded-lg'>
                             <Users size={20} className='text-blue-600' />
                           </div>
                         </div>
                       </div>

                       {/* Update Button */}
                       <button
                         onClick={() => openUpdateBranchModal(branch)}
                         className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                       >
                         <Edit size={16} />
                         Update Branch
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className='bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center'>
                 <div className='p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                   <Building2 className='text-gray-400' size={32} />
                 </div>
                 <h3 className='text-xl font-semibold text-gray-900 mb-2'>No branches yet</h3>
                 <p className='text-gray-600 mb-6'>Get started by adding your first branch</p>
                 <Button onClick={() => setAddBranchOpen(true)}>
                   <Plus size={20} className="mr-2" />
                   Add Branch
                 </Button>
               </div>
             )}
           </div>
         )}

         {activeTab === 'employees' && (
           <div className='space-y-6'>
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-2 bg-purple-100 rounded-lg'>
                 <Users className='text-purple-600' size={24} />
               </div>
               <h2 className='text-2xl font-bold text-gray-900'>Employees</h2>
             </div>

             {employees.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {employees.map((employee) => {
                   const roleConfig = getRoleConfig(employee.role);
                   const RoleIcon = roleConfig.icon;
                   
                   return (
                     <div key={employee.userId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                       <div className={`relative ${roleConfig.bg} p-6 text-white rounded-xl mb-4`}>
                         <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16'></div>
                         <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12'></div>
                         
                         <div className='relative z-10'>
                           <div className='flex items-center gap-3 mb-4'>
                             <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                               <RoleIcon size={24} className='text-white' />
                             </div>
                             <div>
                               <h3 className='font-semibold text-lg'>{employee.name}</h3>
                               <p className='text-white/80 text-sm'>@{employee.username}</p>
                             </div>
                           </div>
                         </div>
                       </div>

                       <div className='space-y-4'>
                         <div className='flex items-center gap-3'>
                           <div className='p-2 bg-gray-100 rounded-lg'>
                             <Mail size={16} className='text-gray-600' />
                           </div>
                           <div className='flex-1'>
                             <p className='text-sm text-gray-600'>Email</p>
                             <p className='font-medium text-gray-900 truncate'>{employee.email}</p>
                           </div>
                         </div>

                         <div className='flex items-center gap-3'>
                           <div className='p-2 bg-gray-100 rounded-lg'>
                             <Phone size={16} className='text-gray-600' />
                           </div>
                           <div className='flex-1'>
                             <p className='text-sm text-gray-600'>Phone</p>
                             <p className='font-medium text-gray-900'>{employee.phone}</p>
                           </div>
                         </div>

                         <div className='flex items-center gap-3'>
                           <div className='p-2 bg-gray-100 rounded-lg'>
                             <Building2 size={16} className='text-gray-600' />
                           </div>
                           <div className='flex-1'>
                             <p className='text-sm text-gray-600'>Branch</p>
                             <p className='font-medium text-gray-900'>{employee.branch.address}</p>
                           </div>
                         </div>

                         <div className='grid grid-cols-2 gap-4'>
                           <div>
                             <p className='text-sm text-gray-600 mb-1'>Join Date</p>
                             <p className='text-sm font-medium text-gray-900'>{formatDate(employee.joinDate)}</p>
                           </div>
                           <div>
                             <p className='text-sm text-gray-600 mb-1'>Status</p>
                             <div className='flex items-center gap-1'>
                               {employee.active ? (
                                 <CheckCircle size={14} className='text-green-600' />
                               ) : (
                                 <Clock size={14} className='text-yellow-600' />
                               )}
                               <span className={`text-xs font-medium ${employee.active ? 'text-green-700' : 'text-yellow-700'}`}>
                                 {employee.active ? 'Active' : 'Inactive'}
                               </span>
                             </div>
                           </div>
                         </div>

                         <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${roleConfig.bg} w-fit`}>
                           <RoleIcon size={14} className={roleConfig.color} />
                           <span className={`text-xs font-medium ${roleConfig.color}`}>
                             {roleConfig.text}
                           </span>
                         </div>

                         {/* Update Button */}
                         <button
                           onClick={() => openUpdateEmployeeModal(employee)}
                           className={`w-full mt-4 px-4 py-2 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                             employee.role === 'ROLE_MANAGER' 
                               ? 'bg-purple-600 hover:bg-purple-700' 
                               : 'bg-blue-600 hover:bg-blue-700'
                           }`}
                         >
                           <Edit size={16} />
                           Update {roleConfig.text}
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className='bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center'>
                 <div className='p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                   <Users className='text-gray-400' size={32} />
                 </div>
                 <h3 className='text-xl font-semibold text-gray-900 mb-2'>No employees found</h3>
                 <p className='text-gray-600'>Employees with Manager or Loan Officer roles will appear here</p>
               </div>
             )}
           </div>
         )}

         {activeTab === 'loans' && (
           <div className='space-y-6'>
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-2 bg-orange-100 rounded-lg'>
                 <CreditCard className='text-orange-600' size={24} />
               </div>
               <h2 className='text-2xl font-bold text-gray-900'>Loans</h2>
             </div>

             {loans.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {loans.map((loan) => (
                   <div key={loan.loanAccountId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                     {/* Header with Loan Type and Amount */}
                     <div className='relative bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white rounded-xl mb-4'>
                       <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16'></div>
                       <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12'></div>
                       
                       <div className='relative z-10'>
                         <div className='flex items-center justify-between mb-4'>
                           <div className='flex items-center gap-3'>
                             <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                               <CreditCard size={24} className='text-white' />
                             </div>
                             <div>
                               <h3 className='font-semibold text-lg'>Loan #{loan.loanAccountId}</h3>
                               <p className='text-white/80 text-sm capitalize'>{loan.loanType?.replace('_', ' ').toLowerCase()}</p>
                             </div>
                           </div>
                           <div className='text-right'>
                             <p className='text-white/80 text-sm'>Total Amount</p>
                             <p className='text-xl font-bold'>₹{loan.loanAmount?.toLocaleString() || 'N/A'}</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className='space-y-4'>
                       {/* Customer Information */}
                       <div className='flex items-center gap-3'>
                         <div className='p-2 bg-gray-100 rounded-lg'>
                           <User size={16} className='text-gray-600' />
                         </div>
                         <div className='flex-1'>
                           <p className='text-sm text-gray-600'>Customer</p>
                           <p className='font-medium text-gray-900'>{loan.user?.name || 'N/A'}</p>
                           <p className='text-xs text-gray-500'>{loan.user?.email || 'N/A'}</p>
                         </div>
                       </div>

                       {/* Loan Status */}
                       <div className='flex items-center gap-3'>
                         <div className='p-2 bg-gray-100 rounded-lg'>
                           <TrendingUp size={16} className='text-gray-600' />
                         </div>
                         <div className='flex-1'>
                           <p className='text-sm text-gray-600'>Status</p>
                           <div className='flex items-center gap-1'>
                             <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                               loan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                               loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                               'bg-red-100 text-red-700'
                             }`}>
                               {loan.status}
                             </span>
                           </div>
                         </div>
                       </div>

                       {/* Loan Details */}
                       <div className='grid grid-cols-2 gap-3'>
                         <div className='flex items-center gap-2'>
                           <div className='p-1.5 bg-blue-100 rounded-lg'>
                             <Calendar size={14} className='text-blue-600' />
                           </div>
                           <div className='flex-1 min-w-0'>
                             <p className='text-xs text-gray-600'>Start Date</p>
                             <p className='text-sm font-medium text-gray-900 truncate'>{formatDate(loan.startDate)}</p>
                           </div>
                         </div>
                         <div className='flex items-center gap-2'>
                           <div className='p-1.5 bg-purple-100 rounded-lg'>
                             <Calendar size={14} className='text-purple-600' />
                           </div>
                           <div className='flex-1 min-w-0'>
                             <p className='text-xs text-gray-600'>End Date</p>
                             <p className='text-sm font-medium text-gray-900 truncate'>{formatDate(loan.endDate)}</p>
                           </div>
                         </div>
                       </div>

                       {/* Financial Details */}
                       <div className='bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200'>
                         <div className='space-y-3'>
                           <div className='flex items-center justify-between'>
                             <span className='text-sm text-orange-700 font-medium'>Interest Rate</span>
                             <span className='text-sm font-bold text-orange-900'>{loan.interestRate}%</span>
                           </div>
                           <div className='flex items-center justify-between'>
                             <span className='text-sm text-orange-700 font-medium'>Outstanding Amount</span>
                             <span className='text-sm font-bold text-orange-900'>₹{loan.outstandingAmount?.toLocaleString() || 'N/A'}</span>
                           </div>
                           <div className='w-full bg-orange-200 rounded-full h-2'>
                             <div 
                               className='bg-orange-600 h-2 rounded-full transition-all duration-300'
                               style={{ 
                                 width: `${loan.outstandingAmount && loan.loanAmount ? 
                                   ((loan.outstandingAmount / loan.loanAmount) * 100) : 0}%` 
                               }}
                             ></div>
                           </div>
                           <div className='text-center'>
                             <p className='text-xs text-orange-600 font-medium'>
                               {loan.outstandingAmount && loan.loanAmount ? 
                                 `${((loan.outstandingAmount / loan.loanAmount) * 100).toFixed(1)}%` : '0%'} remaining
                             </p>
                           </div>
                         </div>
                       </div>

                       {/* Branch Information */}
                       <div className='flex items-center gap-3'>
                         <div className='p-2 bg-gray-100 rounded-lg'>
                           <Building2 size={16} className='text-gray-600' />
                         </div>
                         <div className='flex-1'>
                           <p className='text-sm text-gray-600'>Branch</p>
                           <p className='font-medium text-gray-900'>{loan.branch?.address || 'N/A'}</p>
                           <p className='text-xs text-gray-500'>{loan.branch?.ifscCode || 'N/A'}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className='bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center'>
                 <div className='p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                   <CreditCard className='text-gray-400' size={32} />
                 </div>
                 <h3 className='text-xl font-semibold text-gray-900 mb-2'>No loans found</h3>
                 <p className='text-gray-600'>Loan applications will appear here when available</p>
               </div>
             )}
           </div>
         )}

                 {/* Add Branch Modal */}
         <Modal isOpen={addBranchOpen} onClose={() => setAddBranchOpen(false)}>
           <div className="p-8 max-w-2xl mx-auto">
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-3 bg-blue-100 rounded-xl'>
                 <Plus className='text-blue-600' size={24} />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Add New Branch</h2>
                 <p className="text-gray-600">Create a new branch location</p>
               </div>
             </div>

             <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="ifscCode"
                    label="IFSC Code"
                    register={register}
                    errors={errors}
                    disabled={isLoading}
                    required
                    validation={{
                      required: 'IFSC Code is required',
                      minLength: {
                        value: 11,
                        message: 'IFSC Code must be 11 characters'
                      },
                      maxLength: {
                        value: 11,
                        message: 'IFSC Code must be 11 characters'
                      },
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: 'IFSC Code must be in format: ABCD0123456'
                      }
                    }}
                  />
                  <Input
                    id="address"
                    label="Branch Address"
                    register={register}
                    errors={errors}
                    disabled={isLoading}
                    required
                    validation={{
                      required: 'Branch address is required',
                      minLength: {
                        value: 10,
                        message: 'Address must be at least 10 characters'
                      },
                      maxLength: {
                        value: 200,
                        message: 'Address must be less than 200 characters'
                      }
                    }}
                  />
                </div>

               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                 <div className="flex items-center gap-2 mb-2">
                   <Globe className="text-blue-600" size={20} />
                   <h4 className="font-semibold text-blue-900">Branch Information</h4>
                 </div>
                 <ul className="text-sm text-blue-800 space-y-1">
                   <li>• IFSC Code must be unique</li>
                   <li>• Address should be complete and accurate</li>
                   <li>• Branch will be immediately available for use</li>
                 </ul>
               </div>

               <div className="flex gap-4 pt-4">
                 <Button
                   type="button"
                   onClick={() => setAddBranchOpen(false)}
                   disabled={isLoading}
                 >
                   Cancel
                 </Button>
                 <Button
                   disabled={isLoading}
                   type="submit"
                 >
                   {isLoading ? (
                     <div className="flex items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       Creating...
                     </div>
                   ) : (
                     'Create Branch'
                   )}
                 </Button>
               </div>
             </form>
           </div>
         </Modal>

         {/* Add Employee Modal */}
         <Modal isOpen={addEmployeeOpen} onClose={() => setAddEmployeeOpen(false)}>
           <div className="p-8 max-w-2xl mx-auto">
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-3 bg-purple-100 rounded-xl'>
                 <Users className='text-purple-600' size={24} />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                 <p className="text-gray-600">Create a new employee account</p>
               </div>
             </div>

             <form className="space-y-6" onSubmit={handleSubmitEmployee(onSubmitEmployee)}>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="username"
                    label="Username"
                    register={registerEmployee}
                    errors={employeeErrors}
                    disabled={isEmployeeLoading}
                    required
                    validation={{
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      },
                      maxLength: {
                        value: 20,
                        message: 'Username must be less than 20 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Username can only contain letters, numbers, and underscores'
                      }
                    }}
                  />
                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    register={registerEmployee}
                    errors={employeeErrors}
                    disabled={isEmployeeLoading}
                    required
                    validation={{
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Password must be less than 50 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: 'Password must contain uppercase, lowercase, number, and special character'
                      }
                    }}
                  />
                </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="name"
                    label="Full Name"
                    register={registerEmployee}
                    errors={employeeErrors}
                    disabled={isEmployeeLoading}
                    required
                    validation={{
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Name must be less than 50 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Name can only contain letters and spaces'
                      }
                    }}
                  />
                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    register={registerEmployee}
                    errors={employeeErrors}
                    disabled={isEmployeeLoading}
                    required
                    validation={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    }}
                  />
                </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    register={registerEmployee}
                    errors={employeeErrors}
                    disabled={isEmployeeLoading}
                    required
                    validation={{
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Please enter a valid 10-digit Indian mobile number'
                      }
                    }}
                  />
                  <Input
                    id="pan"
                    label="PAN Number"
                    register={registerEmployee}
                    errors={employeeErrors}
                    disabled={isEmployeeLoading}
                    required
                    validation={{
                      required: 'PAN number is required',
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: 'Please enter a valid PAN number (e.g., ABCDE1234F)'
                      }
                    }}
                  />
                </div>

                               <Input
                  id="address"
                  label="Address"
                  register={registerEmployee}
                  errors={employeeErrors}
                  disabled={isEmployeeLoading}
                  required
                  validation={{
                    required: 'Address is required',
                    minLength: {
                      value: 10,
                      message: 'Address must be at least 10 characters'
                    },
                    maxLength: {
                      value: 200,
                      message: 'Address must be less than 200 characters'
                    }
                  }}
                />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Role *
                   </label>
                                       <Select
                      value={undefined}
                      onChange={(value) => {
                        setSelectedRole(value.value);
                      }}
                      options={[
                        { value: 'ROLE_MANAGER', label: '👨‍💼 Branch Manager' },
                        { value: 'ROLE_LOAN_OFFICER', label: '💼 Loan Officer' },
                      ]}
                      disabled={isEmployeeLoading}
                      label="Select employee role"
                    />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Branch *
                   </label>
                                       <Select
                      value={undefined}
                      onChange={(value) => {
                        const selectedBranch = branches.find(branch => branch.branchId === value.value);
                        setSelectedBranch(selectedBranch || null);
                      }}
                      options={branches.map(branch => ({
                        value: branch.branchId,
                        label: `🏦 ${branch.address} (${branch.ifscCode})`
                      }))}
                      disabled={isEmployeeLoading}
                      label="Select branch"
                    />
                 </div>
               </div>

               <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                 <div className="flex items-center gap-2 mb-2">
                   <Shield className="text-purple-600" size={20} />
                   <h4 className="font-semibold text-purple-900">Employee Information</h4>
                 </div>
                 <ul className="text-sm text-purple-800 space-y-1">
                   <li>• Employee will be created with active status</li>
                   <li>• Username must be unique</li>
                   <li>• Email and PAN should be valid</li>
                   <li>• Employee can login immediately after creation</li>
                 </ul>
               </div>

               <div className="flex gap-4 pt-4">
                 <Button
                   type="button"
                   onClick={() => setAddEmployeeOpen(false)}
                   disabled={isEmployeeLoading}
                 >
                   Cancel
                 </Button>
                 <Button
                   disabled={isEmployeeLoading}
                   type="submit"
                 >
                   {isEmployeeLoading ? (
                     <div className="flex items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       Creating...
                     </div>
                   ) : (
                     'Create Employee'
                   )}
                 </Button>
               </div>
             </form>
           </div>
         </Modal>

         {/* Update Branch Modal */}
         <Modal isOpen={updateBranchOpen} onClose={closeUpdateBranchModal}>
           <div className="p-8 max-w-2xl mx-auto">
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-3 bg-blue-100 rounded-xl'>
                 <Building2 className='text-blue-600' size={24} />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Update Branch</h2>
                 <p className="text-gray-600">Update branch information</p>
               </div>
             </div>

             <form className="space-y-6" onSubmit={handleSubmitUpdateBranch(onSubmitUpdateBranch)}>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="ifscCode"
                    label="IFSC Code"
                    register={registerUpdateBranch}
                    errors={updateBranchErrors}
                    disabled={isUpdateBranchLoading}
                    required
                    validation={{
                      required: 'IFSC Code is required',
                      minLength: {
                        value: 11,
                        message: 'IFSC Code must be 11 characters'
                      },
                      maxLength: {
                        value: 11,
                        message: 'IFSC Code must be 11 characters'
                      },
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: 'IFSC Code must be in format: ABCD0123456'
                      }
                    }}
                  />
                  <Input
                    id="address"
                    label="Branch Address"
                    register={registerUpdateBranch}
                    errors={updateBranchErrors}
                    disabled={isUpdateBranchLoading}
                    required
                    validation={{
                      required: 'Branch address is required',
                      minLength: {
                        value: 10,
                        message: 'Address must be at least 10 characters'
                      },
                      maxLength: {
                        value: 200,
                        message: 'Address must be less than 200 characters'
                      }
                    }}
                  />
                </div>

               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                 <div className="flex items-center gap-2 mb-2">
                   <Globe className="text-blue-600" size={20} />
                   <h4 className="font-semibold text-blue-900">Update Information</h4>
                 </div>
                 <ul className="text-sm text-blue-800 space-y-1">
                   <li>• IFSC Code must be unique</li>
                   <li>• Address should be complete and accurate</li>
                   <li>• Changes will be applied immediately</li>
                 </ul>
               </div>

               <div className="flex gap-4 pt-4">
                 <Button
                   type="button"
                   onClick={closeUpdateBranchModal}
                   disabled={isUpdateBranchLoading}
                 >
                   Cancel
                 </Button>
                 <Button
                   disabled={isUpdateBranchLoading}
                   type="submit"
                 >
                   {isUpdateBranchLoading ? (
                     <div className="flex items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       Updating...
                     </div>
                   ) : (
                     'Update Branch'
                   )}
                 </Button>
               </div>
             </form>
           </div>
         </Modal>

         {/* Update Employee Modal */}
         <Modal isOpen={updateEmployeeOpen} onClose={closeUpdateEmployeeModal}>
           <div className="p-8 max-w-2xl mx-auto">
             <div className='flex items-center gap-3 mb-6'>
               <div className='p-3 bg-purple-100 rounded-xl'>
                 <User className='text-purple-600' size={24} />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Update Employee</h2>
                 <p className="text-gray-600">Update employee information</p>
               </div>
             </div>

             <form className="space-y-6" onSubmit={handleSubmitUpdateEmployee(onSubmitUpdateEmployee)}>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="name"
                    label="Full Name"
                    register={registerUpdateEmployee}
                    errors={updateEmployeeErrors}
                    disabled={isUpdateEmployeeLoading}
                    required
                    validation={{
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Name must be less than 50 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Name can only contain letters and spaces'
                      }
                    }}
                  />
                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    register={registerUpdateEmployee}
                    errors={updateEmployeeErrors}
                    disabled={isUpdateEmployeeLoading}
                    required
                    validation={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    }}
                  />
                </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    register={registerUpdateEmployee}
                    errors={updateEmployeeErrors}
                    disabled={isUpdateEmployeeLoading}
                    required
                    validation={{
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Please enter a valid 10-digit Indian mobile number'
                      }
                    }}
                  />
                  <Input
                    id="pan"
                    label="PAN Number"
                    register={registerUpdateEmployee}
                    errors={updateEmployeeErrors}
                    disabled={isUpdateEmployeeLoading}
                    required
                    validation={{
                      required: 'PAN number is required',
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: 'Please enter a valid PAN number (e.g., ABCDE1234F)'
                      }
                    }}
                  />
                </div>

                               <Input
                  id="address"
                  label="Address"
                  register={registerUpdateEmployee}
                  errors={updateEmployeeErrors}
                  disabled={isUpdateEmployeeLoading}
                  required
                  validation={{
                    required: 'Address is required',
                    minLength: {
                      value: 10,
                      message: 'Address must be at least 10 characters'
                    },
                    maxLength: {
                      value: 200,
                      message: 'Address must be less than 200 characters'
                    }
                  }}
                />

               <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                 <div className="flex items-center gap-2 mb-2">
                   <Shield className="text-purple-600" size={20} />
                   <h4 className="font-semibold text-purple-900">Update Information</h4>
                 </div>
                 <ul className="text-sm text-purple-800 space-y-1">
                   <li>• Email and PAN should be valid</li>
                   <li>• Changes will be applied immediately</li>
                   <li>• Employee can continue using their account</li>
                 </ul>
               </div>

               <div className="flex gap-4 pt-4">
                 <Button
                   type="button"
                   onClick={closeUpdateEmployeeModal}
                   disabled={isUpdateEmployeeLoading}
                 >
                   Cancel
                 </Button>
                 <Button
                   disabled={isUpdateEmployeeLoading}
                   type="submit"
                 >
                   {isUpdateEmployeeLoading ? (
                     <div className="flex items-center justify-center gap-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       Updating...
                     </div>
                   ) : (
                     'Update Employee'
                   )}
                 </Button>
               </div>
             </form>
           </div>
         </Modal>

         {/* Update Success/Error Dialog */}
         {showUpdateDialog && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
               <div className="flex flex-col items-center text-center">
                 <div className={`p-3 rounded-full mb-4 ${
                   updateDialogType === 'success' ? 'bg-green-100' : 'bg-red-100'
                 }`}>
                   {updateDialogType === 'success' ? (
                     <CheckCircle className="text-green-600" size={32} />
                   ) : (
                     <AlertCircle className="text-red-600" size={32} />
                   )}
                 </div>
                 <h3 className={`text-xl font-semibold mb-2 ${
                   updateDialogType === 'success' ? 'text-green-900' : 'text-red-900'
                 }`}>
                   {updateDialogType === 'success' ? 'Success!' : 'Error!'}
                 </h3>
                 <p className="text-gray-600 mb-6">{updateDialogMessage}</p>
                 <button
                   onClick={() => setShowUpdateDialog(false)}
                   className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                     updateDialogType === 'success' 
                       ? 'bg-green-600 text-white hover:bg-green-700' 
                       : 'bg-red-600 text-white hover:bg-red-700'
                   }`}
                 >
                   {updateDialogType === 'success' ? 'Continue' : 'Try Again'}
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  )
}

export default AdminPage
