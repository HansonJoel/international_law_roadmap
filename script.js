// Initialize progress tracking
let progressData = {
  tasks: {},
  lastSaved: null,
};

// Load saved progress
function loadProgress() {
  const saved = localStorage.getItem("tradeLawyerProgress");
  if (saved) {
    progressData = JSON.parse(saved);
    // Restore checkbox states
    Object.keys(progressData.tasks).forEach((taskId) => {
      const checkbox = document.querySelector(`[data-task-id="${taskId}"]`);
      if (checkbox) {
        checkbox.checked = progressData.tasks[taskId];
        updateTaskStatus(checkbox);
      }
    });
  }
  updateAllStats();
}

// Save progress
function saveProgress() {
  progressData.lastSaved = new Date().toISOString();
  localStorage.setItem("tradeLawyerProgress", JSON.stringify(progressData));
  showNotification("Progress saved successfully!");
}

// Initialize task IDs and event listeners
function initializeTasks() {
  const checkboxes = document.querySelectorAll(".task-checkbox");
  checkboxes.forEach((checkbox, index) => {
    const taskId = `task_${index}`;
    checkbox.setAttribute("data-task-id", taskId);
    checkbox.addEventListener("change", function () {
      progressData.tasks[taskId] = this.checked;
      updateTaskStatus(this);
      updateAllStats();
      saveProgress();
    });
  });
}

// Update task visual status
function updateTaskStatus(checkbox) {
  const task = checkbox.closest(".task");
  const statusElement = task.querySelector(".task-status");

  if (checkbox.checked) {
    task.classList.add("completed");
    statusElement.textContent = "Completed";
    statusElement.className = "task-status status-completed";
  } else {
    task.classList.remove("completed");
    statusElement.textContent = "Pending";
    statusElement.className = "task-status status-pending";
  }
}

// Update all statistics
function updateAllStats() {
  const allTasks = document.querySelectorAll(".task-checkbox");
  const completedTasks = document.querySelectorAll(".task-checkbox:checked");
  const milestones = document.querySelectorAll(
    '.task-checkbox[data-type="milestone"]'
  );
  const completedMilestones = document.querySelectorAll(
    '.task-checkbox[data-type="milestone"]:checked'
  );

  // Update stat cards
  document.getElementById("totalTasks").textContent = allTasks.length;
  document.getElementById("completedTasks").textContent = completedTasks.length;
  document.getElementById("totalMilestones").textContent = milestones.length;
  document.getElementById("completedMilestones").textContent =
    completedMilestones.length;

  // Calculate overall percentage
  const overallPercent =
    allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;
  document.getElementById("overallPercent").textContent = overallPercent + "%";
  document.getElementById("overallProgressText").textContent =
    overallPercent + "%";
  document.getElementById("overallProgressBar").style.width =
    overallPercent + "%";
  document.getElementById("floatingProgress").textContent =
    overallPercent + "%";

  // Update phase progress
  for (let i = 1; i <= 4; i++) {
    updatePhaseProgress(i);
  }
}

// Update individual phase progress
function updatePhaseProgress(phaseNumber) {
  const phase = document.querySelector(`[data-phase="${phaseNumber}"]`);
  const phaseTasks = phase.querySelectorAll(".task-checkbox");
  const phaseCompleted = phase.querySelectorAll(".task-checkbox:checked");

  const percent =
    phaseTasks.length > 0
      ? Math.round((phaseCompleted.length / phaseTasks.length) * 100)
      : 0;

  document.getElementById(`phase${phaseNumber}Progress`).style.width =
    percent + "%";
  document.getElementById(`phase${phaseNumber}Percent`).textContent =
    percent + "%";
}

// Toggle phase collapse
function togglePhase(phaseNumber) {
  const phase = document.querySelector(`[data-phase="${phaseNumber}"]`);
  phase.classList.toggle("collapsed");
}

// Export to Excel
function exportToExcel() {
  const data = [];
  data.push(["Phase", "Month", "Task", "Type", "Status", "Completion Date"]);

  document.querySelectorAll(".phase").forEach((phase, phaseIndex) => {
    const phaseTitle = phase.querySelector(".phase-title").textContent;

    phase.querySelectorAll(".month").forEach((month) => {
      const monthTitle = month.querySelector(".month-header").textContent;

      month.querySelectorAll(".task").forEach((task) => {
        const checkbox = task.querySelector(".task-checkbox");
        const taskText = task.querySelector(".task-text").textContent;
        const taskType = checkbox.getAttribute("data-type") || "task";
        const status = checkbox.checked ? "Completed" : "Pending";
        const completionDate = checkbox.checked
          ? new Date().toLocaleDateString()
          : "";

        data.push([
          phaseTitle,
          monthTitle,
          taskText,
          taskType,
          status,
          completionDate,
        ]);
      });
    });
  });

  // Convert to CSV
  const csv = data
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    "trade_lawyer_progress_" + new Date().toISOString().split("T")[0] + ".csv";
  a.click();
  window.URL.revokeObjectURL(url);

  showNotification("Progress exported to Excel!");
}

// Generate detailed report
function generateReport() {
  const reportWindow = window.open("", "_blank");
  const allTasks = document.querySelectorAll(".task-checkbox");
  const completedTasks = document.querySelectorAll(".task-checkbox:checked");
  const overallPercent =
    allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

  let reportHTML = `
                <html>
                <head>
                    <title>International Trade Lawyer Progress Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
                        .phase { margin: 20px 0; border: 1px solid #ddd; border-radius: 10px; }
                        .phase-header { background: #34495e; color: white; padding: 15px; }
                        .task-list { padding: 15px; }
                        .completed { color: green; }
                        .pending { color: red; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>International Trade Lawyer Progress Report</h1>
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="stats">
                        <div class="stat-card">
                            <h3>${allTasks.length}</h3>
                            <p>Total Tasks</p>
                        </div>
                        <div class="stat-card">
                            <h3>${completedTasks.length}</h3>
                            <p>Completed Tasks</p>
                        </div>
                        <div class="stat-card">
                            <h3>${overallPercent}%</h3>
                            <p>Overall Progress</p>
                        </div>
                    </div>
            `;

  document.querySelectorAll(".phase").forEach((phase, index) => {
    const phaseTitle = phase.querySelector(".phase-title").textContent;
    const phaseTasks = phase.querySelectorAll(".task-checkbox");
    const phaseCompleted = phase.querySelectorAll(".task-checkbox:checked");
    const phasePercent =
      phaseTasks.length > 0
        ? Math.round((phaseCompleted.length / phaseTasks.length) * 100)
        : 0;

    reportHTML += `
                    <div class="phase">
                        <div class="phase-header">
                            <h3>${phaseTitle}</h3>
                            <p>Progress: ${phasePercent}% (${phaseCompleted.length}/${phaseTasks.length})</p>
                        </div>
                        <div class="task-list">
                `;

    phase.querySelectorAll(".task").forEach((task) => {
      const checkbox = task.querySelector(".task-checkbox");
      const taskText = task.querySelector(".task-text").textContent;
      const status = checkbox.checked ? "completed" : "pending";
      const statusText = checkbox.checked ? "✅ Completed" : "⏳ Pending";

      reportHTML += `<p class="${status}"><strong>${statusText}:</strong> ${taskText}</p>`;
    });

    reportHTML += "</div></div>";
  });

  reportHTML += "</body></html>";
  reportWindow.document.write(reportHTML);
  reportWindow.document.close();

  showNotification("Detailed report generated!");
}

// Reset all progress
function resetProgress() {
  if (
    confirm(
      "Are you sure you want to reset all progress? This action cannot be undone."
    )
  ) {
    progressData = { tasks: {}, lastSaved: null };
    localStorage.removeItem("tradeLawyerProgress");

    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
      updateTaskStatus(checkbox);
    });

    updateAllStats();
    showNotification("All progress has been reset!");
  }
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById("notification");
  const text = document.getElementById("notificationText");
  text.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  initializeTasks();
  loadProgress();
  updateAllStats();
});

// Auto-save every 30 seconds
setInterval(saveProgress, 30000);
