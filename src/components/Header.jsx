// // src/components/Header.jsx
// import React from 'react';
// import styled from 'styled-components';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // adjust path if needed
// import logo from '../assets/img/Talentsync.png'; 


// const navLinks = [
//   { name: 'DASHBOARD', path: '/dashboard' },
//   { name: ' RESUME ANALYSIS', path: '/resume-analysis' },
//   { name: 'APPTITUDE CALCULATOR', path: '/aptitude-calculator' },
//   { name: 'EXPLORE', path: '/explore' }
// ];

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = React.useState(false);

//   // Safely get auth user; if useAuth throws, treat as unauthenticated
//   let user = null;
//   try {
//     const auth = useAuth();
//     if (auth?.user) user = auth.user;
//   } catch (e) {
//     user = null;
//   }

//   const isAuthenticated = Boolean(user && (user.email || user._id || user.name));

//   const getInitials = (name) => {
//     if (!name) return '';
//     const parts = name.split(' ');
//     if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
//     return name[0].toUpperCase();
//   };

//   return (
//     <NavContainer >
//       {/* <Logo to="/">TALENTSYNC | SOLUTIONS</Logo> */}
//       <Logo to="/dashboard"><img className='w-60 ' src={logo} alt="" /></Logo>

//       {/* Only show hamburger when authenticated (mobile menu only for logged-in users) */}
//       {isAuthenticated && (
//         <Hamburger
//           aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
//           aria-expanded={isMenuOpen}
//           onClick={() => setIsMenuOpen((s) => !s)}
//         >
//           <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
//         </Hamburger>
//       )}

//       {/* Nav links: only render on authenticated users */}
//       {isAuthenticated && (
//         <NavLinks $isOpen={isMenuOpen}>
//           <ul>
//             {navLinks.map((link) => (
//               <li key={link.name}>
//                 <StyledLink to={link.path} onClick={() => setIsMenuOpen(false)}>
//                   {link.name}
//                 </StyledLink>
//               </li>
//             ))}
//           </ul>
//         </NavLinks>
//       )}

//       {/* User profile / initials: only for authenticated users */}
//       {isAuthenticated ? (
//         <UserProfile>
//           {user?.imageUrl ? (
//             <UserImage src={user.imageUrl} alt={user.name} />
//           ) : (
//             <UserInitials title={user?.name || 'User'}>{getInitials(user?.name || 'U')}</UserInitials>
//           )}
//         </UserProfile>
//       ) : (
//         // Optional: minimal right-side actions for unauthenticated (Login/Register)
//         <AuthActions>
//           <AuthLink to="/login">Login</AuthLink>
//           <AuthLink to="/register">Register</AuthLink>
//         </AuthActions>
//       )}
//     </NavContainer>
//   );
// };

// export default Header;

// /* ---------- STYLED COMPONENTS ---------- */

// const COLORS = {
//   lightBlue: '#E8F8FF',
//   lavender: '#E6E6FA',
//   white: '#FFFFFF',
//   darkText: '#23304A',
//   accent: '#A25772'
// };

// const NavContainer = styled.header`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 3rem;
//   height: 70px;
//   background: linear-gradient(90deg, ${COLORS.white} 0%, ${COLORS.lightBlue} 100%);
//   box-shadow: 0 2px 6px rgba(0,0,0,0.06);
//   position: sticky;
//   top: 0;
//   z-index: 1000;
// `;

// const Logo = styled(Link)`
//   font-size: 1.25rem;
//   font-weight: 700;
//   color: ${COLORS.darkText};
//   text-decoration: none;
// `;

// /* hamburger - hidden on desktop */
// const Hamburger = styled.button`
//   display: none;
//   font-size: 1.25rem;
//   cursor: pointer;
//   color: ${COLORS.darkText};
//   background: transparent;
//   border: none;

//   @media (max-width: 768px) {
//     display: block;
//     position: absolute;
//     right: 1rem;
//     top: 50%;
//     transform: translateY(-50%);
//   }
// `;

// /* NavLinks: show inline on desktop; mobile uses $isOpen to toggle */
// const NavLinks = styled.nav`
//   ul {
//     display: flex;
//     align-items: center;
//     list-style: none;
//     margin: 0;
//     padding: 0;
//     gap: 2rem;
//     transition: none;
//     fonrt-weight: 900;
//     opacity: 1;
//     pointer-events: auto;
//     transform: none;
//   }

//   @media (max-width: 768px) {
//     ul {
//       flex-direction: column;
//       gap: 1rem;
//       position: absolute;
//       top: 70px;
//       left: 0;
//       width: 100%;
//       background: ${COLORS.white};
//       padding: 1.25rem 0;
//       box-shadow: 0 6px 18px rgba(0,0,0,0.08);
//       transition: transform 0.28s ease, opacity 0.28s ease;
//       transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-8px)')};
//       opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
//       pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
//       z-index: 999;
//     }
//   }
// `;

// const StyledLink = styled(Link)`
//   color: ${COLORS.darkText};
//   text-decoration: none;
//   font-size: 1rem;
//   font-weight: 600;
//   padding-bottom: 0.25rem;
//   position: relative;

//   &::after {
//     content: '';
//     position: absolute;
//     width: 100%;
//     height: 2px;
//     bottom: -3px;
//     left: 0;
//     background-color: ${COLORS.accent};
//     transform: scaleX(0);
//     transform-origin: right;
//     transition: transform 0.22s ease;
//   }

//   &:hover::after {
//     transform: scaleX(1);
//     transform-origin: left;
//   }
// `;

// const UserProfile = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;

//   @media (max-width: 768px) {
//     display: none;
//   }
// `;

// const UserImage = styled.img`
//   width: 40px;
//   height: 40px;
//   border-radius: 999px;
//   object-fit: cover;
//   border: 2px solid ${COLORS.lavender};
// `;

// const UserInitials = styled.div`
//   width: 40px;
//   height: 40px;
//   border-radius: 999px;
//   background-color: ${COLORS.lavender};
//   color: ${COLORS.darkText};
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-weight: 700;
//   font-size: 0.95rem;
// `;

// /* minimal auth actions for guest users */
// const AuthActions = styled.div`
//   display: flex;
//   gap: 0.75rem;
//   align-items: center;
// `;

// const AuthLink = styled(Link)`
//   font-size: 0.95rem;
//   color: ${COLORS.darkText};
//   text-decoration: none;
//   padding: 6px 10px;
//   border-radius: 8px;

//   &:hover {
//     background: rgba(0,0,0,0.03);
//   }
// `;



// src/components/Header.jsx
import React, { useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path if needed
import logo from '../assets/img/Talentsync.png';

const navLinks = [
  { name: 'DASHBOARD', path: '/dashboard' },
  { name: ' RESUME ANALYSIS', path: '/resume-analysis' },
  { name: 'APPTITUDE CALCULATOR', path: '/aptitude-calculator' },
  { name: 'EXPLORE', path: '/explore' }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Safely get auth user; if useAuth throws, treat as unauthenticated
  let user = null;
  let logout = null;
  try {
    const auth = useAuth();
    if (auth?.user) user = auth.user;
    if (auth?.logout) logout = auth.logout;
  } catch (e) {
    user = null;
  }

  const isAuthenticated = Boolean(user && (user.email || user._id || user.name));

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/login');
    }
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <NavContainer >
      <Logo to="/dashboard"><img className='w-60 ' src={logo} alt="" /></Logo>

      {/* Only show hamburger when authenticated (mobile menu only for logged-in users) */}
      {isAuthenticated && (
        <Hamburger
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((s) => !s)}
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </Hamburger>
      )}

      {/* Nav links: only render on authenticated users */}
      {isAuthenticated && (
        <NavLinks $isOpen={isMenuOpen}>
          <ul>
            {navLinks.map((link) => (
              <li key={link.name}>
                <StyledLink to={link.path} onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </StyledLink>
              </li>
            ))}
          </ul>
        </NavLinks>
      )}

      {/* User profile / initials: only for authenticated users */}
      {isAuthenticated ? (
        <UserProfileContainer ref={dropdownRef}>
          <UserProfileButton
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            $isOpen={isDropdownOpen}
          >
            {user?.imageUrl ? (
              <UserImage src={user.imageUrl} alt={user.name} />
            ) : (
              <UserInitials title={user?.name || 'User'}>{getInitials(user?.name || 'U')}</UserInitials>
            )}
          </UserProfileButton>

          <DropdownMenu $isOpen={isDropdownOpen}>
            <StyledLink to="/profile"><DropdownItem onClick={() => setIsDropdownOpen(false)}>
              <FontAwesomeIcon icon={faUser} />
              Profile
            </DropdownItem></StyledLink>

            <DropdownDivider />
            <DropdownItem onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </DropdownItem>
          </DropdownMenu>
        </UserProfileContainer>
      ) : (
        // Optional: minimal right-side actions for unauthenticated (Login/Register)
        <AuthActions>
          <p className='text-gray-600'>Please Login or Register to continue !</p>
        </AuthActions>
      )}
    </NavContainer>
  );
};

export default Header;

/* ---------- STYLED COMPONENTS ---------- */

const COLORS = {
  lightBlue: '#E8F8FF',
  lavender: '#E6E6FA',
  white: '#FFFFFF',
  darkText: '#0c1a37ff',
  accent: '#c325dcff',
  lightAccent: '#f7cdffff'
};

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(162, 87, 114, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(162, 87, 114, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(162, 87, 114, 0);
  }
`;

const NavContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem;
  height: 70px;
  background: linear-gradient(90deg, ${COLORS.white} 0%, ${COLORS.lightBlue} 100%);
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled(Link)`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${COLORS.darkText};
  text-decoration: none;
`;

/* hamburger - hidden on desktop */
const Hamburger = styled.button`
  display: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${COLORS.darkText};
  background: transparent;
  border: none;

  @media (max-width: 768px) {
    display: block;
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
  }
`;

/* NavLinks: show inline on desktop; mobile uses $isOpen to toggle */
const NavLinks = styled.nav`
  ul {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 2rem;
    transition: none;
    font-weight: 900;
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }

  @media (max-width: 768px) {
    ul {
      flex-direction: column;
      gap: 1rem;
      position: absolute;
      top: 70px;
      left: 0;
      width: 100%;
      background: ${COLORS.white};
      padding: 1.25rem 0;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      transition: transform 0.28s ease, opacity 0.28s ease;
      transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-8px)')};
      opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
      pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
      z-index: 999;
    }
  }
`;

const StyledLink = styled(Link)`
  color: ${COLORS.darkText};
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding-bottom: 0.25rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: -3px;
    left: 0;
    background-color: ${COLORS.accent};
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.22s ease;
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
`;

const UserProfileContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserProfileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid ${({ $isOpen }) => $isOpen ? COLORS.accent : COLORS.lavender};
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${({ $isOpen }) => $isOpen ? pulseAnimation : 'none'} 1s;
  
  &:hover {
    border-color: ${COLORS.accent};
    transform: scale(1.05);
    box-shadow: 0 0 0 4px ${COLORS.lightAccent}40;
  }
`;

const UserImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInitials = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, ${COLORS.lavender} 0%, ${COLORS.lightAccent} 100%);
  color: ${COLORS.darkText};
  font-weight: 700;
  font-size: 1rem;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  width: 200px;
  background: ${COLORS.white};
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.3s ease;
  z-index: 1001;
  animation: ${({ $isOpen }) => $isOpen ? slideIn : 'none'} 0.3s ease forwards;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${COLORS.darkText};
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 0.75rem;
    color: ${COLORS.accent};
    width: 16px;
  }
  
  &:hover {
    background-color: ${COLORS.lightBlue};
  }
  
  span, a {
    text-decoration: none;
    color: inherit;
    font-weight: 500;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background-color: ${COLORS.lavender};
  margin: 0.25rem 0;
`;

/* minimal auth actions for guest users */
const AuthActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const AuthLink = styled(Link)`
  font-size: 0.95rem;
  color: ${COLORS.darkText};
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;

  &:hover {
    background: rgba(0,0,0,0.03);
  }
`;