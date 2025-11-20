# 📊 Recruiter Demo Data Setup

This document explains how to populate your database with demo recruiter data for testing.

## 🚀 Quick Start

### Step 1: Ensure MongoDB is Running
Make sure your MongoDB server is running on `mongodb://localhost:27017`

### Step 2: Run the Seed Script
From the `server` directory, run:

```bash
node seedDemoData.js
```

### Step 3: Check the Output
The script will display:
- ✅ Number of students, resumes, and academic records created
- 🔐 Test credentials for all demo accounts
- 📈 Profile information for recruiter filtering

## 👥 Demo Student Accounts

8 students are created with the following credentials:

| Name | Email | Password |
|------|-------|----------|
| John Doe | john@example.com | Test123 |
| Jane Smith | jane@example.com | Test123 |
| Alex Johnson | alex@example.com | Test123 |
| Sarah Williams | sarah@example.com | Test123 |
| Michael Brown | michael@example.com | Test123 |
| Emily Chen | emily@example.com | Test123 |
| David Martinez | david@example.com | Test123 |
| Lisa Anderson | lisa@example.com | Test123 |

**Default Password:** `Test123` (same for all)

## 📊 Available Filtering in Recruiter View

### By ATS Score
- Jane Smith: **95** (Highest)
- Emily Chen: **91**
- Sarah Williams: **88**
- John Doe: **85**
- Michael Brown: **82**
- Alex Johnson: **78**
- David Martinez: **79**
- Lisa Anderson: **75** (Lowest)

### By Academic Percentage
- Emily Chen: **94.2%** (Highest)
- Jane Smith: **92.3%**
- Sarah Williams: **90.1%**
- Alex Johnson: **88.7%**
- Lisa Anderson: **86.4%**
- John Doe: **85.5%**
- Michael Brown: **82.5%**
- David Martinez: **79.8%**

### By Skills
- **JavaScript, React, Node.js** - John Doe, Michael Brown
- **Python, Django** - Jane Smith, Emily Chen, David Martinez
- **AWS, Cloud** - Jane Smith, Sarah Williams, Emily Chen
- **Docker, DevOps** - Sarah Williams
- **Kubernetes** - Sarah Williams
- **React Native, Flutter** - David Martinez
- **Selenium, Test Automation** - Lisa Anderson

## 🔍 Test the Recruiter Filters

1. **Login** as a recruiter with any demo account
2. **Navigate** to the Recruiter tab (`/recruiter`)
3. **Try these filters:**

### Example 1: High Performers
- Min ATS Score: 85
- Min Percentage: 85%

Expected Results: Jane Smith, Emily Chen, Sarah Williams, John Doe

### Example 2: Cloud Specialists
- Required Skills: AWS
- Sort by ATS Score

Expected Results: Jane Smith, Sarah Williams, Emily Chen

### Example 3: Frontend Developers
- Required Skills: React
- Min ATS Score: 80

Expected Results: John Doe, Michael Brown

## 📝 Data Structure

Each student has:
- ✅ Complete profile information
- 📄 Resume with ATS score and skills
- 🎓 Academic details (GPA, degree, university)
- 📝 Aptitude test results (Technical, Logical, Verbal scores)

## 🔄 To Reset and Reseed

The seed script automatically clears existing data before creating new records. Simply run:

```bash
node seedDemoData.js
```

## 📖 Integration with API

All demo students are queryable through the recruiter filter endpoint:

```
GET /api/students/filter
Headers: Authorization: Bearer <token>
Query Params:
  - minPercentage: number (e.g., 85)
  - minAtsScore: number (e.g., 80)
  - skills: string (comma-separated, e.g., "React, JavaScript")
  - sortBy: "atsScore" | "percentage"
```

## 🐛 Troubleshooting

### "Connection refused" error
- Make sure MongoDB is running
- Check the connection string in `seedData.js`

### "No students found after seeding"
- Check MongoDB logs
- Verify the database `student` exists
- Try restarting MongoDB

### "Test data already exists"
- The script automatically deletes old data before seeding
- Just run the script again

## 💡 Tips

- Use Jane Smith (92.3% academic, 95 ATS) as the top performer
- Use Emily Chen for cloud/big data testing
- Use Sarah Williams for DevOps/Kubernetes testing
- Use Lisa Anderson for QA/Testing focused searches
