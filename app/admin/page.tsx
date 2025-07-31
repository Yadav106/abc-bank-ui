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
  Globe
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
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      ifscCode: '',
      address: ''
    }
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
    }
  })

  // Fetch branches and employees
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
      await axios.post("http://localhost:8080/branches", data, {
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
              <p className='text-gray-600 text-lg'>Manage branches and employees</p>
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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
          </div>
        </div>

        {/* Branches Section */}
        <div className='mb-8'>
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

        {/* Employees Section */}
        <div className='mb-8'>
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
                 />
                 <Input
                   id="address"
                   label="Branch Address"
                   register={register}
                   errors={errors}
                   disabled={isLoading}
                   required
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
                 />
                 <Input
                   id="password"
                   label="Password"
                   type="password"
                   register={registerEmployee}
                   errors={employeeErrors}
                   disabled={isEmployeeLoading}
                   required
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
                 />
                 <Input
                   id="email"
                   label="Email Address"
                   type="email"
                   register={registerEmployee}
                   errors={employeeErrors}
                   disabled={isEmployeeLoading}
                   required
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
                 />
                 <Input
                   id="pan"
                   label="PAN Number"
                   register={registerEmployee}
                   errors={employeeErrors}
                   disabled={isEmployeeLoading}
                   required
                 />
               </div>

               <Input
                 id="address"
                 label="Address"
                 register={registerEmployee}
                 errors={employeeErrors}
                 disabled={isEmployeeLoading}
                 required
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
      </div>
    </div>
  )
}

export default AdminPage
