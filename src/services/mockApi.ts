// Mock API Service for Fee Management System
// This simulates backend API calls for testing purposes

import { v4 as uuidv4 } from 'uuid';

// Types
export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  gender: string;
  dateOfBirth: string;
  admissionDate: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  profileImage?: string;
  feeStatus: 'paid' | 'partial' | 'unpaid' | 'defaulter';
}

export interface Payment {
  _id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface FeeStructure {
  _id: string;
  name: string;
  class: string;
  totalAmount: number;
  installments: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalFeeStructures: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  defaulters: number;
}

export interface DashboardData {
  revenueByMonth: {
    month: string;
    amount: number;
  }[];
  paymentsByMethod: {
    method: string;
    count: number;
  }[];
  defaultersByClass: {
    class: string;
    count: number;
  }[];
  upcomingPayments: {
    _id: string;
    studentName: string;
    dueDate: string;
    amount: number;
    installmentLabel: string;
  }[];
}

// Mock Data Storage
let students: Student[] = [];
let payments: Payment[] = [];
let feeStructures: FeeStructure[] = [];

// Initialize with some sample data
const initializeMockData = () => {
  // Only initialize if data is empty
  if (students.length === 0) {
    // Sample Students
    students = [
      {
        _id: uuidv4(),
        name: 'John Smith',
        rollNumber: 'STU001',
        class: '10',
        section: 'A',
        gender: 'male',
        dateOfBirth: '2005-05-15',
        admissionDate: '2020-04-10',
        email: 'john.smith@example.com',
        phone: '3001234567',
        address: '123 Main St, Karachi',
        parentName: 'Robert Smith',
        parentPhone: '3009876543',
        parentEmail: 'robert.smith@example.com',
        feeStatus: 'paid'
      },
      {
        _id: uuidv4(),
        name: 'Sarah Khan',
        rollNumber: 'STU002',
        class: '9',
        section: 'B',
        gender: 'female',
        dateOfBirth: '2006-08-22',
        admissionDate: '2021-03-15',
        email: 'sarah.khan@example.com',
        phone: '3002345678',
        address: '456 Park Ave, Lahore',
        parentName: 'Ahmed Khan',
        parentPhone: '3008765432',
        parentEmail: 'ahmed.khan@example.com',
        feeStatus: 'partial'
      },
      {
        _id: uuidv4(),
        name: 'Ali Hassan',
        rollNumber: 'STU003',
        class: '8',
        section: 'A',
        gender: 'male',
        dateOfBirth: '2007-02-10',
        admissionDate: '2022-04-05',
        email: 'ali.hassan@example.com',
        phone: '3003456789',
        address: '789 School Rd, Islamabad',
        parentName: 'Tariq Hassan',
        parentPhone: '3007654321',
        parentEmail: 'tariq.hassan@example.com',
        feeStatus: 'unpaid'
      },
      {
        _id: uuidv4(),
        name: 'Fatima Ahmed',
        rollNumber: 'STU004',
        class: '10',
        section: 'A',
        gender: 'female',
        dateOfBirth: '2005-11-30',
        admissionDate: '2020-04-12',
        email: 'fatima.ahmed@example.com',
        phone: '3004567890',
        address: '101 College St, Karachi',
        parentName: 'Bilal Ahmed',
        parentPhone: '3006543210',
        parentEmail: 'bilal.ahmed@example.com',
        feeStatus: 'defaulter'
      }
    ];

    // Sample Fee Structures
    feeStructures = [
      {
        _id: uuidv4(),
        name: 'Class 10 Annual Fee',
        class: '10',
        totalAmount: 50000,
        installments: 4,
        dueDate: '2025-06-15',
        createdAt: '2025-01-10T10:30:00Z',
        updatedAt: '2025-01-10T10:30:00Z'
      },
      {
        _id: uuidv4(),
        name: 'Class 9 Annual Fee',
        class: '9',
        totalAmount: 45000,
        installments: 4,
        dueDate: '2025-06-15',
        createdAt: '2025-01-10T11:00:00Z',
        updatedAt: '2025-01-10T11:00:00Z'
      },
      {
        _id: uuidv4(),
        name: 'Class 8 Annual Fee',
        class: '8',
        totalAmount: 40000,
        installments: 4,
        dueDate: '2025-06-15',
        createdAt: '2025-01-10T11:30:00Z',
        updatedAt: '2025-01-10T11:30:00Z'
      }
    ];

    // Sample Payments
    payments = [
      {
        _id: uuidv4(),
        studentId: students[0]._id,
        amount: 12500,
        paymentDate: '2025-04-10',
        paymentMethod: 'Cash',
        receiptNumber: 'REC001',
        description: 'First installment',
        status: 'completed'
      },
      {
        _id: uuidv4(),
        studentId: students[1]._id,
        amount: 11250,
        paymentDate: '2025-04-12',
        paymentMethod: 'Bank Transfer',
        receiptNumber: 'REC002',
        description: 'First installment',
        status: 'completed'
      },
      {
        _id: uuidv4(),
        studentId: students[0]._id,
        amount: 12500,
        paymentDate: '2025-05-05',
        paymentMethod: 'Credit Card',
        receiptNumber: 'REC003',
        description: 'Second installment',
        status: 'pending'
      }
    ];
  }
};

// Mock API Functions

// Students API
export const getStudents = async (params: any = {}) => {
  initializeMockData();
  
  let filteredStudents = [...students];
  
  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredStudents = filteredStudents.filter(
      student => 
        student.name.toLowerCase().includes(searchLower) || 
        student.rollNumber.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply class filter
  if (params.class) {
    filteredStudents = filteredStudents.filter(
      student => student.class === params.class
    );
  }
  
  // Apply fee status filter
  if (params.feeStatus) {
    filteredStudents = filteredStudents.filter(
      student => student.feeStatus === params.feeStatus
    );
  }
  
  // Apply sorting
  if (params.sort) {
    filteredStudents.sort((a, b) => {
      if (params.sort === 'name') {
        return params.order === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
      if (params.sort === 'class') {
        return params.order === 'asc' 
          ? a.class.localeCompare(b.class) 
          : b.class.localeCompare(a.class);
      }
      return 0;
    });
  }
  
  // Apply pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  return {
    students: paginatedStudents,
    total: filteredStudents.length
  };
};

export const getStudentById = async (id: string) => {
  initializeMockData();
  const student = students.find(s => s._id === id);
  if (!student) {
    throw new Error('Student not found');
  }
  return student;
};

export const createStudent = async (studentData: Omit<Student, '_id' | 'feeStatus'>) => {
  initializeMockData();
  const newStudent: Student = {
    _id: uuidv4(),
    ...studentData,
    feeStatus: 'unpaid'
  };
  
  students.push(newStudent);
  return newStudent;
};

export const updateStudent = async (id: string, studentData: Partial<Student>) => {
  initializeMockData();
  const studentIndex = students.findIndex(s => s._id === id);
  
  if (studentIndex === -1) {
    throw new Error('Student not found');
  }
  
  students[studentIndex] = {
    ...students[studentIndex],
    ...studentData
  };
  
  return students[studentIndex];
};

export const deleteStudent = async (id: string) => {
  initializeMockData();
  const studentIndex = students.findIndex(s => s._id === id);
  
  if (studentIndex === -1) {
    throw new Error('Student not found');
  }
  
  students.splice(studentIndex, 1);
  
  // Also delete related payments
  payments = payments.filter(p => p.studentId !== id);
  
  return { success: true };
};

// Payments API
export const getPayments = async (params: any = {}) => {
  initializeMockData();
  
  let filteredPayments = [...payments];
  
  // Filter by student ID
  if (params.studentId) {
    filteredPayments = filteredPayments.filter(
      payment => payment.studentId === params.studentId
    );
  }
  
  // Apply pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
  
  return {
    payments: paginatedPayments,
    total: filteredPayments.length
  };
};

export const createPayment = async (paymentData: Omit<Payment, '_id'>) => {
  initializeMockData();
  const newPayment: Payment = {
    _id: uuidv4(),
    ...paymentData
  };
  
  payments.push(newPayment);
  
  // Update student fee status
  const studentPayments = payments.filter(p => p.studentId === paymentData.studentId);
  const student = students.find(s => s._id === paymentData.studentId);
  
  if (student) {
    const feeStructure = feeStructures.find(f => f.class === student.class);
    
    if (feeStructure) {
      const totalPaid = studentPayments.reduce((sum, payment) => {
        return payment.status === 'completed' ? sum + payment.amount : sum;
      }, 0);
      
      if (totalPaid >= feeStructure.totalAmount) {
        student.feeStatus = 'paid';
      } else if (totalPaid > 0) {
        student.feeStatus = 'partial';
      } else {
        student.feeStatus = 'unpaid';
      }
    }
  }
  
  return newPayment;
};

// Fee Structures API
export const getFeeStructures = async (params: any = {}) => {
  initializeMockData();
  
  let filteredStructures = [...feeStructures];
  
  // Filter by class
  if (params.class) {
    filteredStructures = filteredStructures.filter(
      structure => structure.class === params.class
    );
  }
  
  // Apply pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedStructures = filteredStructures.slice(startIndex, endIndex);
  
  return {
    feeStructures: paginatedStructures,
    total: filteredStructures.length
  };
};

export const createFeeStructure = async (structureData: Omit<FeeStructure, '_id' | 'createdAt' | 'updatedAt'>) => {
  initializeMockData();
  const now = new Date().toISOString();
  
  const newStructure: FeeStructure = {
    _id: uuidv4(),
    ...structureData,
    createdAt: now,
    updatedAt: now
  };
  
  feeStructures.push(newStructure);
  return newStructure;
};

// Dashboard API
export const getDashboardStats = async () => {
  initializeMockData();
  
  const stats: DashboardStats = {
    totalStudents: students.length,
    totalFeeStructures: feeStructures.length,
    totalPayments: payments.filter(p => p.status === 'completed').length,
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    defaulters: students.filter(s => s.feeStatus === 'defaulter').length
  };
  
  return stats;
};

export const getDashboardData = async (timeframe: string = 'year') => {
  initializeMockData();
  
  // Generate revenue by month data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = months.map(month => ({
    month,
    amount: Math.floor(Math.random() * 50000) + 10000 // Random amount between 10,000 and 60,000
  }));
  
  // Generate payment methods data
  const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Online Payment', 'Cheque'];
  const paymentsByMethod = paymentMethods.map(method => ({
    method,
    count: Math.floor(Math.random() * 20) + 5 // Random count between 5 and 25
  }));
  
  // Generate defaulters by class data
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const defaultersByClass = classes.map(cls => ({
    class: cls,
    count: Math.floor(Math.random() * 5) // Random count between 0 and 5
  }));
  
  // Generate upcoming payments data
  const upcomingPayments = [
    {
      _id: uuidv4(),
      studentName: 'John Smith',
      dueDate: '2025-05-15',
      amount: 12500,
      installmentLabel: 'Second Installment'
    },
    {
      _id: uuidv4(),
      studentName: 'Sarah Khan',
      dueDate: '2025-05-20',
      amount: 11250,
      installmentLabel: 'Second Installment'
    },
    {
      _id: uuidv4(),
      studentName: 'Ali Hassan',
      dueDate: '2025-05-25',
      amount: 10000,
      installmentLabel: 'First Installment'
    }
  ];
  
  const dashboardData: DashboardData = {
    revenueByMonth,
    paymentsByMethod,
    defaultersByClass,
    upcomingPayments
  };
  
  return dashboardData;
};

// Export a mock axios-like interface
const mockApi = {
  get: async (url: string, config: any = {}) => {
    const params = config.params || {};
    
    // Students endpoints
    if (url.match(/\/api\/students$/)) {
      const data = await getStudents(params);
      return { data };
    }
    
    if (url.match(/\/api\/students\/[a-zA-Z0-9-]+$/)) {
      const id = url.split('/').pop() as string;
      const data = await getStudentById(id);
      return { data };
    }
    
    // Payments endpoints
    if (url.match(/\/api\/payments$/)) {
      const data = await getPayments(params);
      return { data };
    }
    
    // Fee structures endpoints
    if (url.match(/\/api\/fee-structures$/)) {
      const data = await getFeeStructures(params);
      return { data };
    }
    
    // Dashboard endpoints
    if (url === '/api/dashboard/stats') {
      const data = await getDashboardStats();
      return { data };
    }
    
    if (url.match(/\/api\/dashboard\/data/)) {
      const data = await getDashboardData(params.timeframe);
      return { data };
    }
    
    throw new Error(`Unhandled endpoint: ${url}`);
  },
  
  post: async (url: string, data: any, config: any = {}) => {
    // Students endpoints
    if (url === '/api/students') {
      const newStudent = await createStudent(data);
      return { data: newStudent };
    }
    
    // Payments endpoints
    if (url === '/api/payments') {
      const newPayment = await createPayment(data);
      return { data: newPayment };
    }
    
    // Fee structures endpoints
    if (url === '/api/fee-structures') {
      const newStructure = await createFeeStructure(data);
      return { data: newStructure };
    }
    
    throw new Error(`Unhandled endpoint: ${url}`);
  },
  
  put: async (url: string, data: any, config: any = {}) => {
    // Students endpoints
    if (url.match(/\/api\/students\/[a-zA-Z0-9-]+$/)) {
      const id = url.split('/').pop() as string;
      const updatedStudent = await updateStudent(id, data);
      return { data: updatedStudent };
    }
    
    throw new Error(`Unhandled endpoint: ${url}`);
  },
  
  delete: async (url: string, config: any = {}) => {
    // Students endpoints
    if (url.match(/\/api\/students\/[a-zA-Z0-9-]+$/)) {
      const id = url.split('/').pop() as string;
      const result = await deleteStudent(id);
      return { data: result };
    }
    
    throw new Error(`Unhandled endpoint: ${url}`);
  }
};

export default mockApi;
