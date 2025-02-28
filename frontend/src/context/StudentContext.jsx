import React, { createContext, useState, useEffect } from "react";
import api from "../api"; // Ensure this is your configured Axios instance

export const StudentsContext = createContext();

export const StudentsProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/students");
        const data = response.data;
        if (data.success && Array.isArray(data.students)) {
          const formattedStudents = data.students.map((student) => ({
            name: student.studentName,
            grade: student.grade,
            board: student.board,
            subjects: student.subjects
          }));
          setStudents(formattedStudents);
        } else {
          console.error("Unexpected response for students:", data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <StudentsContext.Provider value={{ students, loading }}>
      {children}
    </StudentsContext.Provider>
  );
};
