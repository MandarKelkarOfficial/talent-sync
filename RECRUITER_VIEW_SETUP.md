# Recruiter View - Setup & Usage Guide

## Overview

The Recruiter View displays all verified student profiles with comprehensive filtering and sorting capabilities. The system now includes **20 diverse student profiles** with complete academic, resume, and aptitude data.

---

## Quick Start

### Step 1: Ensure Database is Seeded

The database has been populated with 20 student profiles. If you need to reseed:

```bash
cd server
node seedGlobalData.js
```

**Output:** You should see all 20 students created with complete data.

---

### Step 2: Log In with a Student Account

Use any of these **20 test accounts** to log in:

**Premium Accounts (Excellent Profiles):**
- Email: `jane@example.com` | Password: `Test123` | ATS: 95
- Email: `emily@example.com` | Password: `Test123` | ATS: 91
- Email: `sneha@example.com` | Password: `Test123` | ATS: 89
- Email: `sarah@example.com` | Password: `Test123` | ATS: 88
- Email: `arjun@example.com` | Password: `Test123` | ATS: 87

**Mid-Level Accounts (Strong Profiles):**
- Email: `john@example.com` | Password: `Test123` | ATS: 85
- Email: `michael@example.com` | Password: `Test123` | ATS: 82
- Email: `alex@example.com` | Password: `Test123` | ATS: 78
- Email: `divya@example.com` | Password: `Test123` | ATS: 80
- Email: `karan@example.com` | Password: `Test123` | ATS: 84

**All 20 Accounts:**
1. jane@example.com (ATS: 95)
2. emily@example.com (ATS: 91)
3. sarah@example.com (ATS: 88)
4. john@example.com (ATS: 85)
5. michael@example.com (ATS: 82)
6. alex@example.com (ATS: 78)
7. david@example.com (ATS: 79)
8. lisa@example.com (ATS: 75)
9. rajesh@example.com (ATS: 76)
10. priya@example.com (ATS: 73)
11. amit@example.com (ATS: 68)
12. neha@example.com (ATS: 65)
13. vikram@example.com (ATS: 71)
14. anjali@example.com (ATS: 62)
15. rohit@example.com (ATS: 77)
16. divya@example.com (ATS: 80)
17. arjun@example.com (ATS: 87)
18. sneha@example.com (ATS: 89)
19. karan@example.com (ATS: 84)
20. pooja@example.com (ATS: 81)

---

### Step 3: Navigate to Recruiter View

1. After login, click **"RECRUITER"** in the navigation menu
2. You should see all 20 student profiles displayed as cards
3. Each card shows:
   - Student Name
   - ATS Score
   - Top 3 Skills
   - Academic Score

---

## Filtering & Sorting

### Available Filters

1. **Min Percentage**
   - Filter by minimum academic percentage (e.g., 85 for 85%+)
   - Example: Enter "90" to see only students with 90%+ academic score

2. **Min ATS Score**
   - Filter by minimum ATS resume score
   - Example: Enter "80" to see only students with ATS 80 or higher

3. **Required Skills (comma separated)**
   - Filter by specific technical skills
   - Example: Enter "Python, AWS" to find candidates with both skills
   - Supported skills include: Python, JavaScript, React, Node.js, Java, Spring Boot, AWS, Docker, MongoDB, PostgreSQL, etc.

4. **Sort By**
   - **Sort by ATS Score** (default) - High to low
   - **Sort by Percentage** - Academic score high to low

### Filtering Examples

#### Example 1: Find Top Performers
- Min Percentage: `90`
- Min ATS Score: `85`
- Result: 5 students (Jane, Emily, Sneha, Sarah, Arjun)

#### Example 2: Find Python Developers
- Required Skills: `Python`
- Result: 8 students with Python expertise

#### Example 3: Find Cloud/DevOps Engineers
- Required Skills: `AWS, Docker`
- Result: 6 students with both AWS and Docker skills

#### Example 4: Entry-Level Candidates
- Min ATS Score: `60`
- Max acceptable: Keep low to see juniors
- Result: 20 students (full list)

#### Example 5: Full Stack Developers
- Required Skills: `React, Node.js`
- Result: 5 students with full-stack capabilities

---

## Data Structure

### Student Card Information

**Name:** Full name of the student

**ATS Score:** 
- Range: 62-95
- Higher = Better technical qualifications
- Based on resume analysis

**Skills:**
- Top 3 skills displayed (click "View Profile" to see all)
- Examples: Python, React, AWS, Docker, etc.

**Academic Score:**
- Student's highest academic percentage
- Range: 62-94%
- GPA equivalent

**View Profile Button:**
- Click to see detailed information:
  - Complete skill list
  - Education history
  - Resume details
  - Aptitude test scores

---

## Student Database Overview

### By Tier

**Tier 1: Top Performers (5 students)**
- ATS: 87-95
- Academic: 90%+
- Experience: 3+ years
- Ideal for: Senior roles, critical projects

**Tier 2: Strong Performers (6 students)**
- ATS: 78-86
- Academic: 85-90%
- Experience: 2.5-3 years
- Ideal for: Mid-level roles, team leads

**Tier 3: Mid-Level (6 students)**
- ATS: 73-80
- Academic: 80-89%
- Experience: 2-2.5 years
- Ideal for: Standard development roles

**Tier 4: Entry-Level (3 students)**
- ATS: 62-71
- Academic: 72-78%
- Experience: 1-1.5 years
- Ideal for: Fresher programs, mentorship roles

---

## Skill Distribution

### Backend Skills
- **Python:** 8 students
- **Java:** 4 students
- **Node.js:** 5 students
- **Spring Boot:** 3 students

### Frontend Skills
- **React:** 8 students
- **Vue.js:** 1 student
- **TypeScript:** 2 students
- **React Native:** 1 student

### Cloud & DevOps
- **AWS:** 8 students
- **Docker:** 6 students
- **Kubernetes:** 3 students
- **Azure:** 2 students

### Databases
- **MongoDB:** 5 students
- **PostgreSQL:** 5 students
- **MySQL:** 6 students

### Specialized
- **Machine Learning:** 1 student
- **Security:** 1 student
- **Mobile Dev:** 1 student
- **QA/Testing:** 1 student

---

## Troubleshooting

### Issue: Only one student showing (showing "my data")

**Solution:**
1. Log out (click profile → logout)
2. Log back in with a different test account
3. Make sure you're using accounts from the seed list above
4. Refresh the page (Ctrl+F5 for hard refresh)

**Why this happens:**
- Old accounts from before seeding may have incomplete data
- Using a pre-seeded account ensures complete profile data

### Issue: "No students found matching the filters"

**Solution:**
1. Clear all filters and try again
2. Check filter values (e.g., ATS 100 is impossible - max is 95)
3. Try "Min ATS Score: 60" to see all students

### Issue: ATS Score or Academic Score showing "N/A"

**Solution:**
1. This indicates incomplete data for that student
2. Try using an account from the official seed list
3. Or reseed the database: `node seedGlobalData.js`

### Issue: Skills showing "N/A"

**Solution:**
1. Click "View Profile" to see complete skill list
2. If still showing N/A, reseed the database

---

## For Testing Different Scenarios

### Scenario 1: Hiring for Python Backend Developer
```
Filter: Required Skills = "Python"
Sort: By ATS Score
Expected: 8 candidates with Python expertise
```

### Scenario 2: Enterprise Cloud Solutions
```
Filter: Min ATS = 80, Required Skills = "AWS, Docker"
Sort: By Percentage
Expected: 6 candidates with enterprise-level cloud skills
```

### Scenario 3: Team Expansion (Mid-level)
```
Filter: Min ATS = 75, Min Percentage = 80
Sort: By ATS Score
Expected: 15 candidates suitable for growth roles
```

### Scenario 4: Fresh Talent Acquisition
```
Filter: Min ATS = 60 (or clear)
Filter: Min Percentage = 70
Sort: By Percentage
Expected: All 20 candidates, filtered by academic performance
```

---

## API Endpoint Reference

**Endpoint:** `GET /api/students/filter`

**Authentication:** Required (Bearer token in Authorization header)

**Query Parameters:**
```
GET /api/students/filter?minPercentage=85&minAtsScore=80&skills=Python,AWS&sortBy=atsScore
```

**Parameters:**
- `minPercentage` (optional): number (0-100)
- `minAtsScore` (optional): number (0-100)
- `skills` (optional): comma-separated string
- `sortBy` (optional): "atsScore" or "percentage"

**Response:**
```javascript
{
  success: true,
  students: [
    {
      _id: "ObjectId",
      name: "Jane Smith",
      email: "jane@example.com",
      resume: {
        ats: { score: 95 },
        skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker"]
      },
      academicDetails: [
        {
          schoolName: "Delhi University",
          degree: "B.Tech",
          major: "CSE",
          grade: "92.3"
        }
      ]
    }
  ]
}
```

---

## Tips for Best Results

1. **Use the Official Test Accounts**
   - All 20 accounts have complete data
   - Passwords are all "Test123"
   - Each account represents a realistic student profile

2. **Explore Different Filters**
   - Try single filters first, then combine them
   - Notice how skill filtering narrows results effectively
   - Experiment with ATS score ranges

3. **View Detailed Profiles**
   - Click "View Profile" on any student card
   - See full skill list, education, test scores
   - Better understand candidate backgrounds

4. **Use Sorting Effectively**
   - Sort by ATS for technical skill assessment
   - Sort by Percentage for academic excellence
   - Combine with filters for targeted hiring

---

## Expected Results

With all filters cleared, you should see:
- **20 total student cards**
- Diverse skill sets
- Range of experience levels (1.5-4 years)
- Multiple specializations
- ATS scores from 62 to 95

If you see fewer than 20 students or incomplete data, please:
1. Reseed: `node seedGlobalData.js`
2. Refresh browser: `Ctrl+F5`
3. Log in again with a test account

---

**Last Updated:** November 2024
**Version:** 2.0 (20-Student Comprehensive Database)
**Status:** Production Ready
