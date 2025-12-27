import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get("/courses")
      .then(res => {
        const selected = res.data.find(c => c.id == id);
        setCourse(selected);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!course)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading course...
      </p>
    );

  return (
    <div className="course-details-container">

      {/* Back Button */}
      <button
        className="btn-outline back-btn"
        onClick={() => navigate("/courses")}
      >
        ← Back to Courses
      </button>

      <div className="course-details-card">
        <img
          src={`http://localhost:8080/uploads/thumbnails/${course.thumbnail}`}
          alt={course.title}
          className="course-details-img"
        />

        <div className="course-details-info">
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
      </div>

      <h2 className="materials-title">Course Materials</h2>

      <div className="pdf-list">
        {course.files?.length ? (
          course.files.map(f => (
            <div key={f.id} className="pdf-card">
              <span>{f.pdf_file}</span>
              <a
                href={`http://localhost:8080/uploads/pdfs/${f.pdf_file}`}
                download
                className="btn-primary btn-download"
              >
                Download
              </a>
            </div>
          ))
        ) : (
          <p>No materials uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
