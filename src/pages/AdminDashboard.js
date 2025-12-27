import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null); // For updates

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses", {
        headers: { Authorization: "Bearer " + token },
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchCourses();
  }, [role]);

  // Add or Update Course
  const handleSubmitCourse = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
    pdfFiles.forEach((f) => fd.append("pdfs", f));

    try {
      if (editingCourseId) {
        // Update existing course
        await api.put(`/courses/${editingCourseId}`, fd, {
          headers: { Authorization: "Bearer " + token },
        });
        setEditingCourseId(null);
      } else {
        // Add new course
        await api.post("/courses", fd, {
          headers: { Authorization: "Bearer " + token },
        });
      }

      // Reset form
      setForm({ title: "", description: "" });
      setThumbnailFile(null);
      setPdfFiles([]);

      // Refresh courses
      fetchCourses();
    } catch (err) {
      console.error("Error adding/updating course:", err);
    }
  };

  // Prepare editing course
  const handleEditCourse = (course) => {
    setEditingCourseId(course.id);
    setForm({ title: course.title, description: course.description });
    setThumbnailFile(null);
    setPdfFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete course
  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  if (role !== "admin") return <h2 style={{ textAlign: "center" }}>Access Denied</h2>;

  return (
    <div className="courses-page">
      <h2 className="courses-title">Admin Dashboard</h2>

      {/* Add / Update Course Form */}
      <div className="auth-box">
        <form onSubmit={handleSubmitCourse}>
          <input
            type="text"
            placeholder="Course Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Course Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "12px",
              background: "#020617",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "#fff",
            }}
          />
          <label>
            Course Thumbnail:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
            />
          </label>
          <label>
            Course Files (PDF/DOCX):
            <input
              type="file"
              multiple
              accept=".pdf,.docx"
              onChange={(e) => setPdfFiles([...e.target.files])}
            />
          </label>
          <button className="btn-primary" type="submit">
            {editingCourseId ? "Update Course" : "Add Course"}
          </button>
          {editingCourseId && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditingCourseId(null);
                setForm({ title: "", description: "" });
                setThumbnailFile(null);
                setPdfFiles([]);
              }}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Courses List */}
      <div className="course-grid" style={{ marginTop: "30px" }}>
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            {course.thumbnail && (
              <img
                src={`http://localhost:8080/uploads/thumbnails/${course.thumbnail}`}
                alt={course.title}
                className="course-img"
              />
            )}
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <button className="btn-outline" onClick={() => handleEditCourse(course)}>
              Edit
            </button>
            <button className="btn-outline" onClick={() => handleDelete(course.id)}>
              Delete
            </button>
            <div className="pdf-list" style={{ marginTop: "10px" }}>
              {course.files?.map((f) => (
                <a
                  key={f.id}
                  href={`http://localhost:8080/uploads/pdfs/${f.pdf_file}`}
                  download
                  style={{ display: "block", color: "#60a5fa", marginTop: "5px" }}
                >
                  {f.pdf_file}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
