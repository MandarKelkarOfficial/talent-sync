import StudentDetails from '../models/StudentDetails.js';
import Resume from '../models/Resume.js';
import AptitudeResult from '../models/AptitudeResult.js';
import AcademicDetail from '../models/AcademicDetail.js';

export const recruiterController = {
  filterStudents: async (req, res) => {
    try {
      console.log('=== RECRUITER FILTER REQUEST ===');
      console.log('User:', req.user);
      console.log('Student ID:', req.studentId);
      console.log('Query params:', req.query);
      
      let { minPercentage, minAtsScore, skills, sortBy = 'atsScore' } = req.query;

      // Convert to proper types and handle empty strings
      minPercentage = minPercentage ? parseFloat(minPercentage) : null;
      minAtsScore = minAtsScore ? parseFloat(minAtsScore) : null;
      skills = skills && skills.trim() ? skills.trim() : null;
      
      console.log('Parsed filters:', { minPercentage, minAtsScore, skills, sortBy });
      
      // First check if we have any students
      const studentCount = await StudentDetails.countDocuments();
      console.log('Total students in database:', studentCount);
      
      // Fetch all students first, then do lookups (excluding current user)
      const students = await StudentDetails.aggregate([
        {
          $match: { 
            isVerified: true, 
            accountStatus: 'active',
            _id: { $ne: req.studentId }  // Exclude the current logged-in user
          }
        },
        {
          $lookup: {
            from: 'resumes',
            localField: '_id',
            foreignField: 'studentId',
            as: 'resume'
          }
        },
        {
          $lookup: {
            from: 'academicdetails',
            localField: '_id',
            foreignField: 'studentId',
            as: 'academicDetails'
          }
        },
        {
          $lookup: {
            from: 'aptituderesults',
            localField: '_id',
            foreignField: 'studentId',
            as: 'aptitudeResults'
          }
        },
        {
          $addFields: {
            resume: { $ifNull: [{ $arrayElemAt: ['$resume', 0] }, {}] }
          }
        }
      ]);

      console.log(`Aggregation returned ${students.length} students`);
      
      // Start with all students
      let filteredStudents = [...students];

      // Filter by academic percentage if provided
      if (minPercentage !== null) {
        console.log(`Filtering by minPercentage: ${minPercentage}`);
        filteredStudents = filteredStudents.filter(student => {
          // Get the maximum grade from all academic details
          const academicDetails = student.academicDetails || [];
          if (academicDetails.length === 0) return false;
          
          const maxGrade = Math.max(...academicDetails.map(detail => {
            const grade = parseFloat(detail.grade);
            return !isNaN(grade) ? grade : 0;
          }));
          
          console.log(`  ${student.name}: max grade=${maxGrade}, required=${minPercentage}, passes=${maxGrade >= minPercentage}`);
          return maxGrade >= minPercentage;
        });
        console.log(`After percentage filter: ${filteredStudents.length} students`);
      }

      // Filter by ATS score if provided
      if (minAtsScore !== null) {
        console.log(`Filtering by minAtsScore: ${minAtsScore}`);
        filteredStudents = filteredStudents.filter(student => {
          const score = student.resume?.ats?.score || 0;
          console.log(`  ${student.name}: ATS score=${score}, required=${minAtsScore}, passes=${score >= minAtsScore}`);
          return score >= minAtsScore;
        });
        console.log(`After ATS score filter: ${filteredStudents.length} students`);
      }

      // Filter by skills if provided (exact skill matching - "java" != "javascript")
      if (skills !== null) {
        console.log(`Filtering by skills: ${skills}`);
        const rawList = skills.split(',').map(s => s.trim()).filter(s => s);
        const skillList = rawList.map(s => s.toLowerCase());

        if (skillList.length > 0) {
          filteredStudents = filteredStudents.filter(student => {
            const studentSkills = (student.resume?.skills || []).map(s => s.toLowerCase());

            // For each required skill, check for EXACT match (not substring)
            const matchesRequired = skillList.every(required => {
              // Check if any student skill EXACTLY matches the required skill
              const hasSkill = studentSkills.some(ss => ss === required);
              console.log(`    ${student.name}: checking if has "${required}" → ${hasSkill} (skills: [${studentSkills.join(', ')}])`);
              return hasSkill;
            });

            console.log(`  ${student.name}: requires [${skillList.join(', ')}], passes=${matchesRequired}`);
            return matchesRequired;
          });
          console.log(`After skills filter: ${filteredStudents.length} students`);
        }
      }

      // Sort results
      console.log(`Sorting by: ${sortBy}`);
      if (sortBy === 'atsScore') {
        filteredStudents.sort((a, b) => {
          const scoreA = a.resume?.ats?.score || 0;
          const scoreB = b.resume?.ats?.score || 0;
          return scoreB - scoreA; // Descending order
        });
      } else if (sortBy === 'percentage') {
        filteredStudents.sort((a, b) => {
          const gradeA = Math.max(...(a.academicDetails || []).map(d => parseFloat(d.grade) || 0), 0);
          const gradeB = Math.max(...(b.academicDetails || []).map(d => parseFloat(d.grade) || 0), 0);
          return gradeB - gradeA; // Descending order
        });
      }
      console.log('Final sorted students:', filteredStudents.map(s => s.name));

      console.log(`Returning ${filteredStudents.length} students`);

      // Clean up the response - remove sensitive data and ensure proper format
      const cleanedStudents = filteredStudents.map(student => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        avatarUrl: student.avatarUrl,
        resume: {
          filename: student.resume?.filename,
          ats: {
            score: student.resume?.ats?.score || 0
          },
          skills: student.resume?.skills || []
        },
        academicDetails: (student.academicDetails || []).map(detail => ({
          schoolName: detail.schoolName,
          degree: detail.degree,
          major: detail.major,
          grade: detail.grade,
          startDate: detail.startDate,
          endDate: detail.endDate
        })),
        aptitudeResults: (student.aptitudeResults || []).map(result => ({
          overallScore: result.overallScore,
          completionTime: result.completionTime
        }))
      }));

      console.log('Sending response with cleaned data');
      res.json({
        success: true,
        students: cleanedStudents
      });

    } catch (error) {
      console.error('Filter students error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to filter students'
      });
    }
  }
};