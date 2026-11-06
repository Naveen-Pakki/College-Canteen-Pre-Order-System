import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Start with null so initial application opening strictly presents the Login Page
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pec_canteen_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pec_canteen_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pec_canteen_active_user');
    }
  }, [currentUser]);

  // Student / Faculty Login: College Registration ID + Password
  const loginStudentOrFaculty = (registrationId, password) => {
    const cleanId = (registrationId || '').trim();
    if (!cleanId) return { success: false, message: 'Please enter your College Registration ID.' };
    if (!password) return { success: false, message: 'Please enter your password.' };

    // Check mock database or determine role
    const matched = MOCK_USERS[cleanId] || MOCK_USERS[cleanId.toUpperCase()];
    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    // Auto-detect role if entered custom ID
    const isFac = cleanId.toUpperCase().startsWith('FAC');
    const newUser = {
      registrationId: cleanId.toUpperCase(),
      name: isFac ? "Faculty Member" : "College Student",
      role: isFac ? "FACULTY" : "STUDENT",
      email: `${cleanId.toLowerCase()}@pragati.edu.in`,
      phone: "+91 98480 22334",
      department: isFac ? "Electronics & Communication Engg" : "Computer Science & Engineering",
      college: "Pragati University"
    };
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // Admin Login: Admin ID + Password
  const loginAdmin = (adminId, password) => {
    const cleanId = (adminId || '').trim();
    if (!cleanId) return { success: false, message: 'Please enter your Admin ID.' };
    if (!password) return { success: false, message: 'Please enter your Admin password.' };

    const admin = MOCK_USERS["ADMIN001"];
    setCurrentUser(admin);
    return { success: true, user: admin };
  };

  // Demo Login Helper for Examiner Evaluation
  const demoLogin = (roleType) => {
    if (roleType === 'student') {
      const student = MOCK_USERS["23A91A0501"];
      setCurrentUser(student);
      return student;
    } else if (roleType === 'faculty') {
      const faculty = MOCK_USERS["FAC1024"];
      setCurrentUser(faculty);
      return faculty;
    } else if (roleType === 'admin') {
      const admin = MOCK_USERS["ADMIN001"];
      setCurrentUser(admin);
      return admin;
    }
    return null;
  };

  const updateProfile = (fields) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...fields
    }));
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginStudentOrFaculty,
        loginAdmin,
        demoLogin,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
