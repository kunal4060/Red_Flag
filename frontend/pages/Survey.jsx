import React, { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

const Survey = () => {
  const [formData, setFormData] = useState({
    source: "",
    profession: "",
    ageGroup: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/survey/submit", formData);
      setSubmitted(true);
      navigate("/login");
    } catch (err) {
      alert("Failed to submit survey.");
    }
  };

  if (submitted) {
    return (
      <div className="my-6 flex flex-col items-center justify-center ">
        <div className="text-3xl font-semibold my-4">
          Thank you for filling out the survey!
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 flex flex-col items-center justify-center ">
      <div className="text-3xl font-semibold my-4">Survey</div>
      <div className="text-neutral-400 mb-6 text-center">
        Please fill out the survey below to help us improve our services.
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-black shadow-md rounded-2xl p-6 space-y-5"
      >
        {/* Where did you hear about us */}
        <div>
          <label className="mb-2">Where did you hear about us?</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full rounded-xl px-3 py-3 bg-neutral-800 mt-2"
            required
          >
            <option value="">-- Select an option --</option>
            <option value="friends">Friends / Family</option>
            <option value="social">Social Media</option>
            <option value="ads">Advertisements</option>
            <option value="search">Search Engine</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Profession */}
        <div>
          <label className="mb-2">Your Profession</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            placeholder="e.g. Student, Engineer, Teacher"
            className="w-full bg-neutral-800 rounded-xl px-3 py-3 mt-2"
            required
          />
        </div>

        {/* Age Group */}
        <div>
          <label className="mb-2">Age Group</label>
          <select
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            className="w-full rounded-xl px-3 py-3 bg-neutral-800 mt-2 mb-4"
            required
          >
            <option value="">-- Select an option --</option>
            <option value="under18">Under 18</option>
            <option value="18-25">18–25</option>
            <option value="26-40">26–40</option>
            <option value="40+">40+</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-white text-black py-2 px-4 rounded-xl hover:bg-blue-600 transition"
        >
          Submit Survey
        </button>
      </form>
    </div>
  );
};

export default Survey;
