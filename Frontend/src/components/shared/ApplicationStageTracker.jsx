const stages = [
  "applied",
  "shortlisted",
  "interview",
  "offer extended",
  "hired",
];

const labels = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview: "Interview",
  "offer extended": "Offer extended",
  hired: "Hired",
};

const ApplicationStageTracker = ({ status = "applied", stageHistory = [] }) => {
  const latestUpdate = Array.isArray(stageHistory)
    ? stageHistory[stageHistory.length - 1]
    : null;
  if (status === "declined") {
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

  const currentIndex = Math.max(stages.indexOf(status), 0);

  return (
    <div>
      <div
        className="flex min-w-[310px] items-start"
        role="img"
        aria-label={`Application status: ${labels[stages[currentIndex]]}`}
      >
        {stages.map((stage, index) => {
          const complete = index <= currentIndex;
          return (
            <div className="flex flex-1 items-start last:flex-none" key={stage}>
              <div className="flex w-12 flex-col items-center">
                <span
                  className={`h-3 w-3 rounded-full ring-4 ring-white ${
                    complete ? "bg-violet-600" : "bg-gray-200"
                  }`}
                />
                <span className={`mt-2 text-[10px] ${complete ? "font-semibold text-violet-700" : "text-gray-400"}`}>
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
