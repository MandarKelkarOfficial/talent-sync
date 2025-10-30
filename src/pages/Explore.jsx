/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// import React from 'react'

// export default function Explore() {
//   return (
//     <div>
//       Under progress ....
//     </div>
//   )
// }


import { useState } from 'react';
import coursesData from '../Assets/data/courses.json'; // Import your JSON file

const Explore = () => {
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Function to extract skills/subjects from the skills string
  const extractSubjects = (skillsString) => {
    return skillsString.split(' ').filter(skill => skill.trim() !== '');
  };

  const getTopCourses = () => {
    if (!selectedSubject) return [];
    
    return coursesData
      .filter(course => {
        // Check if the search term matches university, course name, or skills
        const lowerSubject = selectedSubject.toLowerCase();
        return (
          course['Course Name'].toLowerCase().includes(lowerSubject) ||
          course.University.toLowerCase().includes(lowerSubject) ||
          extractSubjects(course.Skills.toLowerCase()).some(skill => 
            skill.includes(lowerSubject))
        );
      })
      .sort((a, b) => parseFloat(b['Course Rating']) - parseFloat(a['Course Rating']))
      .slice(0, 3);
  };

  const topCourses = getTopCourses();

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-6 md:mb-8 text-center">
          Find Top Courses
        </h1>

        <div className="mb-8 flex flex-col md:flex-row justify-center items-center">
          <input
            type="text"
            placeholder="Enter subject, university or skill (e.g., Screenwriting, Michigan)"
            className="px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-l-lg border-2 border-purple-300 w-full md:w-96 focus:outline-none focus:border-purple-500 mb-2 md:mb-0"
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedSubject(searchSubject)}
          />
          <button
            onClick={() => setSelectedSubject(searchSubject)}
            className="bg-purple-600 text-white px-6 py-2 md:py-3 rounded-lg md:rounded-r-lg hover:bg-purple-700 transition-colors w-full md:w-auto"
          >
            Search
          </button>
        </div>

        {selectedSubject && (
          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Top courses for: {selectedSubject}
          </h2>
        )}

        {topCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCourses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg md:text-xl font-semibold text-purple-800 mb-2 line-clamp-2">
                      {course['Course Name']}
                    </h3>
                    <p className="text-purple-600 font-medium mb-1">
                      {course.University}
                    </p>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-gray-700 font-medium">
                        {course['Course Rating']} ({course['Course Rating'] ? (parseFloat(course['Course Rating']) * 20).toFixed(0) : '0'}%)
                      </span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-600 text-sm">
                        {course['Difficulty Level']}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course['Course Description']}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {extractSubjects(course.Skills).slice(0, 4).map((skill, i) => (
                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <a
                    href={course['Course URL']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Course
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          selectedSubject && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No courses found matching "{selectedSubject}"
              </p>
              <p className="text-sm text-gray-500">
                Try searching for different subjects, universities, or skills
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Explore;




