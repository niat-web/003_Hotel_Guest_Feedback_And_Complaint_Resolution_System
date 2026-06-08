function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { key: "feedback", label: "Guest Feedback" },
    { key: "complaints", label: "Complaints" },
    { key: "detail", label: "Complaint Detail" },
    { key: "resolve", label: "Resolution Logging" },
    { key: "escalations", label: "Escalations" },
    { key: "reports", label: "Reports" },
  ];

  return (
    <aside className="sidebar">
      <h2>RK Suites</h2>

      <nav>
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={activePage === item.key ? "active" : ""}
            onClick={() => setActivePage(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;