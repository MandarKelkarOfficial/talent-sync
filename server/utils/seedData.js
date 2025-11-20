import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import StudentDetails from '../models/StudentDetails.js';
import Resume from '../models/Resume.js';
import AcademicDetail from '../models/AcademicDetail.js';
import AptitudeResult from '../models/AptitudeResult.js';
import AptitudeTest from '../models/AptitudeTest.js';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/student');

    // Clear existing data
    await Promise.all([
      StudentDetails.deleteMany({}),
      Resume.deleteMany({}),
      AcademicDetail.deleteMany({}),
      AptitudeResult.deleteMany({})
    ]);

    // Create test students with diverse profiles
    const hashedPassword = await bcrypt.hash('Test123', 10);
    const students = await StudentDetails.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phoneNumber: '9876543210',
        address: '123 Tech Street',
        pincode: '400001',
        dateOfBirth: '1999-05-15',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        phoneNumber: '9876543211',
        address: '456 Code Avenue',
        pincode: '400002',
        dateOfBirth: '2000-03-20',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: hashedPassword,
        phoneNumber: '9876543212',
        address: '789 Developer Road',
        pincode: '400003',
        dateOfBirth: '1998-08-10',
        gender: 'other',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: hashedPassword,
        phoneNumber: '9876543213',
        address: '321 Innovation Park',
        pincode: '400004',
        dateOfBirth: '2000-11-05',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Michael Brown',
        email: 'michael@example.com',
        password: hashedPassword,
        phoneNumber: '9876543214',
        address: '654 Software Plaza',
        pincode: '400005',
        dateOfBirth: '1999-07-22',
        gender: 'male',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'Emily Chen',
        email: 'emily@example.com',
        password: hashedPassword,
        phoneNumber: '9876543215',
        address: '987 Cloud Street',
        pincode: '400006',
        dateOfBirth: '2001-02-14',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      },
      {
        name: 'David Martinez',
        email: 'david@example.com',
        password: hashedPassword,
        phoneNumber: '9876543216',
        address: '159 Data Avenue',
        pincode: '400007',
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
        address: '753 Web Lane',
        pincode: '400008',
        dateOfBirth: '1999-12-03',
        gender: 'female',
        isVerified: true,
        faceVerified: true,
        accountStatus: 'active'
      }
    ]);

    // Create resumes for each student with varied ATS scores
    const resumes = await Resume.create([
      {
        studentId: students[0]._id,
        filename: 'john_resume.pdf',
        fileUrl: 'uploads/john_resume.pdf',
        uploadDate: new Date(),
        title: 'John Doe - Software Engineer Resume',
        contentType: 'application/pdf',
        fullText: 'Experienced software engineer with skills in JavaScript, React, Node.js, and MongoDB. 3 years of experience in full-stack development.',
        ats: {
          score: 85,
          feedback: 'Strong technical background'
        },
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs'],
        status: 'verified'
      },
      {
        studentId: students[1]._id,
        filename: 'jane_resume.pdf',
        fileUrl: 'uploads/jane_resume.pdf',
        uploadDate: new Date(),
        title: 'Jane Smith - Full Stack Developer Resume',
        contentType: 'application/pdf',
        fullText: 'Full stack developer with expertise in Python, Django, PostgreSQL, and AWS cloud services. 4 years of professional experience.',
        ats: {
          score: 95,
          feedback: 'Excellent project experience and strong cloud knowledge'
        },
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
        status: 'verified'
      },
      {
        studentId: students[2]._id,
        filename: 'alex_resume.pdf',
        fileUrl: 'uploads/alex_resume.pdf',
        uploadDate: new Date(),
        title: 'Alex Johnson - Backend Developer Resume',
        contentType: 'application/pdf',
        fullText: 'Backend developer specializing in Java, Spring Boot, MySQL, and containerization with Docker. 2.5 years of experience.',
        ats: {
          score: 78,
          feedback: 'Good analytical skills'
        },
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Microservices'],
        status: 'verified'
      },
      {
        studentId: students[3]._id,
        filename: 'sarah_resume.pdf',
        fileUrl: 'uploads/sarah_resume.pdf',
        uploadDate: new Date(),
        title: 'Sarah Williams - DevOps Engineer Resume',
        contentType: 'application/pdf',
        fullText: 'DevOps engineer with expertise in Kubernetes, AWS, Docker, and CI/CD pipelines. Passionate about automation and infrastructure optimization.',
        ats: {
          score: 88,
          feedback: 'Strong DevOps and cloud expertise'
        },
        skills: ['Kubernetes', 'AWS', 'Docker', 'Jenkins', 'Terraform', 'Linux'],
        status: 'verified'
      },
      {
        studentId: students[4]._id,
        filename: 'michael_resume.pdf',
        fileUrl: 'uploads/michael_resume.pdf',
        uploadDate: new Date(),
        title: 'Michael Brown - Frontend Developer Resume',
        contentType: 'application/pdf',
        fullText: 'Frontend developer with 3 years of experience in React, Vue.js, and modern web technologies. UI/UX enthusiast.',
        ats: {
          score: 82,
          feedback: 'Strong frontend skills with good UI/UX understanding'
        },
        skills: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Redux'],
        status: 'verified'
      },
      {
        studentId: students[5]._id,
        filename: 'emily_resume.pdf',
        fileUrl: 'uploads/emily_resume.pdf',
        uploadDate: new Date(),
        title: 'Emily Chen - Data Engineer Resume',
        contentType: 'application/pdf',
        fullText: 'Data engineer specializing in ETL pipelines, data warehousing, and big data technologies. Experience with Spark and Hadoop.',
        ats: {
          score: 91,
          feedback: 'Excellent data engineering background'
        },
        skills: ['Python', 'Spark', 'Hadoop', 'SQL', 'Kafka', 'AWS'],
        status: 'verified'
      },
      {
        studentId: students[6]._id,
        filename: 'david_resume.pdf',
        fileUrl: 'uploads/david_resume.pdf',
        uploadDate: new Date(),
        title: 'David Martinez - Mobile Developer Resume',
        contentType: 'application/pdf',
        fullText: 'Mobile developer experienced in React Native and Flutter. Developed multiple successful apps for iOS and Android.',
        ats: {
          score: 79,
          feedback: 'Good mobile development experience'
        },
        skills: ['React Native', 'Flutter', 'JavaScript', 'Firebase', 'iOS'],
        status: 'verified'
      },
      {
        studentId: students[7]._id,
        filename: 'lisa_resume.pdf',
        fileUrl: 'uploads/lisa_resume.pdf',
        uploadDate: new Date(),
        title: 'Lisa Anderson - QA Engineer Resume',
        contentType: 'application/pdf',
        fullText: 'QA Engineer with expertise in automated testing, test frameworks, and quality assurance best practices. 2 years of experience.',
        ats: {
          score: 75,
          feedback: 'Solid QA background with test automation skills'
        },
        skills: ['Selenium', 'Jest', 'Test Automation', 'Manual Testing', 'Bug Analysis'],
        status: 'verified'
      }
    ]);

    // Create academic details for each student
    const academicDetails = await AcademicDetail.create([
      {
        studentId: students[0]._id,
        schoolName: 'Tech University',
        degree: 'B.Tech',
        major: 'Computer Science',
        startDate: '2017-08-01',
        endDate: '2021-05-30',
        grade: '85.5',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[1]._id,
        schoolName: 'Engineering College',
        degree: 'B.E.',
        major: 'Information Technology',
        startDate: '2018-08-01',
        endDate: '2022-05-30',
        grade: '92.3',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[2]._id,
        schoolName: 'Science University',
        degree: 'B.Sc',
        major: 'Computer Applications',
        startDate: '2016-08-01',
        endDate: '2020-05-30',
        grade: '88.7',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[3]._id,
        schoolName: 'Delhi Institute of Technology',
        degree: 'B.Tech',
        major: 'Computer Science',
        startDate: '2018-08-01',
        endDate: '2022-05-30',
        grade: '90.1',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[4]._id,
        schoolName: 'Mumbai Tech College',
        degree: 'B.E.',
        major: 'Electronics & Communication',
        startDate: '2017-08-01',
        endDate: '2021-05-30',
        grade: '82.5',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[5]._id,
        schoolName: 'Bangalore University',
        degree: 'B.Tech',
        major: 'Information Technology',
        startDate: '2019-08-01',
        endDate: '2023-05-30',
        grade: '94.2',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[6]._id,
        schoolName: 'Pune Engineering Institute',
        degree: 'B.E.',
        major: 'Computer Science',
        startDate: '2016-08-01',
        endDate: '2020-05-30',
        grade: '79.8',
        maxGrade: '100',
        status: 'completed'
      },
      {
        studentId: students[7]._id,
        schoolName: 'Chennai University',
        degree: 'B.Tech',
        major: 'Software Engineering',
        startDate: '2017-08-01',
        endDate: '2021-05-30',
        grade: '86.4',
        maxGrade: '100',
        status: 'completed'
      }
    ]);

    // Create aptitude tests for all students
    const aptitudeTests = await AptitudeTest.create([
      {
        studentId: students[0]._id,
        questions: [
          {
            questionText: 'What is JavaScript?',
            options: ['A programming language', 'A markup language', 'A database', 'A framework'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[1]._id,
        questions: [
          {
            questionText: 'What is React?',
            options: ['A JavaScript library', 'A database', 'An operating system', 'A programming language'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[2]._id,
        questions: [
          {
            questionText: 'What is MongoDB?',
            options: ['A NoSQL database', 'A programming language', 'A web framework', 'An API'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[3]._id,
        questions: [
          {
            questionText: 'What is Kubernetes?',
            options: ['A container orchestration tool', 'A programming language', 'A database', 'A web server'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[4]._id,
        questions: [
          {
            questionText: 'What is Vue.js?',
            options: ['A JavaScript framework', 'A database', 'A server', 'A CSS library'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[5]._id,
        questions: [
          {
            questionText: 'What is Apache Spark?',
            options: ['A big data processing engine', 'A database', 'A web framework', 'A programming language'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[6]._id,
        questions: [
          {
            questionText: 'What is React Native?',
            options: ['A mobile development framework', 'A web framework', 'A database', 'A server'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      },
      {
        studentId: students[7]._id,
        questions: [
          {
            questionText: 'What is Selenium?',
            options: ['A testing automation tool', 'A programming language', 'A database', 'A web server'],
            correctAnswer: '0',
            topic: 'Technical Skills'
          }
        ],
        status: 'completed'
      }
    ]);

    // Create aptitude results for each student
    const aptitudeResults = await AptitudeResult.create([
      {
        studentId: students[0]._id,
        testId: aptitudeTests[0]._id,
        overallScore: 82,
        sectionScores: {
          technical: 82,
          logical: 80,
          verbal: 85
        },
        completionTime: 45,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[0].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[1]._id,
        testId: aptitudeTests[1]._id,
        overallScore: 95,
        sectionScores: {
          technical: 95,
          logical: 92,
          verbal: 98
        },
        completionTime: 38,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[1].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[2]._id,
        testId: aptitudeTests[2]._id,
        overallScore: 78,
        sectionScores: {
          technical: 78,
          logical: 75,
          verbal: 80
        },
        completionTime: 50,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[2].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[3]._id,
        testId: aptitudeTests[3]._id,
        overallScore: 88,
        sectionScores: {
          technical: 88,
          logical: 87,
          verbal: 89
        },
        completionTime: 42,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[3].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[4]._id,
        testId: aptitudeTests[4]._id,
        overallScore: 81,
        sectionScores: {
          technical: 81,
          logical: 79,
          verbal: 84
        },
        completionTime: 48,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[4].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[5]._id,
        testId: aptitudeTests[5]._id,
        overallScore: 93,
        sectionScores: {
          technical: 93,
          logical: 94,
          verbal: 92
        },
        completionTime: 40,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[5].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[6]._id,
        testId: aptitudeTests[6]._id,
        overallScore: 76,
        sectionScores: {
          technical: 76,
          logical: 74,
          verbal: 78
        },
        completionTime: 52,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[6].questions[0]._id, selectedOption: 0 }
        ]
      },
      {
        studentId: students[7]._id,
        testId: aptitudeTests[7]._id,
        overallScore: 85,
        sectionScores: {
          technical: 85,
          logical: 83,
          verbal: 87
        },
        completionTime: 46,
        status: 'completed',
        answers: [
          { questionId: aptitudeTests[7].questions[0]._id, selectedOption: 0 }
        ]
      }
    ]);

    console.log('✅ Demo Recruiter Data Seeded Successfully!\n');
    console.log(`📊 Statistics:`);
    console.log(`   - Created ${students.length} students`);
    console.log(`   - Created ${resumes.length} resumes with ATS scores`);
    console.log(`   - Created ${academicDetails.length} academic records`);
    console.log(`   - Created ${aptitudeResults.length} aptitude results\n`);

    // Test credentials for each student:
    console.log('🔐 Test Credentials (Use these to login):');
    console.log('─'.repeat(60));
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name.padEnd(20)} | Email: ${student.email.padEnd(25)} | Password: Test123`);
    });
    console.log('─'.repeat(60));

    console.log('\n📈 Student Profiles for Recruiter Filtering:');
    console.log('─'.repeat(60));
    const profileData = [
      { name: 'Jane Smith', ats: 95, academic: '92.3%', skills: 'Python, Django, PostgreSQL, AWS, Docker' },
      { name: 'Emily Chen', ats: 91, academic: '94.2%', skills: 'Python, Spark, Hadoop, SQL, Kafka, AWS' },
      { name: 'Sarah Williams', ats: 88, academic: '90.1%', skills: 'Kubernetes, AWS, Docker, Jenkins, Terraform, Linux' },
      { name: 'John Doe', ats: 85, academic: '85.5%', skills: 'JavaScript, React, Node.js, MongoDB, REST APIs' },
      { name: 'Lisa Anderson', ats: 75, academic: '86.4%', skills: 'Selenium, Jest, Test Automation, Manual Testing' }
    ];
    profileData.forEach(profile => {
      console.log(`\n${profile.name}`);
      console.log(`  ATS Score: ${profile.ats} | Academic: ${profile.academic}`);
      console.log(`  Skills: ${profile.skills}`);
    });
    console.log('\n' + '─'.repeat(60));

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
};

// Run the seeding function
// seedDatabase(); // Commented out - only run manually when needed

export default seedDatabase;