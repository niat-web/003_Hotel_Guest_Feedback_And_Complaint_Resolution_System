import { useState } from "react";
import API from "../services/api";

function FeedbackForm({ refreshData = () => {} }) {
  const [form, setForm] = useState({
    roomNo: "",
    checkOutDate: "",
    roomRating: "",
    cleanlinessRating: "",
    foodRating: "",
    staffRating: "",
    valueRating: "",
    comment: "",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
     const response = await API.post("/feedback", form);

alert("Feedback submitted successfully!");

console.log("Saved feedback:", response.data);

      setForm({
        roomNo: "",
        checkOutDate: "",
        roomRating: "",
        cleanlinessRating: "",
        foodRating: "",
        staffRating: "",
        valueRating: "",
        comment: "",
      });

      refreshData();
    } catch (error) {
      console.log("Submit Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Backend is not running or API failed"
      );
    }
  };

  const ratingOptions = [1, 2, 3, 4, 5];

  return (
    <div className="page-card feedback-bg">
      <div className="form-card">
        <h1>Guest Feedback</h1>
        <p>Please share your feedback to help us improve our service.</p>

        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <input
              name="roomNo"
              placeholder="Room Number"
              value={form.roomNo}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="checkOutDate"
              value={form.checkOutDate}
              onChange={handleChange}
              required
            />
          </div>

          {[
            ["roomRating", "Room Quality"],
            ["cleanlinessRating", "Cleanliness"],
            ["foodRating", "Food Quality"],
            ["staffRating", "Staff Service"],
            ["valueRating", "Value for Money"],
          ].map(([name, label]) => (
            <div className="rating-row" key={name}>
              <label>{label}</label>

              <select
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
              >
                <option value="">Select Rating</option>
                {ratingOptions.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Star
                  </option>
                ))}
              </select>
            </div>
          ))}

          <textarea
            name="comment"
            placeholder="Write your comments here..."
            value={form.comment}
            onChange={handleChange}
          />

          <button className="primary-btn" type="submit">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;