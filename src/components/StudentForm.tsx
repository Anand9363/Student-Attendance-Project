import React, { useState, useEffect } from "react";

type Student = {
  _id?: string;
  name: string;
  studentId: string;
  photo?: string;
};

type Props = {
  initialData?: Student;
};

const StudentForm: React.FC<Props> = ({ initialData }) => {
  const [formData, setFormData] = useState<Student>({
    name: "",
    studentId: "",
    photo: "",
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      studentId: formData.studentId,
      photo: formData.photo || "",
    };

    try {
      const response = await fetch("http://localhost:5000/api/students/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Student registered:", result);
      alert("Student Registered Successfully!");
      
      // Reset form
      setFormData({ name: "", studentId: "", photo: "" });
    } catch (error) {
      console.error("❌ Error registering student:", error);
      alert("Failed to register student.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <div>
        <label className="block font-medium">Name:</label>
        <input
          className="border p-2 w-full rounded"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Student ID:</label>
        <input
          className="border p-2 w-full rounded"
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block font-medium">Photo URL (optional):</label>
        <input
          className="border p-2 w-full rounded"
          type="text"
          name="photo"
          value={formData.photo || ""}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded w-full"
      >
        {initialData ? "Update" : "Add"} Student
      </button>
    </form>
  );
};

export default StudentForm;
