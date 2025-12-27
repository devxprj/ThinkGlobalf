import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/courses").then(r => setCourses(r.data));
  }, []);

  return (
    <div className="courses-page">
      <h2 className="courses-title">Explore Courses</h2>
      <div className="course-grid">
        {courses.map(course => (
          <Link key={course.id} to={`/course/${course.id}`} className="course-card">
            {course.thumbnail && <img src={`http://localhost:8080/uploads/thumbnails/${course.thumbnail}`} alt={course.title} className="course-img"/>}
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
