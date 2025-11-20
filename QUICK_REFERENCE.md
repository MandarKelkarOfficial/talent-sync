# Quick Reference - Recruiter View Test Accounts

## All 20 Test Accounts

All accounts have password: **Test123**

### Copy & Paste Ready

```
Account 1:  jane@example.com  / Test123
Account 2:  emily@example.com  / Test123
Account 3:  sarah@example.com  / Test123
Account 4:  john@example.com  / Test123
Account 5:  michael@example.com  / Test123
Account 6:  alex@example.com  / Test123
Account 7:  david@example.com  / Test123
Account 8:  lisa@example.com  / Test123
Account 9:  rajesh@example.com  / Test123
Account 10: priya@example.com  / Test123
Account 11: amit@example.com  / Test123
Account 12: neha@example.com  / Test123
Account 13: vikram@example.com  / Test123
Account 14: anjali@example.com  / Test123
Account 15: rohit@example.com  / Test123
Account 16: divya@example.com  / Test123
Account 17: arjun@example.com  / Test123
Account 18: sneha@example.com  / Test123
Account 19: karan@example.com  / Test123
Account 20: pooja@example.com  / Test123
```

---

## Quick Test Scenarios

### Test 1: Top Performers
```
Min Percentage: 90
Min ATS Score: 85
Expected: 5 students
(Jane, Emily, Sneha, Sarah, Arjun)
```

### Test 2: Python Developers
```
Required Skills: Python
Expected: 8 students
```

### Test 3: AWS Cloud Specialists
```
Required Skills: AWS, Docker
Expected: 6 students
```

### Test 4: Mid-Career Professionals
```
Min ATS Score: 75
Min Percentage: 80
Expected: 15+ students
```

### Test 5: All Students (No Filters)
```
Clear all filters
Click on "Sort by ATS Score"
Expected: 19 students (excluding current user)
```

---

## One-Minute Setup

```bash
# 1. Seed the database
cd server && node seedGlobalData.js

# 2. Start servers
npm run dev

# 3. Open browser
# Navigate to http://localhost:5174

# 4. Login
# Use any email above with password: Test123

# 5. Navigate to Recruiter view
# Click RECRUITER in navbar

# 6. Enjoy! You now see all other 19 students
```

---

## Why You're Seeing Only One Student

**Problem:** You're logged in with an old account (e.g., Rutuja Patwari) that doesn't have complete data

**Solution:** Log in with one of the 20 test accounts above. They all have:
- ✅ Complete resume data with ATS scores
- ✅ Academic records with GPA percentages
- ✅ Aptitude test results
- ✅ Full skill lists

**After logging in with a seeded account:**
- You'll see 19 other students' profiles
- Filters will work properly
- All data will display correctly

---

## Filter Cheat Sheet

| What You Want | Filter | Value |
|---|---|---|
| Top performers | Min ATS | 85 |
| Academic excellence | Min Percentage | 90 |
| Python skills | Skills | Python |
| Full-stack dev | Skills | React, Node.js |
| Cloud engineers | Skills | AWS, Docker |
| Entry-level | Min ATS | 60 |
| Mid-career | Min ATS | 75 |
| Senior devs | Min ATS, Min % | 85, 90 |

---

## Important Notes

✅ All 20 accounts are fully set up with complete data
✅ Each account is independent (different person)
✅ Recruiter view shows all OTHER students (not yourself)
✅ Filters work on: Academic %, ATS Score, Skills
✅ Sorting available: By ATS or By Academic %

---

**Status:** ✅ Ready to use  
**Database:** Fully seeded with 20 students  
**Test Accounts:** 20 accounts available  
**Last Updated:** November 20, 2025
