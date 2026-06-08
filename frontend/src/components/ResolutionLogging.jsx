import { useState } from "react";
import API from "../services/api";

function ResolutionLogging({ complaints, refreshData }) {
  const [complaintId, setComplaintId] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolvedBy, setResolvedBy] = useState("");

  const handleResolve = async (event) => {
    event.preventDefault();

    if (!complaintId) {
      alert("Please select complaint");
      return;
    }

    try {
      await API.put(`/complaints/${complaintId}/resolve`, {
        resolutionNotes,
        resolvedBy,
      });

      alert("Complaint marked as resolved");

      setComplaintId("");
      setResolutionNotes("");
      setResolvedBy("");

      refreshData();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to resolve complaint");
    }
  };

  return (
    <div className="page-card">
      <h1>Resolution Logging Screen</h1>

      <form className="resolution-form" onSubmit={handleResolve}>
        <select
          value={complaintId}
          onChange={(event) => setComplaintId(event.target.value)}
          required
        >
          <option value="">Select Complaint</option>
          {complaints
            .filter((item) => item.status !== "Resolved")
            .map((complaint) => (
              <option key={complaint.id} value={complaint.id}>
                Complaint #{complaint.id} - {complaint.category}
              </option>
            ))}
        </select>

        <textarea
          placeholder="Enter resolution notes..."
          value={resolutionNotes}
          onChange={(event) => setResolutionNotes(event.target.value)}
          required
        />

        <input
          placeholder="Resolved By"
          value={resolvedBy}
          onChange={(event) => setResolvedBy(event.target.value)}
          required
        />

        <button className="success-btn" type="submit">
          Mark as Resolved
        </button>
      </form>
    </div>
  );
}

export default ResolutionLogging;