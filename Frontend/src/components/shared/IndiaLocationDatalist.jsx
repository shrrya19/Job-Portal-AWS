import indiaLocations from "@/data/indiaLocations.json";

const IndiaLocationDatalist = ({ id, locations = [], includeAllIndia = false, excludeRemote = false }) => {
  const options = [...new Set([
    ...(includeAllIndia ? ["All India"] : []),
    ...indiaLocations.filter((location) => !excludeRemote || location !== "Remote"),
    "Bangalore",
    "Banglore",
    "Gurgaon",
    "Bombay",
    "Calcutta",
    "Madras",
    "Trivandrum",
    "Goa (Panaji)",
    ...locations,
  ].filter((location) => !excludeRemote || location !== "Remote"))];

  return (
  <datalist id={id}>
    {options.map((location) => (
      <option key={location} value={location} />
    ))}
  </datalist>
  );
};

export default IndiaLocationDatalist;
