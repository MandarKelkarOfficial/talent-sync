# Visual Guide - Recruiter View Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      RECRUITER VIEW SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

                            Frontend (Vite)
                        http://localhost:5174
                                  │
                    ┌─────────────┼─────────────┐
                    │                           │
            Recruiter View               Auth Pages
          (Filters & Display)         (Login/Register)
                    │
                    │ GET /api/students/filter
                    │ Headers: Authorization: Bearer {token}
                    │ Params: minAts=85&minPercentage=90&skills=Python
                    ▼
            Backend (Express)
        http://localhost:5000
                    │
        ┌───────────┼───────────┐
        │           │           │
    Auth        Routes       Controllers
  Middleware    Manager      (Business Logic)
        │           │           │
        └─────┬─────┴───────────┘
              │
    Recruiter Controller (filterStudents)
              │
    ┌─────────┼─────────┐
    │         │         │
    │   MongoDB Query   │
    │         │         │
    ▼         ▼         ▼
   StudentDetails + Resume + Academic + Aptitude
         (All verified & active users)
         │
         │ Exclude current user
         │ Apply filters
         │ Sort results
         ▼
   Return cleaned data
         │
         │ JSON response with 19 students
         ▼
   Frontend renders grid
   User sees all candidates
```

---

## Database Relationships

```
StudentDetails (1)
│
├──────────────→ Resume (1:1)
│                 ├─ ats.score (62-95)
│                 ├─ skills: [String]
│                 └─ filename
│
├──────────────→ AcademicDetail (1:1)
│                 ├─ schoolName
│                 ├─ degree
│                 ├─ major
│                 └─ grade (GPA %)
│
├──────────────→ AptitudeTest (1:1)
│                 └─ questions: [{...}]
│
└──────────────→ AptitudeResult (1:1)
                  ├─ overallScore
                  ├─ sectionScores
                  │  ├─ technical
                  │  ├─ logical
                  │  └─ verbal
                  └─ completionTime

```

---

## Data Flow - User Request to Response

### Step 1: User Login
```
[Browser] → POST /api/auth/login
            {email: "jane@example.com", password: "Test123"}
            ↓
[Backend] → StudentDetails.findOne({email})
            bcrypt.compare(password, hashedPassword)
            jwt.sign({id: studentId})
            ↓
[Browser] ← {success: true, token: "eyJhbGc..."}
            (Token stored in localStorage)
```

### Step 2: User Clicks "RECRUITER"
```
[Browser] → Renders RecruiterView component
            useState for filters, students, modal
            useEffect triggers API call
            ↓
[Browser] → GET /api/students/filter
            Headers: {Authorization: "Bearer eyJhbGc..."}
            ↓
[Backend] → Auth Middleware
            jwt.verify(token) → req.user = Jane Smith
            req.studentId = "507f1f77..."
```

### Step 3: Backend Processing
```
[Backend] → recruiterController.filterStudents()
            │
            ├─ Parse filters from query params
            │  ├─ minPercentage: null
            │  ├─ minAtsScore: null
            │  ├─ skills: null
            │  └─ sortBy: "atsScore"
            │
            ├─ MongoDB Aggregation Pipeline
            │  ├─ $match: {
            │  │    isVerified: true,
            │  │    accountStatus: 'active',
            │  │    _id: { $ne: req.studentId }  ← Exclude Jane
            │  │  }
            │  ├─ $lookup: Resume
            │  ├─ $lookup: AcademicDetails
            │  └─ $lookup: AptitudeResults
            │
            ├─ Filter Results in Memory
            │  ├─ If minPercentage: filter by grade
            │  ├─ If minAtsScore: filter by ats.score
            │  └─ If skills: filter by skill array
            │
            ├─ Sort Results
            │  └─ Sort by ats.score descending (default)
            │
            └─ Clean Response
               └─ Remove sensitive fields
                  Remove passwords
```

### Step 4: Response & Display
```
[Backend] ← {
              success: true,
              students: [
                {
                  _id: "...",
                  name: "Emily Chen",
                  email: "emily@...",
                  resume: {
                    ats: {score: 91},
                    skills: ["Python", "Spark", "Hadoop", ...]
                  },
                  academicDetails: [{
                    grade: "94.2",
                    schoolName: "IIT Bombay",
                    ...
                  }],
                  ...
                },
                // 18 more students
              ]
            }

[Browser] ← Receives response
            ↓
            setState(students) with 19 other students
            ↓
            Render StudentsGrid component
            ↓
            Display 19 student cards
```

---

## Filter Application Logic

### Scenario: User Enters "Min ATS = 85, Min Percentage = 90"

```
Input Validation
├─ minPercentage = "90" → parseFloat("90") = 90 ✓
├─ minAtsScore = "85" → parseFloat("85") = 85 ✓
├─ skills = "" → null ✓
└─ sortBy = "atsScore" ✓

Database Query
├─ Fetch all 20 StudentDetails
├─ Check isVerified: true (all 20 pass)
├─ Check accountStatus: 'active' (all 20 pass)
├─ Check _id != Jane's ID (19 remain)
│
└─ Lookup Resume for each
   Lookup AcademicDetails for each
   Lookup AptitudeResults for each

In-Memory Filtering
├─ Filter 1: minPercentage = 90
│  ├─ Emily Chen: 94.2% → PASS
│  ├─ Sneha Iyer: 93.7% → PASS
│  ├─ Jane Smith: 92.3% → PASS (already excluded)
│  ├─ Arjun Nair: 91.5% → PASS
│  ├─ Sarah Williams: 90.1% → PASS
│  ├─ Divya Reddy: 89.2% → FAIL
│  ├─ John Doe: 85.5% → FAIL
│  └─ ... (rest fail)
│
├─ Filter 2: minAtsScore = 85
│  ├─ Emily Chen: 91 → PASS
│  ├─ Sneha Iyer: 89 → PASS
│  ├─ Jane: 95 → PASS (excluded)
│  ├─ Arjun Nair: 87 → PASS
│  ├─ Sarah Williams: 88 → PASS
│  └─ Divya Reddy: 80 → FAIL (was already excluded)

Final Results (Both filters applied)
├─ Emily Chen (94.2%, ATS 91) ✓
├─ Sneha Iyer (93.7%, ATS 89) ✓
├─ Arjun Nair (91.5%, ATS 87) ✓
├─ Sarah Williams (90.1%, ATS 88) ✓
└─ Total: 4 students

Sorting
├─ Sort by ATS Score (descending)
│  ├─ Emily Chen (91)
│  ├─ Sneha Iyer (89)
│  ├─ Sarah Williams (88)
│  └─ Arjun Nair (87)

Response
└─ Return 4 filtered and sorted students to frontend
```

---

## Student Card Display

```
┌──────────────────────────────┐
│                              │
│    Student Avatar (100x100)  │
│                              │
├──────────────────────────────┤
│                              │
│      Emily Chen              │ ← Student Name
│                              │
│  ATS Score: 91               │ ← Resume Data
│  Skills: Python, Spark, ...  │ ← Top 3 Skills
│  Academic Score: 94.2        │ ← Academic Data
│                              │
│  [View Profile Button]       │ ← Opens Modal
│                              │
└──────────────────────────────┘
```

### Click "View Profile" → Modal Opens

```
┌─────────────────────────────────────────────┐
│          Emily Chen - Full Profile           │
├─────────────────────────────────────────────┤
│                                             │
│ Personal Info:                              │
│ ├─ Email: emily@example.com                │
│ ├─ Phone: 9876543215                       │
│ ├─ Address: 987 Cloud Street, Hyderabad   │
│ └─ DOB: 2001-02-14                        │
│                                             │
│ Resume:                                     │
│ ├─ ATS Score: 91                          │
│ ├─ Feedback: Strong data engineering...   │
│ └─ Skills: [Full list of all skills]      │
│     - Python                               │
│     - Spark                                │
│     - Hadoop                               │
│     - SQL                                  │
│     - Kafka                                │
│     - AWS                                  │
│     - Scala                                │
│                                             │
│ Education:                                  │
│ ├─ School: IIT Bombay                     │
│ ├─ Degree: B.Tech                         │
│ ├─ Major: IT                              │
│ ├─ GPA: 94.2%                             │
│ └─ Status: Completed                      │
│                                             │
│ Aptitude Test Results:                      │
│ ├─ Overall Score: 93                      │
│ ├─ Technical: 93                          │
│ ├─ Logical: 94                            │
│ ├─ Verbal: 92                             │
│ └─ Completion Time: 40 min                │
│                                             │
│                          [Close Modal] ×   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Filtering Logic Visualization

### No Filters Applied
```
All 20 Students in DB
└─ Exclude Jane (current user)
   └─ 19 Students returned
      └─ Display in grid (sorted by ATS)
```

### With Min ATS = 85
```
All 20 Students
└─ Exclude Jane
   └─ Filter: ATS >= 85
      └─ Results: [Emily, Sneha, Sarah, Arjun, ...]
         └─ 5-6 students
```

### With Min Percentage = 90
```
All 20 Students
└─ Exclude Jane
   └─ Filter: Academic % >= 90
      └─ Results: [Emily, Sneha, Jane*, Arjun, Sarah, Divya, Alex]
         └─ 7 students (excluding Jane* = 6 shown)
```

### With Skills = "Python"
```
All 20 Students
└─ Exclude Jane
   └─ Filter: "Python" in skills array
      └─ Results: [Priya, Amit, Rajesh, Karan, ...]
         └─ 8 students total
```

### Combined Filters: ATS >= 85 AND Percentage >= 90
```
All 20 Students
└─ Exclude Jane
   └─ Filter: ATS >= 85
      └─ [Emily, Sneha, Sarah, Arjun, ...]
         └─ Filter: % >= 90
            └─ [Emily, Sneha, Sarah, Arjun]
               └─ 4 students
```

---

## API Response Structure

```javascript
// GET /api/students/filter?minAtsScore=85&minPercentage=90

{
  success: true,
  students: [
    {
      _id: ObjectId("..."),
      name: "Emily Chen",
      email: "emily@example.com",
      phoneNumber: "9876543215",
      dateOfBirth: "2001-02-14",
      gender: "female",
      address: "987 Cloud Street, Hyderabad",
      avatarUrl: null,
      resume: {
        filename: "emily_chen_resume.pdf",
        ats: {
          score: 91
        },
        skills: [
          "Python",
          "Spark",
          "Hadoop",
          "SQL",
          "Kafka",
          "AWS",
          "Scala"
        ]
      },
      academicDetails: [
        {
          schoolName: "IIT Bombay",
          degree: "B.Tech",
          major: "IT",
          grade: "94.2",
          startDate: "2019-08-01",
          endDate: "2023-05-30"
        }
      ],
      aptitudeResults: [
        {
          overallScore: 93,
          completionTime: 40
        }
      ]
    },
    // ... more students
  ]
}
```

---

## 20 Students Data Map

```
TIER 1: Top Performers (5)
├─ Jane Smith          (ATS: 95, Academic: 92.3%)
├─ Emily Chen          (ATS: 91, Academic: 94.2%)
├─ Sneha Iyer          (ATS: 89, Academic: 93.7%)
├─ Sarah Williams      (ATS: 88, Academic: 90.1%)
└─ Arjun Nair          (ATS: 87, Academic: 91.5%)

TIER 2: Strong (6)
├─ John Doe            (ATS: 85, Academic: 85.5%)
├─ Michael Brown       (ATS: 82, Academic: 82.5%)
├─ Pooja Saxena        (ATS: 81, Academic: 88.5%)
├─ Divya Reddy         (ATS: 80, Academic: 89.2%)
├─ Karan Malhotra      (ATS: 84, Academic: 84.9%)
└─ Alex Johnson        (ATS: 78, Academic: 88.7%)

TIER 3: Mid-Level (6)
├─ Rohit Desai         (ATS: 77, Academic: 83.6%)
├─ David Martinez      (ATS: 79, Academic: 79.8%)
├─ Lisa Anderson       (ATS: 75, Academic: 86.4%)
├─ Rajesh Kumar        (ATS: 76, Academic: 81.2%)
├─ Priya Sharma        (ATS: 73, Academic: 87.9%)
└─ Vikram Singh        (ATS: 71, Academic: 78.3%)

TIER 4: Entry-Level (3)
├─ Amit Patel          (ATS: 68, Academic: 73.5%)
├─ Neha Gupta          (ATS: 65, Academic: 75.8%)
└─ Anjali Verma        (ATS: 62, Academic: 72.1%)
```

---

## Authentication Flow

```
1. User Login
   [Browser] → POST /api/auth/login
   {email: "jane@example.com", password: "Test123"}
   ↓
2. Server Verification
   [Backend] → Find StudentDetails with email
   ↓
3. Password Check
   [Backend] → bcrypt.compare(password, hashedPassword)
   ↓
4. Generate Token
   [Backend] → jwt.sign({id: studentId}, JWT_SECRET)
   ↓
5. Return to Client
   [Browser] ← {token: "eyJhbGc..."}
   ↓
6. Store Token
   [LocalStorage] → Token saved
   ↓
7. Subsequent Requests
   [Browser] → GET /api/students/filter
              Headers: {Authorization: "Bearer eyJhbGc..."}
   ↓
8. Verify Token
   [Backend] → jwt.verify(token, JWT_SECRET)
   ↓
9. Get User Info
   [Backend] → StudentDetails.findById(decoded.id)
   ↓
10. Allow Request
    [Backend] → Process request with req.user and req.studentId
```

---

## Summary

```
┌────────────────────────────────────────────────────┐
│         RECRUITER VIEW - COMPLETE FLOW             │
├────────────────────────────────────────────────────┤
│                                                    │
│ 1. User logs in with seeded account               │
│    (jane@example.com / emily@example.com / etc)   │
│                                                    │
│ 2. Navigates to RECRUITER in navbar                │
│                                                    │
│ 3. Frontend makes API request:                     │
│    GET /api/students/filter                        │
│    With: {token, filters}                          │
│                                                    │
│ 4. Backend processes:                              │
│    ├─ Verify JWT token                            │
│    ├─ Fetch all students                          │
│    ├─ Exclude current user                        │
│    ├─ Apply filters (ATS, GPA, skills)            │
│    ├─ Sort by selected criteria                   │
│    └─ Return cleaned data                         │
│                                                    │
│ 5. Frontend displays:                              │
│    ├─ 19 student cards in grid                    │
│    ├─ Name, ATS, Skills, Academic %               │
│    ├─ Click for full profile modal                │
│    └─ Apply filters dynamically                   │
│                                                    │
│ Result: Recruiter can find and evaluate            │
│         candidates based on skills & performance  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

**Visual Guide Complete - Data flows work as expected!**
