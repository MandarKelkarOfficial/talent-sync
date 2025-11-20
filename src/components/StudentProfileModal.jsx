import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StudentProfileModal = ({ student, onClose }) => {
  // Prepare data for charts
  const aptitudeData = student.aptitudeResults?.scoresByTopic || [];
  const skillsData = student.resume?.skills?.map(skill => ({
    name: skill,
    value: Math.random() * 100 // In a real app, this would be actual proficiency data
  })) || [];

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <ProfileHeader>
          <Avatar src={student.avatarUrl || '/default-avatar.png'} alt={student.name} />
          <HeaderInfo>
            <h2>{student.name}</h2>
            <p>{student.email}</p>
            <p>Phone: {student.phoneNumber}</p>
          </HeaderInfo>
        </ProfileHeader>

        <Section>
          <h3>Academic Performance</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={student.academicDetails || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="grade" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Section>

        <Section>
          <h3>Aptitude Test Results</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aptitudeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Section>

        <Section>
          <h3>Skills Assessment</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Section>

        <Section>
          <h3>Resume Analysis</h3>
          <ResumeStats>
            <StatItem>
              <StatLabel>ATS Score</StatLabel>
              <StatValue>{student.resume?.ats?.score || 'N/A'}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Experience</StatLabel>
              <StatValue>{student.resume?.experience?.length || 0} years</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Education</StatLabel>
              <StatValue>{student.resume?.education?.length || 0} degrees</StatValue>
            </StatItem>
          </ResumeStats>
          {student.resume?.ats?.detailedInsights && (
            <InsightsSection>
              <h4>AI Insights</h4>
              <p>{student.resume.ats.detailedInsights.summary}</p>
              <StrengthsSection>
                <h5>Strengths</h5>
                <ul>
                  {student.resume.ats.detailedInsights.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </StrengthsSection>
            </InsightsSection>
          )}
        </Section>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
`;

const HeaderInfo = styled.div`
  h2 {
    margin: 0 0 0.5rem 0;
  }
  p {
    margin: 0.25rem 0;
    color: #666;
  }
`;

const Section = styled.section`
  margin: 2rem 0;
  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const ChartContainer = styled.div`
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const ResumeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const StatItem = styled.div`
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const StatLabel = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const StatValue = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const InsightsSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;

  h4 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  p {
    color: #555;
    line-height: 1.5;
  }
`;

const StrengthsSection = styled.div`
  margin-top: 1rem;

  h5 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      color: #555;
      margin: 0.25rem 0;
    }
  }
`;

export default StudentProfileModal;