import React, { createContext, useState, useEffect } from "react";
import api from "../api"; // Your Axios instance

export const InfoContext = createContext();

export const InfoProvider = ({ children }) => {
  const [info, setInfo] = useState({
    subjects: [],
    boards: [],
    grades: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // Fetch data from multiple endpoints in parallel
        const [subjectsResponse, boardsResponse, gradesResponse] = await Promise.all([
          api.get("/branches"),
          api.get("/boards"),
          api.get("/grades"),
        ]);

        // Update the info state with all fetched data
        setInfo({
          subjects: subjectsResponse.data,
          boards: boardsResponse.data,
          grades: gradesResponse.data,
        });
      } catch (error) {
        console.error("Error fetching info:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  return (
    <InfoContext.Provider value={{ 
      info, 
      boards: info.boards, 
      grades: info.grades,
      branches: info.subjects,
      loading, 
      error 
    }}>
      {children}
    </InfoContext.Provider>
  );
};