/**
 * @fileoverview Enhanced Seed Data Script with Global & Recruiter Sample Data
 * @description Creates comprehensive MongoDB data including students, resumes, academics, and aptitude tests
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import StudentDetails from './models/StudentDetails.js';
import Resume from './models/Resume.js';
import AcademicDetail from './models/AcademicDetail.js';
import AptitudeResult from './models/AptitudeResult.js';
import AptitudeTest from './models/AptitudeTest.js';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/student');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      StudentDetails.deleteMany({}),
      Resume.deleteMany({}),
      AcademicDetail.deleteMany({}),
      AptitudeResult.deleteMany({})
    ]);
    console.log('✅ Database cleared\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('Test123', 10);

    // ==================== COMPREHENSIVE STUDENT DATA ====================
    console.log('👥 Creating 20 diverse student profiles...\n');

    const studentsData = [
      // Top Performers (Tier 1)
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        phoneNumber: '9876543211',
        address: '456 Code Avenue, Bangalore',
        pincode: '560001',
        dateOfBirth: '2000-03-20',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Emily Chen',
        email: 'emily@example.com',
        password: hashedPassword,
        phoneNumber: '9876543215',
        address: '987 Cloud Street, Hyderabad',
        pincode: '500001',
        dateOfBirth: '2001-02-14',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: hashedPassword,
        phoneNumber: '9876543213',
        address: '321 Innovation Park, Delhi',
        pincode: '110001',
        dateOfBirth: '2000-11-05',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      // Strong Performers (Tier 2)
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phoneNumber: '9876543210',
        address: '123 Tech Street, Mumbai',
        pincode: '400001',
        dateOfBirth: '1999-05-15',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Michael Brown',
        email: 'michael@example.com',
        password: hashedPassword,
        phoneNumber: '9876543214',
        address: '654 Software Plaza, Pune',
        pincode: '411001',
        dateOfBirth: '1999-07-22',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: hashedPassword,
        phoneNumber: '9876543212',
        address: '789 Developer Road, Chennai',
        pincode: '600001',
        dateOfBirth: '1998-08-10',
        gender: 'other',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      // Mid-Level Performers (Tier 3)
      {
        name: 'David Martinez',
        email: 'david@example.com',
        password: hashedPassword,
        phoneNumber: '9876543216',
        address: '159 Data Avenue, Kolkata',
        pincode: '700001',
        dateOfBirth: '1998-09-30',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa@example.com',
        password: hashedPassword,
        phoneNumber: '9876543217',
        address: '753 Web Lane, Ahmedabad',
        pincode: '380001',
        dateOfBirth: '1999-12-03',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        password: hashedPassword,
        phoneNumber: '9876543218',
        address: '456 Tech Park, Gurgaon',
        pincode: '122001',
        dateOfBirth: '1998-04-12',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        phoneNumber: '9876543219',
        address: '789 Code Street, Noida',
        pincode: '201301',
        dateOfBirth: '2000-06-18',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      // Additional Diverse Candidates (Tier 4)
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        password: hashedPassword,
        phoneNumber: '9876543220',
        address: '321 Developer Lane, Surat',
        pincode: '395001',
        dateOfBirth: '1999-01-25',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Neha Gupta',
        email: 'neha@example.com',
        password: hashedPassword,
        phoneNumber: '9876543221',
        address: '654 Tech Avenue, Jaipur',
        pincode: '302001',
        dateOfBirth: '2000-08-14',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        password: hashedPassword,
        phoneNumber: '9876543222',
        address: '987 Innovation Street, Indore',
        pincode: '452001',
        dateOfBirth: '1998-11-08',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Anjali Verma',
        email: 'anjali@example.com',
        password: hashedPassword,
        phoneNumber: '9876543223',
        address: '123 Code Street, Lucknow',
        pincode: '226001',
        dateOfBirth: '2000-09-22',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Rohit Desai',
        email: 'rohit@example.com',
        password: hashedPassword,
        phoneNumber: '9876543224',
        address: '456 Tech Street, Nagpur',
        pincode: '440001',
        dateOfBirth: '1999-03-17',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Divya Reddy',
        email: 'divya@example.com',
        password: hashedPassword,
        phoneNumber: '9876543225',
        address: '789 Developer Lane, Vizag',
        pincode: '530001',
        dateOfBirth: '2000-05-30',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Arjun Nair',
        email: 'arjun@example.com',
        password: hashedPassword,
        phoneNumber: '9876543226',
        address: '321 Cloud Street, Kochi',
        pincode: '682001',
        dateOfBirth: '1998-07-11',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Sneha Iyer',
        email: 'sneha@example.com',
        password: hashedPassword,
        phoneNumber: '9876543227',
        address: '654 Innovation Street, Bangalore',
        pincode: '560002',
        dateOfBirth: '2001-01-19',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Karan Malhotra',
        email: 'karan@example.com',
        password: hashedPassword,
        phoneNumber: '9876543228',
        address: '987 Code Avenue, Chandigarh',
        pincode: '160001',
        dateOfBirth: '1999-10-28',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Pooja Saxena',
        email: 'pooja@example.com',
        password: hashedPassword,
        phoneNumber: '9876543229',
        address: '123 Tech Lane, Delhi',
        pincode: '110002',
        dateOfBirth: '2000-02-07',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      }
    ];

    const students = await StudentDetails.create(studentsData);
    console.log(`✅ Created ${students.length} students\n`);

    // ==================== RESUMES WITH VARIED ATS SCORES ====================
    console.log('📄 Creating resumes with ATS scores...\n');

    const resumesData = [
      // Jane Smith - Top Performer
      {
        studentId: students[0]._id,
        filename: 'jane_smith_resume.pdf',
        fileUrl: 'uploads/jane_smith_resume.pdf',
        uploadDate: new Date(),
        title: 'Jane Smith - Full Stack Developer',
        contentType: 'application/pdf',
        fullText: 'Experienced full stack developer with 4+ years in Python, Django, PostgreSQL, AWS. Led 5+ successful cloud projects. Expert in microservices architecture.',
        ats: { score: 95, feedback: 'Excellent technical expertise and cloud experience' },
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD', 'Kubernetes'],
        status: 'verified'
      },
      // Emily Chen - Top Performer
      {
        studentId: students[1]._id,
        filename: 'emily_chen_resume.pdf',
        fileUrl: 'uploads/emily_chen_resume.pdf',
        uploadDate: new Date(),
        title: 'Emily Chen - Data Engineer',
        contentType: 'application/pdf',
        fullText: 'Senior data engineer with expertise in big data technologies. Proficient in Apache Spark, Hadoop, and ETL pipelines. 3+ years of hands-on experience.',
        ats: { score: 91, feedback: 'Strong data engineering background and big data expertise' },
        skills: ['Python', 'Spark', 'Hadoop', 'SQL', 'Kafka', 'AWS', 'Scala'],
        status: 'verified'
      },
      // Sarah Williams - Top Performer
      {
        studentId: students[2]._id,
        filename: 'sarah_williams_resume.pdf',
        fileUrl: 'uploads/sarah_williams_resume.pdf',
        uploadDate: new Date(),
        title: 'Sarah Williams - DevOps Engineer',
        contentType: 'application/pdf',
        fullText: 'DevOps specialist with expertise in Kubernetes orchestration. Automated infrastructure using Terraform and Jenkins. 3+ years in cloud technologies.',
        ats: { score: 88, feedback: 'Excellent DevOps and infrastructure automation skills' },
        skills: ['Kubernetes', 'AWS', 'Docker', 'Jenkins', 'Terraform', 'Linux', 'Ansible'],
        status: 'verified'
      },
      // John Doe - Strong Performer
      {
        studentId: students[3]._id,
        filename: 'john_doe_resume.pdf',
        fileUrl: 'uploads/john_doe_resume.pdf',
        uploadDate: new Date(),
        title: 'John Doe - Software Engineer',
        contentType: 'application/pdf',
        fullText: 'Full stack engineer with 3+ years experience. Proficient in JavaScript, React, Node.js, and MongoDB. Built multiple production applications.',
        ats: { score: 85, feedback: 'Strong full stack development background' },
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs', 'Express.js'],
        status: 'verified'
      },
      // Michael Brown - Strong Performer
      {
        studentId: students[4]._id,
        filename: 'michael_brown_resume.pdf',
        fileUrl: 'uploads/michael_brown_resume.pdf',
        uploadDate: new Date(),
        title: 'Michael Brown - Frontend Developer',
        contentType: 'application/pdf',
        fullText: 'Frontend developer with 3+ years in React and Vue.js. Strong understanding of UI/UX principles. Passionate about responsive design.',
        ats: { score: 82, feedback: 'Solid frontend skills and UI/UX understanding' },
        skills: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Jest'],
        status: 'verified'
      },
      // Alex Johnson - Strong Performer
      {
        studentId: students[5]._id,
        filename: 'alex_johnson_resume.pdf',
        fileUrl: 'uploads/alex_johnson_resume.pdf',
        uploadDate: new Date(),
        title: 'Alex Johnson - Backend Developer',
        contentType: 'application/pdf',
        fullText: 'Backend developer specialized in Java and Spring Boot. Experienced with MySQL databases and REST API design. 2.5+ years in backend development.',
        ats: { score: 78, feedback: 'Good backend development experience with Java ecosystem' },
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Microservices', 'JUnit'],
        status: 'verified'
      },
      // David Martinez - Mid-Level
      {
        studentId: students[6]._id,
        filename: 'david_martinez_resume.pdf',
        fileUrl: 'uploads/david_martinez_resume.pdf',
        uploadDate: new Date(),
        title: 'David Martinez - Mobile Developer',
        contentType: 'application/pdf',
        fullText: 'Mobile developer with 2+ years in React Native and Flutter. Published 3+ apps on app stores. Strong understanding of mobile UI patterns.',
        ats: { score: 79, feedback: 'Good mobile development experience with multiple platforms' },
        skills: ['React Native', 'Flutter', 'JavaScript', 'Firebase', 'iOS', 'Android'],
        status: 'verified'
      },
      // Lisa Anderson - Mid-Level
      {
        studentId: students[7]._id,
        filename: 'lisa_anderson_resume.pdf',
        fileUrl: 'uploads/lisa_anderson_resume.pdf',
        uploadDate: new Date(),
        title: 'Lisa Anderson - QA Engineer',
        contentType: 'application/pdf',
        fullText: 'QA engineer with 2+ years in automation testing. Proficient in Selenium and Jest. Strong understanding of testing frameworks and best practices.',
        ats: { score: 75, feedback: 'Solid QA background with test automation expertise' },
        skills: ['Selenium', 'Jest', 'Test Automation', 'Manual Testing', 'JIRA', 'Cypress'],
        status: 'verified'
      },
      // Rajesh Kumar - Mid-Level
      {
        studentId: students[8]._id,
        filename: 'rajesh_kumar_resume.pdf',
        fileUrl: 'uploads/rajesh_kumar_resume.pdf',
        uploadDate: new Date(),
        title: 'Rajesh Kumar - Full Stack Developer',
        contentType: 'application/pdf',
        fullText: 'Full stack developer with 2+ years experience in web technologies. Experienced with MERN stack and cloud deployments.',
        ats: { score: 76, feedback: 'Competent full stack developer with MERN experience' },
        skills: ['MongoDB', 'Express', 'React', 'Node.js', 'AWS', 'Git'],
        status: 'verified'
      },
      // Priya Sharma - Mid-Level
      {
        studentId: students[9]._id,
        filename: 'priya_sharma_resume.pdf',
        fileUrl: 'uploads/priya_sharma_resume.pdf',
        uploadDate: new Date(),
        title: 'Priya Sharma - Python Developer',
        contentType: 'application/pdf',
        fullText: 'Python developer with 2+ years in Django and Flask. Strong problem-solving skills. Experience with REST APIs and database design.',
        ats: { score: 73, feedback: 'Good Python and web development experience' },
        skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'REST APIs', 'Git'],
        status: 'verified'
      },
      // Amit Patel - Entry-Level
      {
        studentId: students[10]._id,
        filename: 'amit_patel_resume.pdf',
        fileUrl: 'uploads/amit_patel_resume.pdf',
        uploadDate: new Date(),
        title: 'Amit Patel - Junior Developer',
        contentType: 'application/pdf',
        fullText: 'Junior developer with 1.5+ years in web development. Familiar with JavaScript and Python. Eager to learn new technologies.',
        ats: { score: 68, feedback: 'Entry-level developer with foundational skills' },
        skills: ['JavaScript', 'Python', 'HTML/CSS', 'React', 'MySQL'],
        status: 'verified'
      },
      // Neha Gupta - Entry-Level
      {
        studentId: students[11]._id,
        filename: 'neha_gupta_resume.pdf',
        fileUrl: 'uploads/neha_gupta_resume.pdf',
        uploadDate: new Date(),
        title: 'Neha Gupta - Frontend Developer',
        contentType: 'application/pdf',
        fullText: 'Frontend developer with 1+ year experience in HTML, CSS, JavaScript. Learning React and modern web technologies.',
        ats: { score: 65, feedback: 'Entry-level frontend developer with foundational skills' },
        skills: ['HTML/CSS', 'JavaScript', 'React Basics', 'Git', 'Bootstrap'],
        status: 'verified'
      },
      // Vikram Singh - Entry-Level
      {
        studentId: students[12]._id,
        filename: 'vikram_singh_resume.pdf',
        fileUrl: 'uploads/vikram_singh_resume.pdf',
        uploadDate: new Date(),
        title: 'Vikram Singh - Java Developer',
        contentType: 'application/pdf',
        fullText: 'Java developer with 1.5+ years experience. Familiar with core Java and basic Spring. Strong problem-solving abilities.',
        ats: { score: 71, feedback: 'Entry-level Java developer with core competencies' },
        skills: ['Java', 'Spring Basics', 'MySQL', 'OOP Concepts', 'Maven'],
        status: 'verified'
      },
      // Anjali Verma - Entry-Level
      {
        studentId: students[13]._id,
        filename: 'anjali_verma_resume.pdf',
        fileUrl: 'uploads/anjali_verma_resume.pdf',
        uploadDate: new Date(),
        title: 'Anjali Verma - Web Developer',
        contentType: 'application/pdf',
        fullText: 'Web developer with 1+ year in web technologies. Proficient in HTML/CSS and JavaScript. Currently learning React.',
        ats: { score: 62, feedback: 'Entry-level web developer with basic technical skills' },
        skills: ['HTML/CSS', 'JavaScript', 'Bootstrap', 'Responsive Design'],
        status: 'verified'
      },
      // Rohit Desai - Mid-Level
      {
        studentId: students[14]._id,
        filename: 'rohit_desai_resume.pdf',
        fileUrl: 'uploads/rohit_desai_resume.pdf',
        uploadDate: new Date(),
        title: 'Rohit Desai - Database Administrator',
        contentType: 'application/pdf',
        fullText: 'Database admin with 2+ years experience in MySQL and PostgreSQL. Expertise in query optimization and database design.',
        ats: { score: 77, feedback: 'Strong database administration and optimization skills' },
        skills: ['MySQL', 'PostgreSQL', 'SQL', 'Database Design', 'Performance Tuning'],
        status: 'verified'
      },
      // Divya Reddy - Mid-Level
      {
        studentId: students[15]._id,
        filename: 'divya_reddy_resume.pdf',
        fileUrl: 'uploads/divya_reddy_resume.pdf',
        uploadDate: new Date(),
        title: 'Divya Reddy - Cloud Developer',
        contentType: 'application/pdf',
        fullText: 'Cloud developer with 2+ years in AWS and Azure. Experienced with cloud architecture and serverless technologies.',
        ats: { score: 80, feedback: 'Good cloud development experience with major cloud providers' },
        skills: ['AWS', 'Azure', 'Cloud Architecture', 'Lambda', 'CloudFormation'],
        status: 'verified'
      },
      // Arjun Nair - Strong Performer
      {
        studentId: students[16]._id,
        filename: 'arjun_nair_resume.pdf',
        fileUrl: 'uploads/arjun_nair_resume.pdf',
        uploadDate: new Date(),
        title: 'Arjun Nair - Software Architect',
        contentType: 'application/pdf',
        fullText: 'Software architect with 3+ years in designing scalable systems. Expert in microservices and system design patterns.',
        ats: { score: 87, feedback: 'Excellent system design and architecture expertise' },
        skills: ['System Design', 'Microservices', 'Java', 'Spring Cloud', 'Architecture Patterns'],
        status: 'verified'
      },
      // Sneha Iyer - Top Performer
      {
        studentId: students[17]._id,
        filename: 'sneha_iyer_resume.pdf',
        fileUrl: 'uploads/sneha_iyer_resume.pdf',
        uploadDate: new Date(),
        title: 'Sneha Iyer - Full Stack Engineer',
        contentType: 'application/pdf',
        fullText: 'Full stack engineer with 3+ years in MERN stack and cloud technologies. Led cross-functional teams and delivered multiple projects.',
        ats: { score: 89, feedback: 'Strong full stack engineer with leadership experience' },
        skills: ['MongoDB', 'Express', 'React', 'Node.js', 'AWS', 'GraphQL', 'Leadership'],
        status: 'verified'
      },
      // Karan Malhotra - Strong Performer
      {
        studentId: students[18]._id,
        filename: 'karan_malhotra_resume.pdf',
        fileUrl: 'uploads/karan_malhotra_resume.pdf',
        uploadDate: new Date(),
        title: 'Karan Malhotra - AI/ML Developer',
        contentType: 'application/pdf',
        fullText: 'AI/ML developer with 2.5+ years in machine learning. Experienced with TensorFlow, PyTorch, and data science workflows.',
        ats: { score: 84, feedback: 'Strong AI/ML background with practical experience' },
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'Machine Learning', 'NumPy'],
        status: 'verified'
      },
      // Pooja Saxena - Strong Performer
      {
        studentId: students[19]._id,
        filename: 'pooja_saxena_resume.pdf',
        fileUrl: 'uploads/pooja_saxena_resume.pdf',
        uploadDate: new Date(),
        title: 'Pooja Saxena - Security Engineer',
        contentType: 'application/pdf',
        fullText: 'Security engineer with 2+ years in application security and vulnerability management. Experienced with security tools and compliance.',
        ats: { score: 81, feedback: 'Solid security engineering expertise' },
        skills: ['Security', 'Vulnerability Assessment', 'Penetration Testing', 'OWASP', 'Linux'],
        status: 'verified'
      }
    ];

    const resumes = await Resume.create(resumesData);
    console.log(`✅ Created ${resumes.length} resumes\n`);

    // ==================== ACADEMIC DETAILS ====================
    console.log('🎓 Creating academic records...\n');

    const academicsData = [
      { studentId: students[0]._id, schoolName: 'Delhi University', degree: 'B.Tech', major: 'CSE', startDate: '2018-08-01', endDate: '2022-05-30', grade: '92.3', maxGrade: '100', status: 'completed' },
      { studentId: students[1]._id, schoolName: 'IIT Bombay', degree: 'B.Tech', major: 'IT', startDate: '2019-08-01', endDate: '2023-05-30', grade: '94.2', maxGrade: '100', status: 'completed' },
      { studentId: students[2]._id, schoolName: 'NIT Delhi', degree: 'B.Tech', major: 'CSE', startDate: '2018-08-01', endDate: '2022-05-30', grade: '90.1', maxGrade: '100', status: 'completed' },
      { studentId: students[3]._id, schoolName: 'Manipal University', degree: 'B.Tech', major: 'CSE', startDate: '2017-08-01', endDate: '2021-05-30', grade: '85.5', maxGrade: '100', status: 'completed' },
      { studentId: students[4]._id, schoolName: 'VIT Vellore', degree: 'B.Tech', major: 'ECE', startDate: '2017-08-01', endDate: '2021-05-30', grade: '82.5', maxGrade: '100', status: 'completed' },
      { studentId: students[5]._id, schoolName: 'Anna University', degree: 'B.E.', major: 'CSE', startDate: '2016-08-01', endDate: '2020-05-30', grade: '88.7', maxGrade: '100', status: 'completed' },
      { studentId: students[6]._id, schoolName: 'Pune University', degree: 'B.Tech', major: 'IT', startDate: '2016-08-01', endDate: '2020-05-30', grade: '79.8', maxGrade: '100', status: 'completed' },
      { studentId: students[7]._id, schoolName: 'BITS Pilani', degree: 'B.Tech', major: 'CSE', startDate: '2017-08-01', endDate: '2021-05-30', grade: '86.4', maxGrade: '100', status: 'completed' },
      { studentId: students[8]._id, schoolName: 'SRM University', degree: 'B.Tech', major: 'IT', startDate: '2018-08-01', endDate: '2022-05-30', grade: '81.2', maxGrade: '100', status: 'completed' },
      { studentId: students[9]._id, schoolName: 'Bharati Vidyapeeth', degree: 'B.Tech', major: 'CSE', startDate: '2020-08-01', endDate: '2024-05-30', grade: '87.9', maxGrade: '100', status: 'completed' },
      { studentId: students[10]._id, schoolName: 'Amity University', degree: 'B.Tech', major: 'IT', startDate: '2019-08-01', endDate: '2023-05-30', grade: '73.5', maxGrade: '100', status: 'completed' },
      { studentId: students[11]._id, schoolName: 'Lovely Professional University', degree: 'B.Tech', major: 'CSE', startDate: '2020-08-01', endDate: '2024-05-30', grade: '75.8', maxGrade: '100', status: 'completed' },
      { studentId: students[12]._id, schoolName: 'Chandigarh University', degree: 'B.Tech', major: 'IT', startDate: '2018-08-01', endDate: '2022-05-30', grade: '78.3', maxGrade: '100', status: 'completed' },
      { studentId: students[13]._id, schoolName: 'Shobhit University', degree: 'B.Tech', major: 'CSE', startDate: '2020-08-01', endDate: '2024-05-30', grade: '72.1', maxGrade: '100', status: 'completed' },
      { studentId: students[14]._id, schoolName: 'Dr. Babasaheb Ambedkar University', degree: 'B.Tech', major: 'IT', startDate: '2017-08-01', endDate: '2021-05-30', grade: '83.6', maxGrade: '100', status: 'completed' },
      { studentId: students[15]._id, schoolName: 'JNTU Hyderabad', degree: 'B.Tech', major: 'CSE', startDate: '2017-08-01', endDate: '2021-05-30', grade: '89.2', maxGrade: '100', status: 'completed' },
      { studentId: students[16]._id, schoolName: 'CUSAT', degree: 'B.Tech', major: 'IT', startDate: '2016-08-01', endDate: '2020-05-30', grade: '91.5', maxGrade: '100', status: 'completed' },
      { studentId: students[17]._id, schoolName: 'JSS Academy', degree: 'B.Tech', major: 'CSE', startDate: '2019-08-01', endDate: '2023-05-30', grade: '93.7', maxGrade: '100', status: 'completed' },
      { studentId: students[18]._id, schoolName: 'Punjab Engineering College', degree: 'B.Tech', major: 'IT', startDate: '2018-08-01', endDate: '2022-05-30', grade: '84.9', maxGrade: '100', status: 'completed' },
      { studentId: students[19]._id, schoolName: 'Symbiosis', degree: 'B.Tech', major: 'CSE', startDate: '2020-08-01', endDate: '2024-05-30', grade: '88.5', maxGrade: '100', status: 'completed' }
    ];

    const academics = await AcademicDetail.create(academicsData);
    console.log(`✅ Created ${academics.length} academic records\n`);

    // ==================== APTITUDE TESTS ====================
    console.log('📝 Creating aptitude tests...\n');

    const testsData = students.map(student => ({
      studentId: student._id,
      questions: [
        {
          questionText: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
          correctAnswer: '1',
          topic: 'Technical Skills'
        }
      ],
      status: 'completed'
    }));

    const tests = await AptitudeTest.create(testsData);
    console.log(`✅ Created ${tests.length} aptitude tests\n`);

    // ==================== APTITUDE RESULTS ====================
    console.log('🎯 Creating aptitude results...\n');

    const resultsData = [
      { studentId: students[0]._id, testId: tests[0]._id, overallScore: 95, sectionScores: { technical: 95, logical: 92, verbal: 98 }, completionTime: 38, status: 'completed', answers: [{ questionId: tests[0].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[1]._id, testId: tests[1]._id, overallScore: 93, sectionScores: { technical: 93, logical: 94, verbal: 92 }, completionTime: 40, status: 'completed', answers: [{ questionId: tests[1].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[2]._id, testId: tests[2]._id, overallScore: 88, sectionScores: { technical: 88, logical: 87, verbal: 89 }, completionTime: 42, status: 'completed', answers: [{ questionId: tests[2].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[3]._id, testId: tests[3]._id, overallScore: 82, sectionScores: { technical: 82, logical: 80, verbal: 85 }, completionTime: 45, status: 'completed', answers: [{ questionId: tests[3].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[4]._id, testId: tests[4]._id, overallScore: 81, sectionScores: { technical: 81, logical: 79, verbal: 84 }, completionTime: 48, status: 'completed', answers: [{ questionId: tests[4].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[5]._id, testId: tests[5]._id, overallScore: 78, sectionScores: { technical: 78, logical: 75, verbal: 80 }, completionTime: 50, status: 'completed', answers: [{ questionId: tests[5].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[6]._id, testId: tests[6]._id, overallScore: 76, sectionScores: { technical: 76, logical: 74, verbal: 78 }, completionTime: 52, status: 'completed', answers: [{ questionId: tests[6].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[7]._id, testId: tests[7]._id, overallScore: 85, sectionScores: { technical: 85, logical: 83, verbal: 87 }, completionTime: 46, status: 'completed', answers: [{ questionId: tests[7].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[8]._id, testId: tests[8]._id, overallScore: 75, sectionScores: { technical: 75, logical: 72, verbal: 77 }, completionTime: 55, status: 'completed', answers: [{ questionId: tests[8].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[9]._id, testId: tests[9]._id, overallScore: 73, sectionScores: { technical: 73, logical: 71, verbal: 75 }, completionTime: 58, status: 'completed', answers: [{ questionId: tests[9].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[10]._id, testId: tests[10]._id, overallScore: 68, sectionScores: { technical: 68, logical: 65, verbal: 70 }, completionTime: 60, status: 'completed', answers: [{ questionId: tests[10].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[11]._id, testId: tests[11]._id, overallScore: 65, sectionScores: { technical: 65, logical: 62, verbal: 67 }, completionTime: 62, status: 'completed', answers: [{ questionId: tests[11].questions[0]._id, selectedOption: 0 }] },
      { studentId: students[12]._id, testId: tests[12]._id, overallScore: 71, sectionScores: { technical: 71, logical: 68, verbal: 73 }, completionTime: 56, status: 'completed', answers: [{ questionId: tests[12].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[13]._id, testId: tests[13]._id, overallScore: 62, sectionScores: { technical: 62, logical: 59, verbal: 64 }, completionTime: 65, status: 'completed', answers: [{ questionId: tests[13].questions[0]._id, selectedOption: 0 }] },
      { studentId: students[14]._id, testId: tests[14]._id, overallScore: 77, sectionScores: { technical: 77, logical: 75, verbal: 79 }, completionTime: 51, status: 'completed', answers: [{ questionId: tests[14].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[15]._id, testId: tests[15]._id, overallScore: 80, sectionScores: { technical: 80, logical: 78, verbal: 82 }, completionTime: 49, status: 'completed', answers: [{ questionId: tests[15].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[16]._id, testId: tests[16]._id, overallScore: 87, sectionScores: { technical: 87, logical: 85, verbal: 89 }, completionTime: 43, status: 'completed', answers: [{ questionId: tests[16].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[17]._id, testId: tests[17]._id, overallScore: 91, sectionScores: { technical: 91, logical: 89, verbal: 93 }, completionTime: 39, status: 'completed', answers: [{ questionId: tests[17].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[18]._id, testId: tests[18]._id, overallScore: 84, sectionScores: { technical: 84, logical: 82, verbal: 86 }, completionTime: 44, status: 'completed', answers: [{ questionId: tests[18].questions[0]._id, selectedOption: 1 }] },
      { studentId: students[19]._id, testId: tests[19]._id, overallScore: 81, sectionScores: { technical: 81, logical: 79, verbal: 83 }, completionTime: 47, status: 'completed', answers: [{ questionId: tests[19].questions[0]._id, selectedOption: 1 }] }
    ];

    const results = await AptitudeResult.create(resultsData);
    console.log(`✅ Created ${results.length} aptitude results\n`);

    // ==================== SUMMARY ====================
    console.log('═'.repeat(70));
    console.log('\n✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨\n');
    console.log('═'.repeat(70));

    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Students: ${students.length}`);
    console.log(`   ✅ Resumes: ${resumes.length}`);
    console.log(`   ✅ Academic Records: ${academics.length}`);
    console.log(`   ✅ Aptitude Tests: ${tests.length}`);
    console.log(`   ✅ Aptitude Results: ${results.length}\n`);

    console.log('🔐 TEST ACCOUNTS (All password: Test123):');
    console.log('─'.repeat(70));
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name.padEnd(20)} | ${student.email}`);
    });
    console.log('─'.repeat(70));

    console.log('\n📈 TOP PERFORMERS:');
    const topPerformers = [
      'Jane Smith (ATS: 95)',
      'Emily Chen (ATS: 91)',
      'Sneha Iyer (ATS: 89)',
      'Sarah Williams (ATS: 88)',
      'Arjun Nair (ATS: 87)'
    ];
    topPerformers.forEach(performer => console.log(`   ⭐ ${performer}`));

    console.log('\n🎯 RECRUITER FILTERING EXAMPLES:');
    console.log('   • Min ATS 85 → 5 students');
    console.log('   • Min Academic 90% → 7 students');
    console.log('   • Skills "Python" → 8 students');
    console.log('   • Skills "AWS" → 6 students');
    console.log('   • Sort by ATS Score\n');

    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
};

// Run the seeding function
seedDatabase();

export default seedDatabase;
