const stages = [
  "applied",
  "shortlisted",
  "interview scheduled",
  "offer issued",
  "offer accepted",
];

const labels = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  "interview scheduled": "Interview",
  "offer issued": "Offer Extended",
  "offer accepted": "Hired",
};

const legacyStatusMap = {
  pending: "applied",
  "under review": "applied",
  interview: "interview scheduled",
  "interview cleared": "interview scheduled",
  "offer extended": "offer issued",
  selected: "offer issued",
  hired: "offer accepted",
  accepted: "offer accepted",
  declined: "offer rejected",
  rejected: "offer rejected",
  "interview not cleared": "offer rejected",
};

const ApplicationStageTracker = ({ status = "applied", stageHistory = [] }) => {
  const normalizedStatus = legacyStatusMap[status] || status;
  const latestUpdate = Array.isArray(stageHistory)
    ? stageHistory[stageHistory.length - 1]
    : null;

  if (["rejected", "interview not cleared", "offer rejected", "declined"].includes(normalizedStatus)) {
    return (
      <div>
        <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          Declined
        </span>
        {latestUpdate?.updatedAt && (
          <p className="mt-1 text-xs text-gray-500">
            Updated {new Date(latestUpdate.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  const currentIndex = Math.max(stages.indexOf(normalizedStatus), 0);

  return (
    <div>
      <div
        className="flex min-w-[380px] items-start"
        role="img"
        aria-label={`Application status: ${labels[stages[currentIndex]] || "Applied"}`}
      >
        {stages.map((stage, index) => {
          const complete = index <= currentIndex;
          return (
            <div className="flex flex-1 items-start last:flex-none" key={stage}>
              <div className={`flex ${stage === "offer issued" || stage === "offer accepted" ? "w-20" : "w-16"} flex-col items-center`}>
                <span className={`h-3 w-3 rounded-full ring-4 ring-white ${complete ? "bg-violet-600" : "bg-gray-200"}`} />
                <span className={`mt-2 text-center text-[10px] leading-tight ${complete ? "font-semibold text-violet-700" : "text-gray-400"}`}>
                  {labels[stage]}
                </span>
              </div>
              {index < stages.length - 1 && (
                <span className={`mt-1.5 h-0.5 flex-1 ${index < currentIndex ? "bg-violet-500" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
      {latestUpdate?.updatedAt && (
        <p className="mt-1 text-xs text-gray-500">
          Updated {new Date(latestUpdate.updatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default ApplicationStageTracker;
