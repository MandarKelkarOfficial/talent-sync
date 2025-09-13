import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';
import logo from '../assets/img/Talentsync.png';


const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <SectionTitle>      <img className='w-50 ' src={logo} alt="" />
          </SectionTitle>
          <p>
            Empowering students to make smarter career decisions with cutting-edge tools—ATS-friendly resumes, skill analysis, and personalized guidance. Join us in shaping a brighter, more successful future.
          </p>
        </FooterSection>

        {/* <FooterSection>
          <SectionTitle>Quick Links</SectionTitle>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
        </FooterSection> */}

        <FooterSection>
          <SectionTitle>Follow Us</SectionTitle>
          <SocialIcons>
            <SocialIconLink href="https://www.instagram.com/its_maddy_644/" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </SocialIconLink>
            <SocialIconLink href="https://github.com/MandarKelkarOfficial" aria-label="GitHub">
              <FontAwesomeIcon icon={faGithub} />
            </SocialIconLink>
            <SocialIconLink href="https://www.linkedin.com/in/mandarkelkar644/" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </SocialIconLink>
          </SocialIcons>
        </FooterSection>
      </FooterContent>
      <FooterBottom>
        <p>&copy; {new Date().getFullYear()} TalentSync. All Rights Reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;

// STYLED COMPONENTS ✨
// Re-using the color theme from the header for consistency
const COLORS = {
  lightBlue: '#E0F7FA',
  lavender: '#E6E6FA',
  white: '#FFFFFF',
  darkText: '#333A73',
  lightText: '#5c678a'
};

const FooterContainer = styled.footer`
  background-color: ${COLORS.white};
  padding: 3rem 2rem 1rem;
  border-top: 1px solid ${COLORS.lightBlue};
  color: ${COLORS.lightText};
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 2rem;
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 250px;
  
  p {
    line-height: 1.6;
    margin: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: ${COLORS.darkText};
  margin-bottom: 1rem;
  margin-left: -0.6rem;
`;

const FooterLink = styled.a`
  display: block;
  color: ${COLORS.lightText};
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${COLORS.darkText};
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialIconLink = styled.a`
  color: ${COLORS.darkText};
  font-size: 1.5rem;
  transition: transform 0.3s ease, color 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    color: #A25772; /* Accent color from header */
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid ${COLORS.lightBlue};
  font-size: 0.9rem;
`;