function getDepartment(category) {
  const departmentMap = {
    room: "Room Service",
    cleanliness: "Housekeeping",
    food: "Restaurant",
    staff: "Front Office",
    value: "Management",
  };

  return departmentMap[category] || "Management";
}

function getSeverityFromRating(rating) {
  const value = Number(rating);

  if (value === 1) return "Critical";
  if (value === 2) return "Major";

  return "Minor";
}

function getSlaHours(severity) {
  const slaMap = {
    Minor: 24,
    Major: 4,
    Critical: 1,
  };

  return slaMap[severity] || 24;
}

function calculateSlaDeadline(severity) {
  const deadline = new Date();
  const slaHours = getSlaHours(severity);

  deadline.setHours(deadline.getHours() + slaHours);

  return deadline.toISOString();
}

function isSlaBreached(slaDeadline) {
  const now = new Date();
  const deadline = new Date(slaDeadline);

  return now > deadline;
}

module.exports = {
  getDepartment,
  getSeverityFromRating,
  getSlaHours,
  calculateSlaDeadline,
  isSlaBreached,
};