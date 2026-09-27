// Fake Data Service for ezPICRA Client
// This service provides mock data for development and testing purposes

// Simulate API delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fake projects data
const fakeProjects = [
  {
    id: 1,
    name: 'Project Alpha',
    status: 'In Progress',
    deadline: 'Dec 15, 2023',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop',
    description: 'Multi-story building construction with scaffolding',
    address: '123 Main St, City, State',
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-12-01T15:30:00Z'
  },
  {
    id: 2,
    name: 'Project Beta',
    status: 'Completed',
    deadline: 'Nov 30, 2023',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop',
    description: 'Modern living room with contemporary furniture',
    address: '456 Oak Ave, City, State',
    createdAt: '2023-10-15T09:00:00Z',
    updatedAt: '2023-11-30T14:00:00Z'
  },
  {
    id: 3,
    name: 'Project Gamma',
    status: 'Pending',
    deadline: 'Dec 22, 2023',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop',
    description: 'Spacious kitchen with modern appliances',
    address: '789 Pine Rd, City, State',
    createdAt: '2023-12-01T11:00:00Z',
    updatedAt: '2023-12-01T11:00:00Z'
  },
  {
    id: 4,
    name: 'Project Delta',
    status: 'In Progress',
    deadline: 'Jan 5, 2024',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop',
    description: 'Outdoor deck with landscaping',
    address: '321 Elm St, City, State',
    createdAt: '2023-11-20T08:00:00Z',
    updatedAt: '2023-12-02T16:45:00Z'
  }
];

// Fake quotes data
const fakeQuotes = [
  {
    id: 1,
    projectId: 1,
    picraProcessingId: 1,
    customer: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, City, State'
    },
    quoteNumber: 'QT-20231201-001',
    title: 'Property Repair Quote - 123 Main St',
    description: 'Comprehensive repair quote based on PICRA analysis',
    quoteItems: [
      {
        itemNumber: 'Q-001',
        description: 'Roof repair and shingle replacement',
        quantity: '1 EA',
        unitPrice: 3500,
        totalPrice: 3500,
        specifications: 'Replace damaged shingles and repair flashing',
        materials: 'Asphalt shingles, flashing material',
        labor: '16 hours',
        warranty: '1 year',
        notes: 'Includes cleanup and disposal'
      },
      {
        itemNumber: 'Q-002',
        description: 'Electrical panel upgrade',
        quantity: '1 EA',
        unitPrice: 4200,
        totalPrice: 4200,
        specifications: 'Update electrical panel and wiring',
        materials: '200A panel, wiring, breakers',
        labor: '24 hours',
        warranty: '1 year',
        notes: 'Includes inspection and certification'
      }
    ],
    subtotal: 7700,
    tax: 770,
    total: 8470,
    status: 'sent',
    approval: {
      status: 'pending',
      requestedAt: '2023-12-01T10:00:00Z',
      respondedAt: null,
      customerResponse: null,
      customerNotes: null
    },
    communications: [
      {
        type: 'email',
        subject: 'Quote QT-20231201-001 - Property Repair Quote',
        message: 'Your quote has been sent. Please review and respond.',
        sentAt: '2023-12-01T10:00:00Z',
        sentBy: { id: 1, firstName: 'Admin', lastName: 'User' },
        recipient: 'john.smith@email.com',
        status: 'sent'
      }
    ],
    termsAndConditions: 'Payment due within 30 days. 1 year warranty on all work.',
    paymentTerms: 'Net 30',
    validUntil: '2024-01-01T00:00:00Z',
    createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
    assignedTo: { id: 1, firstName: 'Admin', lastName: 'User' },
    version: 1,
    isActive: true,
    metadata: {
      generatedFrom: 'picra_analysis',
      processingTime: 15,
      templateUsed: 'standard_repair',
      notes: 'Generated from PICRA analysis results'
    },
    createdAt: '2023-12-01T09:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  },
  {
    id: 2,
    projectId: 2,
    picraProcessingId: 2,
    customer: {
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '(555) 987-6543',
      address: '456 Oak Ave, City, State'
    },
    quoteNumber: 'QT-20231202-001',
    title: 'Home Inspection Repair Quote',
    description: 'Repair quote based on home inspection findings',
    quoteItems: [
      {
        itemNumber: 'Q-001',
        description: 'Plumbing repairs and fixture replacement',
        quantity: '1 EA',
        unitPrice: 2800,
        totalPrice: 2800,
        specifications: 'Fix leaky pipes and replace fixtures',
        materials: 'PVC pipes, fixtures, fittings',
        labor: '12 hours',
        warranty: '1 year',
        notes: 'Includes pressure testing'
      }
    ],
    subtotal: 2800,
    tax: 280,
    total: 3080,
    status: 'draft',
    approval: {
      status: 'pending',
      requestedAt: null,
      respondedAt: null,
      customerResponse: null,
      customerNotes: null
    },
    communications: [],
    termsAndConditions: 'Payment due within 30 days. 1 year warranty on all work.',
    paymentTerms: 'Net 30',
    validUntil: '2024-01-02T00:00:00Z',
    createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
    assignedTo: { id: 1, firstName: 'Admin', lastName: 'User' },
    version: 1,
    isActive: true,
    metadata: {
      generatedFrom: 'picra_analysis',
      processingTime: 12,
      templateUsed: 'standard_repair',
      notes: 'Generated from inspection report analysis'
    },
    createdAt: '2023-12-02T08:00:00Z',
    updatedAt: '2023-12-02T08:00:00Z'
  },
  {
    id: 3,
    projectId: 3,
    picraProcessingId: 3,
    customer: {
      name: 'Emily Clark',
      email: 'emily.clark@email.com',
      phone: '(555) 111-2222',
      address: '789 Pine Rd, City, State'
    },
    quoteNumber: 'QT-20231203-001',
    title: 'Kitchen Renovation Quote',
    description: 'Kitchen renovation based on inspection findings',
    quoteItems: [
      {
        itemNumber: 'Q-001',
        description: 'Kitchen cabinet replacement',
        quantity: '1 EA',
        unitPrice: 8500,
        totalPrice: 8500,
        specifications: 'Replace all kitchen cabinets and countertops',
        materials: 'Solid wood cabinets, granite countertops',
        labor: '40 hours',
        warranty: '2 years',
        notes: 'Includes demolition and installation'
      }
    ],
    subtotal: 8500,
    tax: 850,
    total: 9350,
    status: 'approved',
    approval: {
      status: 'approved',
      requestedAt: '2023-12-03T09:00:00Z',
      respondedAt: '2023-12-04T14:30:00Z',
      customerResponse: 'approved',
      customerNotes: 'Great quote, ready to proceed'
    },
    communications: [],
    termsAndConditions: 'Payment due within 30 days. 2 year warranty on all work.',
    paymentTerms: 'Net 30',
    validUntil: '2024-01-03T00:00:00Z',
    createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
    assignedTo: { id: 1, firstName: 'Admin', lastName: 'User' },
    version: 1,
    isActive: true,
    metadata: {
      generatedFrom: 'picra_analysis',
      processingTime: 18,
      templateUsed: 'kitchen_renovation',
      notes: 'Generated from kitchen inspection analysis'
    },
    createdAt: '2023-12-03T09:00:00Z',
    updatedAt: '2023-12-04T14:30:00Z'
  },
  {
    id: 4,
    projectId: 4,
    picraProcessingId: 4,
    customer: {
      name: 'Michael Smith',
      email: 'michael.smith@email.com',
      phone: '(555) 333-4444',
      address: '321 Elm St, City, State'
    },
    quoteNumber: 'QT-20231204-001',
    title: 'Deck Construction Quote',
    description: 'Outdoor deck construction quote',
    quoteItems: [
      {
        itemNumber: 'Q-001',
        description: 'Composite deck construction',
        quantity: '1 EA',
        unitPrice: 12000,
        totalPrice: 12000,
        specifications: 'Build 20x12 composite deck with railing',
        materials: 'Composite decking, pressure-treated frame, aluminum railing',
        labor: '60 hours',
        warranty: '3 years',
        notes: 'Includes permits and inspection'
      }
    ],
    subtotal: 12000,
    tax: 1200,
    total: 13200,
    status: 'rejected',
    approval: {
      status: 'rejected',
      requestedAt: '2023-12-04T10:00:00Z',
      respondedAt: '2023-12-05T16:00:00Z',
      customerResponse: 'rejected',
      customerNotes: 'Price too high, looking for alternatives'
    },
    communications: [],
    termsAndConditions: 'Payment due within 30 days. 3 year warranty on all work.',
    paymentTerms: 'Net 30',
    validUntil: '2024-01-04T00:00:00Z',
    createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
    assignedTo: { id: 1, firstName: 'Admin', lastName: 'User' },
    version: 1,
    isActive: true,
    metadata: {
      generatedFrom: 'picra_analysis',
      processingTime: 22,
      templateUsed: 'deck_construction',
      notes: 'Generated from property analysis'
    },
    createdAt: '2023-12-04T10:00:00Z',
    updatedAt: '2023-12-05T16:00:00Z'
  },
  {
    id: 5,
    projectId: 5,
    picraProcessingId: 5,
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 555-6666',
      address: '654 Maple Dr, City, State'
    },
    quoteNumber: 'QT-20231205-001',
    title: 'Bathroom Remodel Quote',
    description: 'Complete bathroom renovation quote',
    quoteItems: [
      {
        itemNumber: 'Q-001',
        description: 'Bathroom renovation',
        quantity: '1 EA',
        unitPrice: 15000,
        totalPrice: 15000,
        specifications: 'Complete bathroom renovation with new fixtures',
        materials: 'Ceramic tile, new fixtures, vanity, lighting',
        labor: '80 hours',
        warranty: '2 years',
        notes: 'Includes plumbing and electrical work'
      }
    ],
    subtotal: 15000,
    tax: 1500,
    total: 16500,
    status: 'sent',
    approval: {
      status: 'pending',
      requestedAt: '2023-12-05T11:00:00Z',
      respondedAt: null,
      customerResponse: null,
      customerNotes: null
    },
    communications: [],
    termsAndConditions: 'Payment due within 30 days. 2 year warranty on all work.',
    paymentTerms: 'Net 30',
    validUntil: '2024-01-05T00:00:00Z',
    createdBy: { id: 1, firstName: 'Admin', lastName: 'User' },
    assignedTo: { id: 1, firstName: 'Admin', lastName: 'User' },
    version: 1,
    isActive: true,
    metadata: {
      generatedFrom: 'picra_analysis',
      processingTime: 25,
      templateUsed: 'bathroom_renovation',
      notes: 'Generated from bathroom inspection analysis'
    },
    createdAt: '2023-12-05T11:00:00Z',
    updatedAt: '2023-12-05T11:00:00Z'
  }
];

// Fake processing records
const fakeProcessingRecords = [
  {
    id: 1,
    projectId: 1,
    reportType: 'picra',
    status: 'completed',
    fileInfo: {
      originalName: 'Property_PICRA_Report.pdf',
      fileSize: 2048576,
      uploadDate: '2023-11-01T10:30:00Z'
    },
    openAIResults: {
      summary: 'Comprehensive property condition assessment with detailed repair recommendations.',
      totalEstimatedCost: 12500,
      repairItems: [
        {
          category: 'Roof',
          description: 'Replace damaged shingles and repair flashing',
          estimatedCost: 3500
        },
        {
          category: 'Electrical',
          description: 'Update electrical panel and wiring',
          estimatedCost: 4200
        },
        {
          category: 'Plumbing',
          description: 'Fix leaky pipes and replace fixtures',
          estimatedCost: 2800
        },
        {
          category: 'HVAC',
          description: 'Service and repair heating system',
          estimatedCost: 2000
        }
      ]
    },
    createdAt: '2023-11-01T10:30:00Z',
    completedAt: '2023-11-01T10:45:00Z'
  },
  {
    id: 2,
    projectId: 1,
    reportType: 'inspection',
    status: 'completed',
    fileInfo: {
      originalName: 'Home_Inspection_Report.pdf',
      fileSize: 1536000,
      uploadDate: '2023-11-01T11:00:00Z'
    },
    openAIResults: {
      summary: 'Detailed home inspection findings with safety and maintenance recommendations.',
      totalEstimatedCost: 8900,
      repairItems: [
        {
          category: 'Safety',
          description: 'Install smoke detectors and carbon monoxide alarms',
          estimatedCost: 300
        },
        {
          category: 'Structural',
          description: 'Repair foundation cracks and reinforce support beams',
          estimatedCost: 5600
        },
        {
          category: 'Interior',
          description: 'Fix drywall and paint touch-ups',
          estimatedCost: 3000
        }
      ]
    },
    createdAt: '2023-11-01T11:00:00Z',
    completedAt: '2023-11-01T11:15:00Z'
  }
];

// Fake users data
const fakeUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'admin',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-02-20T14:30:00Z'
  },
  {
    id: 3,
    firstName: 'Emily',
    lastName: 'Clark',
    email: 'emily.clark@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: true,
    waitlistReason: 'Multiple failed login attempts',
    createdAt: '2023-10-15T09:00:00Z'
  },
  {
    id: 4,
    firstName: 'Michael',
    lastName: 'Smith',
    email: 'michael.smith@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-10-14T11:30:00Z'
  },
  {
    id: 5,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-10-13T14:15:00Z'
  },
  {
    id: 6,
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: true,
    waitlistReason: 'Suspicious activity detected',
    createdAt: '2023-10-12T16:45:00Z'
  },
  {
    id: 7,
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'lisa.brown@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-10-11T10:20:00Z'
  },
  {
    id: 8,
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'robert.davis@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-10-10T13:30:00Z'
  },
  {
    id: 9,
    firstName: 'Jennifer',
    lastName: 'Miller',
    email: 'jennifer.miller@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-10-09T15:45:00Z'
  },
  {
    id: 10,
    firstName: 'Thomas',
    lastName: 'Anderson',
    email: 'thomas.anderson@email.com',
    role: 'client',
    isActive: true,
    isWaitlisted: false,
    createdAt: '2023-10-08T12:00:00Z'
  }
];

// Fake reports data
const fakeReports = [
  {
    id: 1,
    projectId: 1,
    reportType: 'picra',
    title: 'Property PICRA Report',
    description: 'Comprehensive property condition assessment',
    fileUrl: '/uploads/picra-report-1.pdf',
    fileName: 'Property_PICRA_Report.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    status: 'approved',
    uploadedBy: 1,
    createdAt: '2023-11-01T10:30:00Z'
  },
  {
    id: 2,
    projectId: 1,
    reportType: 'inspection',
    title: 'Home Inspection Report',
    description: 'Detailed home inspection findings',
    fileUrl: '/uploads/inspection-report-1.pdf',
    fileName: 'Home_Inspection_Report.pdf',
    fileSize: 1536000,
    mimeType: 'application/pdf',
    status: 'approved',
    uploadedBy: 1,
    createdAt: '2023-11-01T11:00:00Z'
  }
];

class FakeDataService {
  constructor() {
    this.projects = [...fakeProjects];
    this.processingRecords = [...fakeProcessingRecords];
    this.users = [...fakeUsers];
    this.reports = [...fakeReports];
    this.quotes = [...fakeQuotes];
    this.nextProjectId = Math.max(...this.projects.map(p => p.id)) + 1;
    this.nextProcessingId = Math.max(...this.processingRecords.map(p => p.id)) + 1;
    this.nextReportId = Math.max(...this.reports.map(r => r.id)) + 1;
    this.nextQuoteId = Math.max(...this.quotes.map(q => q.id)) + 1;
  }

  // Health check
  async healthCheck() {
    await delay(100);
    return { status: 'healthy', message: 'Fake data service is running' };
  }

  // OTP operations
  async sendOTP(email, type = 'login') {
    await delay(500);
    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this._lastGeneratedOtp = generatedOtp; // Store for verification
    console.log(`Fake OTP sent to ${email} for ${type}`);
    console.log(`🔐 [FAKE] OTP Code: ${generatedOtp}`);
    return {
      success: true,
      message: `OTP sent to ${email} (fake)`,
      email: email,
      devOtp: generatedOtp, // Include OTP in response for dev mode display
      note: `Use OTP code: ${generatedOtp}`
    };
  }

  async verifyOTP(email, otp, type = 'login') {
    await delay(300);
    if (otp === this._lastGeneratedOtp) {
      const user = this.users.find(u => u.email === email);
      if (user) {
        return {
          success: true,
          message: 'OTP verified successfully (fake)',
          user: user,
          token: `fake-jwt-token-${user.id}`
        };
      }
    }
    throw new Error('Invalid OTP (fake)');
  }

  // User operations
  async createUser(userData) {
    await delay(600);
    const newUser = {
      ...userData,
      id: this.users.length + 1,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return {
      success: true,
      message: 'User created successfully (fake)',
      user: newUser
    };
  }

  async getUserProfile() {
    await delay(300);
    // Return the first user as the current user
    return this.users[0];
  }

  async getUserStats() {
    await delay(100);
    return {
      admin: { total: 3, recent: 1, active: 2, percentage: 15 },
      waitlist: { total: 5, recent: 2, active: 3, percentage: 25 },
      client: { total: 12, recent: 8, active: 10, percentage: 60 },
      total: 20
    };
  }

  async getUsersByType(type, params = {}) {
    await delay(600);
    const users = {
      admin: [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          company: 'ABC Construction',
          role: 'admin',
          isActive: true,
          createdAt: '2023-01-15T10:00:00Z',
          lastLogin: '2023-12-01T14:30:00Z'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          company: 'XYZ Corp',
          role: 'admin',
          isActive: true,
          createdAt: '2023-02-20T09:00:00Z',
          lastLogin: '2023-12-01T12:15:00Z'
        },
        {
          id: 3,
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@example.com',
          company: 'Construction Co',
          role: 'admin',
          isActive: false,
          createdAt: '2023-03-10T11:00:00Z',
          lastLogin: '2023-11-15T16:45:00Z'
        }
      ],
      waitlist: [
        {
          id: 4,
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob.wilson@example.com',
          company: 'Wilson Builders',
          role: 'waitlist',
          isActive: true,
          createdAt: '2023-04-05T08:00:00Z',
          lastLogin: '2023-12-01T10:20:00Z'
        },
        {
          id: 5,
          firstName: 'Sarah',
          lastName: 'Brown',
          email: 'sarah.brown@example.com',
          company: 'Brown Construction',
          role: 'waitlist',
          isActive: true,
          createdAt: '2023-05-12T14:00:00Z',
          lastLogin: '2023-11-30T09:30:00Z'
        }
      ],
      client: [
        {
          id: 6,
          firstName: 'Alice',
          lastName: 'Davis',
          email: 'alice.davis@example.com',
          company: 'Davis Properties',
          role: 'client',
          isActive: true,
          createdAt: '2023-06-01T10:00:00Z',
          lastLogin: '2023-12-01T15:00:00Z'
        },
        {
          id: 7,
          firstName: 'Tom',
          lastName: 'Miller',
          email: 'tom.miller@example.com',
          company: 'Miller Homes',
          role: 'client',
          isActive: true,
          createdAt: '2023-07-15T11:00:00Z',
          lastLogin: '2023-11-29T13:45:00Z'
        }
      ]
    };
    
    return { users: users[type] || [] };
  }

  async updateUserProfile(userData) {
    await delay(400);
    const user = this.users[0];
    const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
    this.users[0] = updatedUser;
    return {
      success: true,
      message: 'Profile updated successfully (fake)',
      user: updatedUser
    };
  }

  async getUsers() {
    await delay(400);
    return this.users;
  }

  async deleteUser(userId) {
    await delay(400);
    const index = this.users.findIndex(u => u.id === parseInt(userId) || u._id === userId);
    if (index === -1) {
      throw new Error('User not found (fake)');
    }
    
    this.users.splice(index, 1);
    return {
      success: true,
      message: 'User deleted successfully (fake)'
    };
  }

  // Project operations
  async getProjects() {
    await delay(50);
    return this.projects;
  }

  async getProject(id) {
    await delay(300);
    const project = this.projects.find(p => p.id === parseInt(id));
    if (!project) {
      throw new Error('Project not found (fake)');
    }
    return project;
  }

  async createProject(projectData) {
    await delay(600);
    const newProject = {
      ...projectData,
      id: this.nextProjectId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.push(newProject);
    return {
      success: true,
      message: 'Project created successfully (fake)',
      project: newProject
    };
  }

  async updateProject(id, projectData) {
    await delay(500);
    const index = this.projects.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error('Project not found (fake)');
    }
    
    this.projects[index] = {
      ...this.projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: 'Project updated successfully (fake)',
      project: this.projects[index]
    };
  }

  async deleteProject(id) {
    await delay(400);
    const index = this.projects.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error('Project not found (fake)');
    }
    
    this.projects.splice(index, 1);
    return {
      success: true,
      message: 'Project deleted successfully (fake)'
    };
  }

  // Report operations
  async getReports() {
    await delay(50);
    return this.reports;
  }

  async getReport(id) {
    await delay(300);
    const report = this.reports.find(r => r.id === parseInt(id));
    if (!report) {
      throw new Error('Report not found (fake)');
    }
    return report;
  }

  async createReport(reportData) {
    await delay(500);
    const newReport = {
      ...reportData,
      id: this.nextReportId++,
      createdAt: new Date().toISOString()
    };
    this.reports.push(newReport);
    return {
      success: true,
      message: 'Report created successfully (fake)',
      report: newReport
    };
  }

  async updateReport(id, reportData) {
    await delay(400);
    const index = this.reports.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Report not found (fake)');
    }
    
    this.reports[index] = {
      ...this.reports[index],
      ...reportData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: 'Report updated successfully (fake)',
      report: this.reports[index]
    };
  }

  async deleteReport(id) {
    await delay(300);
    const index = this.reports.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Report not found (fake)');
    }
    
    this.reports.splice(index, 1);
    return {
      success: true,
      message: 'Report deleted successfully (fake)'
    };
  }

  // File upload operations
  async uploadFile(file, type = 'report') {
    await delay(800);
    console.log(`Fake file upload: ${file.name} (${type})`);
    return {
      success: true,
      message: 'File uploaded successfully (fake)',
      fileUrl: `/uploads/${file.name}`,
      fileName: file.name,
      fileSize: file.size
    };
  }

  async uploadFileWithMetadata(formData) {
    await delay(1000);
    const file = formData.get('file');
    const projectId = formData.get('projectId');
    const reportType = formData.get('reportType');

    console.log(`Fake file upload with metadata: ${file.name} for project ${projectId}`);

    // Create a processing record
    const processingRecord = {
      id: this.nextProcessingId++,
      projectId: parseInt(projectId),
      reportType: reportType,
      status: 'processing',
      fileInfo: {
        originalName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    this.processingRecords.push(processingRecord);

    return {
      success: true,
      message: 'File uploaded and processing started (fake)',
      processingId: processingRecord.id,
      status: 'processing'
    };
  }

  // PICRA Processing operations
  async uploadPICRAForProcessing(formData) {
    return this.uploadFileWithMetadata(formData);
  }

  async getPICRAProcessingStatus(processingId) {
    await delay(300);
    const record = this.processingRecords.find(r => r.id === parseInt(processingId));
    if (!record) {
      throw new Error('Processing record not found (fake)');
    }
    return record;
  }

  async getPICRAProcessingResults(processingId) {
    await delay(400);
    const record = this.processingRecords.find(r => r.id === parseInt(processingId));
    if (!record) {
      throw new Error('Processing record not found (fake)');
    }
    return record;
  }

  async getUserPICRAProcessingRecords(page = 1, limit = 10) {
    await delay(500);
    const start = (page - 1) * limit;
    const end = start + limit;
    const records = this.processingRecords.slice(start, end);
    
    return {
      processingRecords: records,
      pagination: {
        current: page,
        total: Math.ceil(this.processingRecords.length / limit),
        hasNext: end < this.processingRecords.length,
        hasPrev: page > 1
      }
    };
  }

  async getProjectPICRAProcessingRecords(projectId, page = 1, limit = 10) {
    await delay(400);
    const projectRecords = this.processingRecords.filter(r => r.projectId === parseInt(projectId));
    const start = (page - 1) * limit;
    const end = start + limit;
    const records = projectRecords.slice(start, end);
    
    return {
      processingRecords: records,
      pagination: {
        current: page,
        total: Math.ceil(projectRecords.length / limit),
        hasNext: end < projectRecords.length,
        hasPrev: page > 1
      }
    };
  }

  async retryPICRAProcessing(processingId) {
    await delay(600);
    const record = this.processingRecords.find(r => r.id === parseInt(processingId));
    if (!record) {
      throw new Error('Processing record not found (fake)');
    }
    
    record.status = 'processing';
    record.updatedAt = new Date().toISOString();
    
    return {
      success: true,
      message: 'Processing retry initiated (fake)',
      processingId: record.id,
      status: record.status
    };
  }

  async deletePICRAProcessingRecord(processingId) {
    await delay(400);
    const index = this.processingRecords.findIndex(r => r.id === parseInt(processingId));
    if (index === -1) {
      throw new Error('Processing record not found (fake)');
    }
    
    this.processingRecords.splice(index, 1);
    return {
      success: true,
      message: 'Processing record deleted successfully (fake)'
    };
  }

  async getPICRAProcessingStats() {
    await delay(50);
    const total = this.processingRecords.length;
    const completed = this.processingRecords.filter(r => r.status === 'completed').length;
    const processing = this.processingRecords.filter(r => r.status === 'processing').length;
    const failed = this.processingRecords.filter(r => r.status === 'failed').length;
    
    return {
      totalRecords: total,
      completedRecords: completed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalEstimatedCost: 25000,
      totalQuoteValue: 30000,
      statusBreakdown: {
        completed: completed,
        processing: processing,
        failed: failed,
        pending: total - completed - processing - failed
      }
    };
  }

  // Quote Management
  async getQuotes(params = {}) {
    await delay(50);
    const { status, page = 1, limit = 10, search } = params;
    
    let filteredQuotes = [...this.quotes];
    
    if (status) {
      filteredQuotes = filteredQuotes.filter(quote => quote.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.quoteNumber.toLowerCase().includes(searchLower) ||
        quote.title.toLowerCase().includes(searchLower) ||
        quote.customer.name.toLowerCase().includes(searchLower) ||
        quote.customer.email.toLowerCase().includes(searchLower)
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedQuotes = filteredQuotes.slice(start, end);
    
    return {
      quotes: paginatedQuotes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(filteredQuotes.length / limit),
        hasNext: end < filteredQuotes.length,
        hasPrev: page > 1
      }
    };
  }

  async getQuote(quoteId) {
    await delay(300);
    const quote = this.quotes.find(q => q.id === parseInt(quoteId) || q._id === quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }
    return quote;
  }

  async createQuote(quoteData) {
    await delay(800);
    const quote = {
      id: this.nextQuoteId++,
      ...quoteData,
      quoteNumber: `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(this.nextQuoteId).padStart(3, '0')}`,
      status: 'draft',
      approval: {
        status: 'pending',
        requestedAt: null,
        respondedAt: null
      },
      communications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.quotes.push(quote);
    return {
      message: 'Quote created successfully',
      quote
    };
  }

  async updateQuote(quoteId, quoteData) {
    await delay(500);
    const quoteIndex = this.quotes.findIndex(q => q.id === parseInt(quoteId) || q._id === quoteId);
    if (quoteIndex === -1) {
      throw new Error('Quote not found');
    }
    
    this.quotes[quoteIndex] = {
      ...this.quotes[quoteIndex],
      ...quoteData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      message: 'Quote updated successfully',
      quote: this.quotes[quoteIndex]
    };
  }

  async sendQuote(quoteId) {
    await delay(600);
    const quoteIndex = this.quotes.findIndex(q => q.id === parseInt(quoteId) || q._id === quoteId);
    if (quoteIndex === -1) {
      throw new Error('Quote not found');
    }
    
    this.quotes[quoteIndex].status = 'sent';
    this.quotes[quoteIndex].approval.requestedAt = new Date().toISOString();
    this.quotes[quoteIndex].communications.push({
      type: 'email',
      subject: `Quote ${this.quotes[quoteIndex].quoteNumber} - ${this.quotes[quoteIndex].title}`,
      message: `Your quote ${this.quotes[quoteIndex].quoteNumber} has been sent. Please review and respond.`,
      sentAt: new Date().toISOString(),
      sentBy: { id: 1, firstName: 'Admin', lastName: 'User' },
      recipient: this.quotes[quoteIndex].customer.email,
      status: 'sent'
    });
    
    return {
      message: 'Quote sent to customer successfully',
      quote: this.quotes[quoteIndex]
    };
  }

  async updateQuoteApproval(quoteId, status, customerResponse = null, customerNotes = null) {
    await delay(500);
    const quoteIndex = this.quotes.findIndex(q => q.id === parseInt(quoteId) || q._id === quoteId);
    if (quoteIndex === -1) {
      throw new Error('Quote not found');
    }
    
    this.quotes[quoteIndex].approval.status = status;
    this.quotes[quoteIndex].approval.respondedAt = new Date().toISOString();
    
    if (customerResponse) {
      this.quotes[quoteIndex].approval.customerResponse = customerResponse;
    }
    
    if (customerNotes) {
      this.quotes[quoteIndex].approval.customerNotes = customerNotes;
    }
    
    if (status === 'approved') {
      this.quotes[quoteIndex].status = 'approved';
    } else if (status === 'rejected') {
      this.quotes[quoteIndex].status = 'rejected';
    }
    
    return {
      message: 'Quote approval status updated successfully',
      quote: this.quotes[quoteIndex]
    };
  }

  async getPendingApprovalQuotes() {
    await delay(50);
    const pendingQuotes = this.quotes.filter(quote => 
      quote.approval.status === 'pending' && quote.status === 'sent'
    );
    
    return {
      quotes: pendingQuotes
    };
  }

  async addQuoteCommunication(quoteId, communicationData) {
    await delay(400);
    const quoteIndex = this.quotes.findIndex(q => q.id === parseInt(quoteId) || q._id === quoteId);
    if (quoteIndex === -1) {
      throw new Error('Quote not found');
    }
    
    const communication = {
      ...communicationData,
      sentAt: new Date().toISOString(),
      sentBy: { id: 1, firstName: 'Admin', lastName: 'User' }
    };
    
    this.quotes[quoteIndex].communications.push(communication);
    
    return {
      message: 'Communication record added successfully',
      quote: this.quotes[quoteIndex]
    };
  }

  async deleteQuote(quoteId) {
    await delay(300);
    const quoteIndex = this.quotes.findIndex(q => q.id === parseInt(quoteId) || q._id === quoteId);
    if (quoteIndex === -1) {
      throw new Error('Quote not found');
    }
    
    this.quotes[quoteIndex].isActive = false;
    
    return {
      message: 'Quote deleted successfully'
    };
  }

  async getQuoteStats() {
    await delay(300);
    const total = this.quotes.length;
    const totalValue = this.quotes.reduce((sum, quote) => sum + (quote.total || 0), 0);
    
    const byStatus = this.quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {});
    
    const byApprovalStatus = this.quotes.reduce((acc, quote) => {
      acc[quote.approval.status] = (acc[quote.approval.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total,
      totalValue,
      byStatus,
      byApprovalStatus
    };
  }
}

export default FakeDataService; 
