import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import StudentProfileModal from './StudentProfileModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Recruiter = () => {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    minPercentage: '',
    minAtsScore: '',
    skills: '',
    sortBy: 'atsScore'
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if not authenticated
      if (!isAuthenticated || !token) {
        setError('Not authenticated. Please log in to view students.');
        setIsLoading(false);
        setStudents([]);
        return;
      }
      
      setIsLoading(true);
      setError('');
      try {
        // Build query params, excluding empty values
        const queryParams = {};
        if (filters.minPercentage) queryParams.minPercentage = parseFloat(filters.minPercentage);
        if (filters.minAtsScore) queryParams.minAtsScore = parseFloat(filters.minAtsScore);
        if (filters.skills && filters.skills.trim()) queryParams.skills = filters.skills.trim();
        queryParams.sortBy = filters.sortBy;

        console.log('Fetching with filters:', queryParams);
        console.log('Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        console.log('Authenticated:', isAuthenticated);
        
        const response = await axios.get('http://localhost:5000/api/students/filter', { 
          params: queryParams,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          console.log(`Found ${response.data.students.length} students`);
          setStudents(response.data.students || []);
          if (response.data.students.length === 0) {
            setError('No students found matching the filters. Try adjusting your criteria.');
          }
        } else {
          setError(response.data.message || 'Failed to fetch students');
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (error.response?.status === 403) {
          setError('You do not have permission to view students.');
        } else {
          setError(error.response?.data?.message || error.message || 'Failed to fetch students');
        }
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters, token, isAuthenticated]);



  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear any previous errors when filters change
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <Container>
      <FilterSection>
        <FilterInput
          type="number"
          name="minPercentage"
          placeholder="Min Percentage"
          value={filters.minPercentage}
          onChange={handleFilterChange}
        />
        <FilterInput
          type="number"
          name="minAtsScore"
          placeholder="Min ATS Score"
          value={filters.minAtsScore}
          onChange={handleFilterChange}
        />
        <FilterInput
          type="text"
          name="skills"
          placeholder="Required Skills (comma separated)"
          value={filters.skills}
          onChange={handleFilterChange}
        />
        <FilterSelect name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
          <option value="atsScore">Sort by ATS Score</option>
          <option value="percentage">Sort by Percentage</option>
        </FilterSelect>
      </FilterSection>

      {error && (
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      )}

      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading students...</p>
        </LoadingContainer>
      ) : students.length === 0 ? (
        <EmptyState>
          <p>No students found matching the filters.</p>
        </EmptyState>
      ) : (
        <StudentsGrid>
          {students.map((student) => (
            <StudentTile
              key={student._id}
              onClick={() => handleStudentClick(student)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <StudentAvatar src={student.avatarUrl || '/default-avatar.png'} alt={student.name} />
              <StudentInfo>
                <StudentName>{student.name}</StudentName>
                <StudentDetails>
                  <DetailItem>ATS Score: {student.resume?.ats?.score || 'N/A'}</DetailItem>
                  <DetailItem>
                    Skills: {student.resume?.skills?.slice(0, 3).join(', ') || 'N/A'}
                  </DetailItem>
                  <DetailItem>
                    Academic Score: {student.academicDetails?.[0]?.grade || 'N/A'}
                  </DetailItem>
                </StudentDetails>
                <ViewProfileButton>View Profile</ViewProfileButton>
              </StudentInfo>
            </StudentTile>
          ))}
        </StudentsGrid>
      )}

      {isModalOpen && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
`;

const StudentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const StudentTile = styled(motion.div)`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StudentAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #4a90e2;
  padding: 2px;
`;

const StudentInfo = styled.div`
  text-align: center;
  width: 100%;
`;

const StudentName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
`;

const StudentDetails = styled.div`
  margin: 0.5rem 0;
`;

const DetailItem = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const ViewProfileButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;

  &:hover {
    background-color: #357abd;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e53e3e;
  padding: 1rem;
  background-color: #fff5f5;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #4a5568;
`;

const LoadingSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #4a5568;
  background-color: #f7fafc;
  border-radius: 0.5rem;
`;

export default Recruiter;