# MongoDB Global Data & Recruiter Sample Data Documentation

## Overview

This document describes the comprehensive MongoDB data structure for the recruitment platform, including 20 carefully curated student profiles designed for testing recruiter filtering and search functionality.

---

## Data Seeding Script

**Location:** `server/seedGlobalData.js`

**Usage:**
```bash
cd server
node seedGlobalData.js
```

**What it does:**
- Clears existing data from MongoDB
- Creates 20 diverse student profiles
- Generates resumes with ATS scores (62-95 range)
- Creates academic records with varied GPAs
- Generates aptitude test data with section scores
- Provides comprehensive test credentials

---

## 1. Student Profiles (20 Total)

All students have password: `Test123`

### Tier 1: Top Performers (ATS 85-95)

| # | Name | Email | ATS | Academic % | Experience | Key Skills |
|---|------|-------|-----|-----------|------------|-----------|
| 1 | Jane Smith | jane@example.com | **95** | 92.3% | 4+ years | Python, Django, PostgreSQL, AWS, Docker |
| 2 | Emily Chen | emily@example.com | **91** | 94.2% | 3+ years | Python, Spark, Hadoop, SQL, Kafka |
| 3 | Sarah Williams | sarah@example.com | **88** | 90.1% | 3+ years | Kubernetes, AWS, Docker, Jenkins |
| 18 | Sneha Iyer | sneha@example.com | **89** | 93.7% | 3+ years | MongoDB, Express, React, Node.js, AWS |
| 17 | Arjun Nair | arjun@example.com | **87** | 91.5% | 3+ years | System Design, Microservices, Java |

**Use Case:** Filter for high-quality candidates with excellent technical backgrounds

---

### Tier 2: Strong Performers (ATS 78-86)

| # | Name | Email | ATS | Academic % | Experience | Key Skills |
|---|------|-------|-----|-----------|------------|-----------|
| 4 | John Doe | john@example.com | **85** | 85.5% | 3+ years | JavaScript, React, Node.js, MongoDB |
| 5 | Michael Brown | michael@example.com | **82** | 82.5% | 3+ years | React, Vue.js, TypeScript, Tailwind |
| 6 | Alex Johnson | alex@example.com | **78** | 88.7% | 2.5+ years | Java, Spring Boot, MySQL, Docker |
| 16 | Divya Reddy | divya@example.com | **80** | 89.2% | 2+ years | AWS, Azure, Cloud Architecture |
| 19 | Karan Malhotra | karan@example.com | **84** | 84.9% | 2.5+ years | Python, TensorFlow, PyTorch, ML |
| 20 | Pooja Saxena | pooja@example.com | **81** | 88.5% | 2+ years | Security, Penetration Testing, OWASP |

**Use Case:** Target mid-career professionals with solid technical skills

---

### Tier 3: Mid-Level Performers (ATS 71-79)

| # | Name | Email | ATS | Academic % | Experience | Key Skills |
|---|------|-------|-----|-----------|------------|-----------|
| 7 | David Martinez | david@example.com | **79** | 79.8% | 2+ years | React Native, Flutter, Firebase |
| 8 | Lisa Anderson | lisa@example.com | **75** | 86.4% | 2+ years | Selenium, Jest, Test Automation |
| 9 | Rajesh Kumar | rajesh@example.com | **76** | 81.2% | 2+ years | MongoDB, Express, React, Node.js |
| 10 | Priya Sharma | priya@example.com | **73** | 87.9% | 2+ years | Python, Django, Flask, PostgreSQL |
| 14 | Rohit Desai | rohit@desai.com | **77** | 83.6% | 2+ years | MySQL, PostgreSQL, Database Design |
| 15 | Anjali Verma | anjali@example.com | **62** | 72.1% | 1+ year | HTML/CSS, JavaScript, Bootstrap |

**Use Case:** Find candidates with foundation skills and growth potential

---

### Tier 4: Entry-Level Candidates (ATS 62-76)

| # | Name | Email | ATS | Academic % | Experience | Key Skills |
|---|------|-------|-----|-----------|------------|-----------|
| 11 | Amit Patel | amit@example.com | **68** | 73.5% | 1.5+ years | JavaScript, Python, React, MySQL |
| 12 | Neha Gupta | neha@example.com | **65** | 75.8% | 1+ year | HTML/CSS, JavaScript, React |
| 13 | Vikram Singh | vikram@example.com | **71** | 78.3% | 1.5+ years | Java, Spring, MySQL, Maven |

**Use Case:** Recruit fresher talent with mentoring potential

---

## 2. Resume Data

### ATS Score Distribution

```
95 (1) ████████████████████
91 (1) █████████████████
89 (1) █████████████████
88 (1) █████████████████
87 (1) █████████████████
85 (1) ██████████████
84 (1) ██████████████
83 (0)
82 (1) ██████████████
81 (1) ██████████████
80 (1) ██████████████
79 (1) ██████████████
78 (1) ██████████████
77 (1) ██████████████
76 (1) ██████████████
75 (1) ██████████████
73 (1) █████████████
71 (1) █████████████
68 (1) ███████████
65 (1) ███████████
62 (1) ██████████
```

### Skill Categories

#### Backend Skills
- **Python:** 8 candidates (Jane, Emily, Priya, Amit, Karan, Rajesh, +2)
- **Java:** 4 candidates (Alex, Vikram, Arjun, Karan)
- **Node.js:** 5 candidates (John, Rajesh, Sneha, Divya, +1)
- **Spring Boot:** 3 candidates (Alex, Vikram, Arjun)

#### Frontend Skills
- **React:** 8 candidates (John, Michael, Rajesh, Sneha, Amit, Arjun, +2)
- **Vue.js:** 1 candidate (Michael)
- **TypeScript:** 2 candidates (Michael, Karan)
- **React Native:** 1 candidate (David)

#### Database Skills
- **MongoDB:** 5 candidates (John, Rajesh, Sneha, David, Amit)
- **PostgreSQL:** 5 candidates (Jane, Emily, Priya, Rohit, +1)
- **MySQL:** 6 candidates (Alex, Rajesh, Priya, Vikram, Rohit, Amit)
- **SQL:** 2 candidates (Emily, Priya)

#### Cloud & DevOps
- **AWS:** 8 candidates (Jane, Emily, Sarah, Sneha, Divya, Karan, +2)
- **Docker:** 6 candidates (Jane, Sarah, Alex, Divya, Karan, +1)
- **Kubernetes:** 3 candidates (Sarah, Divya, Karan)

#### Testing & QA
- **Jest:** 3 candidates (Michael, Lisa, +1)
- **Selenium:** 2 candidates (Lisa, +1)
- **Test Automation:** 2 candidates (Lisa, +1)

---

## 3. Academic Data

### GPA Distribution

```
94.2% (1) Emily Chen ████████████████████
93.7% (1) Sneha Iyer ███████████████████
92.3% (1) Jane Smith ███████████████████
91.5% (1) Arjun Nair ███████████████████
90.1% (1) Sarah Williams ██████████████████
89.2% (1) Divya Reddy ██████████████████
88.7% (1) Alex Johnson ██████████████████
88.5% (1) Pooja Saxena ██████████████████
87.9% (1) Priya Sharma ██████████████████
86.4% (1) Lisa Anderson █████████████████
85.5% (1) John Doe █████████████████
84.9% (1) Karan Malhotra █████████████████
83.6% (1) Rohit Desai █████████████████
82.5% (1) Michael Brown ████████████████
81.2% (1) Rajesh Kumar ████████████████
79.8% (1) David Martinez ████████████████
78.3% (1) Vikram Singh ███████████████
75.8% (1) Neha Gupta ███████████████
73.5% (1) Amit Patel ██████████████
72.1% (1) Anjali Verma ██████████████
```

### Educational Institutions

- **Top Universities (6):**
  - IIT Bombay (Emily Chen - 94.2%)
  - Delhi University (Jane Smith - 92.3%)
  - CUSAT (Arjun Nair - 91.5%)
  - NIT Delhi (Sarah Williams - 90.1%)
  - JNTU Hyderabad (Divya Reddy - 89.2%)
  - Symbiosis (Pooja Saxena - 88.5%)

- **Mid-tier Universities (8):**
  - VIT Vellore, Manipal, Anna University, Pune, BITS Pilani, etc.

- **Other Universities (6):**
  - SRM, Bharati Vidyapeeth, Amity, Chandigarh University, etc.

### Degrees

All candidates hold either **B.Tech** or **B.E.** (Engineering degrees)

### Majors

- **Computer Science/IT:** 18 candidates
- **Electronics & Communications:** 1 candidate
- **Other Engineering:** 1 candidate

---

## 4. Aptitude Test Results

### Overall Score Distribution

```
Range 90-95:  3 candidates (Jane, Emily, Sneha)
Range 80-89:  7 candidates (Sarah, John, Lisa, David, Alex, Arjun, Karan)
Range 70-79:  7 candidates (Michael, Rajesh, Divya, Vikram, Rohit, Priya, +1)
Range 60-69:  3 candidates (Amit, Neha, Anjali)
```

### Section-wise Scoring

Each test includes three sections:

1. **Technical Skills** - Core programming and technical concepts
2. **Logical Reasoning** - Problem-solving and logic
3. **Verbal Communication** - English and communication

**Pattern Observation:**
- Candidates typically score highest in Technical section
- Verbal scores are generally 1-5 points higher than Logical
- Performance correlates with ATS resume score

---

## 5. Recruiter View Filtering Examples

### Filter Scenario 1: Premium Candidates
```
Min ATS Score: 85
Results: 5 candidates
- Jane Smith (95)
- Emily Chen (91)
- Sneha Iyer (89)
- Sarah Williams (88)
- Arjun Nair (87)
```

### Filter Scenario 2: High Academic Performers
```
Min Academic Percentage: 90%
Results: 7 candidates
- Emily Chen (94.2%)
- Sneha Iyer (93.7%)
- Jane Smith (92.3%)
- Arjun Nair (91.5%)
- Sarah Williams (90.1%)
- Divya Reddy (89.2%)
- Alex Johnson (88.7%)
```

### Filter Scenario 3: Python Developers
```
Skills: "Python"
Results: 8 candidates
- Jane Smith, Emily Chen, Priya Sharma, Amit Patel, Karan Malhotra, Rajesh Kumar, etc.
```

### Filter Scenario 4: Cloud Engineers (AWS)
```
Skills: "AWS"
Results: 8 candidates
- Jane Smith, Emily Chen, Sarah Williams, Sneha Iyer, Divya Reddy, Karan Malhotra, etc.
```

### Filter Scenario 5: Full Stack Developers
```
Skills: "React"
Results: 8 candidates
- Multiple candidates with React expertise across different experience levels
```

### Filter Scenario 6: Mid-Level Candidates
```
Min ATS: 70
Max ATS: 84
Results: 9 candidates
- Good for companies looking for balanced skill-experience mix
```

---

## 6. MongoDB Collections Structure

### StudentDetails
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  phoneNumber: String,
  address: String,
  pincode: String,
  dateOfBirth: Date,
  gender: String,
  isVerified: Boolean (true),
  faceVerified: Boolean (true),
  accountStatus: String ('active'),
  createdAt: Date,
  updatedAt: Date
}
```

### Resume
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: StudentDetails),
  filename: String,
  fileUrl: String,
  uploadDate: Date,
  title: String,
  contentType: String,
  fullText: String,
  ats: {
    score: Number (62-95),
    feedback: String
  },
  skills: [String],
  status: String ('verified'),
  createdAt: Date,
  updatedAt: Date
}
```

### AcademicDetail
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: StudentDetails),
  schoolName: String,
  degree: String,
  major: String,
  startDate: Date,
  endDate: Date,
  grade: String (GPA percentage),
  maxGrade: String,
  status: String ('completed'),
  createdAt: Date,
  updatedAt: Date
}
```

### AptitudeTest
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: StudentDetails),
  questions: [
    {
      _id: ObjectId,
      questionText: String,
      options: [String],
      correctAnswer: String,
      topic: String
    }
  ],
  status: String ('completed'),
  createdAt: Date,
  updatedAt: Date
}
```

### AptitudeResult
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: StudentDetails),
  testId: ObjectId (ref: AptitudeTest),
  overallScore: Number (62-95),
  sectionScores: {
    technical: Number,
    logical: Number,
    verbal: Number
  },
  completionTime: Number (minutes),
  status: String ('completed'),
  answers: [
    {
      questionId: ObjectId,
      selectedOption: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. Data Relationships

```
StudentDetails (1) ────── (Many) Resume
                 ├─────── (Many) AcademicDetail
                 ├─────── (Many) AptitudeTest
                 └─────── (Many) AptitudeResult

AptitudeTest (1) ────────── (Many) AptitudeResult
```

---

## 8. Testing Guidelines

### For Recruiters

1. **Test Basic Filtering:**
   - Filter by ATS Score: Try ranges 75-85, 85-95
   - Filter by Academic Score: Try ranges 80-90, 90+
   - Filter by Skills: Try "Python", "AWS", "React", "Java"

2. **Test Sorting:**
   - Sort by ATS Score (highest first)
   - Sort by Academic Percentage (highest first)
   - Default sort (created date)

3. **Test Combined Filters:**
   - Min ATS 80 + Min Academic 85% + Skill "AWS"
   - Min ATS 85 + Sort by Academic
   - Skills "Python" + Min Academic 90%

### For System Administrators

1. **Verify Data Integrity:**
   ```bash
   # Check student count
   db.studentdetails.countDocuments()  # Should be 20
   
   # Verify all verified status
   db.studentdetails.find({isVerified: false})  # Should be empty
   
   # Check resume skill distribution
   db.resumes.aggregate([
     {$unwind: "$skills"},
     {$group: {_id: "$skills", count: {$sum: 1}}},
     {$sort: {count: -1}}
   ])
   ```

2. **Monitor ATS Score Distribution:**
   ```bash
   db.resumes.aggregate([
     {$group: {
       _id: null,
       avgATS: {$avg: "$ats.score"},
       minATS: {$min: "$ats.score"},
       maxATS: {$max: "$ats.score"}
     }}
   ])
   ```

---

## 9. Common Queries

### Find Top Candidates
```javascript
Resume.find({ 'ats.score': { $gte: 85 } }).sort({ 'ats.score': -1 }).limit(5)
```

### Find Python Developers
```javascript
Resume.find({ skills: 'Python' }).select('studentId skills ats')
```

### Find AWS-Certified Candidates
```javascript
Resume.find({ skills: 'AWS' }).populate('studentId', 'name email')
```

### Find High Academic Performers
```javascript
AcademicDetail.find({ grade: { $gte: '90' } }).populate('studentId', 'name')
```

### Aggregate: Top Skills by Frequency
```javascript
Resume.aggregate([
  { $unwind: '$skills' },
  { $group: { _id: '$skills', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

---

## 10. Data Maintenance

### Backup
```bash
mongodump --db student --out ./backups/student_backup_$(date +%Y%m%d)
```

### Restore
```bash
mongorestore --db student ./backups/student_backup_20240101
```

### Clear Data
```bash
node seedGlobalData.js  # Automatically clears and repopulates
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Students** | 20 |
| **Total Resumes** | 20 |
| **Total Academic Records** | 20 |
| **Total Aptitude Tests** | 20 |
| **Total Aptitude Results** | 20 |
| **ATS Score Range** | 62-95 |
| **Academic Score Range** | 72.1%-94.2% |
| **Unique Skills** | 50+ |
| **Top Skill (Python)** | 8 candidates |
| **Top Performer (Jane Smith)** | ATS 95, Academic 92.3% |

---

## Next Steps

1. **Run the Seed Script:**
   ```bash
   cd server
   node seedGlobalData.js
   ```

2. **Start Frontend & Backend:**
   ```bash
   npm run dev
   ```

3. **Login as Recruiter:**
   - Navigate to http://localhost:5173/login
   - Use any student account as test data
   - Access Recruiter view to filter and search

4. **Test Filtering Functionality:**
   - Apply various ATS score filters
   - Filter by academic percentage
   - Search by skills
   - Sort results

---

**Last Updated:** 2024
**Version:** 2.0 (Comprehensive Global Data)
**Status:** Ready for Production Testing
