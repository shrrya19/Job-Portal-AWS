import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import IndiaLocationDatalist from "./shared/IndiaLocationDatalist";
import indiaLocations from "@/data/indiaLocations.json";

const filterData = [
  {
    filterType: "Job Role",
    filterKey: "role",
    array: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "Product Manager", "Data Scientist", "DevOps Engineer"]
  },
  {
    filterType: "Salary Range",
    filterKey: "salary",
    array: [
      { label: "0-1 LPA", value: "0-1" },
      { label: "1-2 LPA", value: "1-2" },
      { label: "2-5 LPA", value: "2-5" },
      { label: "5-10 LPA", value: "5-10" },
      { label: "10-20 LPA", value: "10-20" },
      { label: "20+ LPA", value: "20+" },
    ]
  }
]

const FilterCard = ({ filters, onFilterChange }) => {
  const [availableLocations, setAvailableLocations] = useState([]);
  const [locationDraft, setLocationDraft] = useState(filters.location);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${COMPANY_API_ENDPOINT}/public`, {
          signal: controller.signal,
        });
        if (!response.data.success) throw new Error("Unable to load India location options.");
        setAvailableLocations(response.data.locations || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Indian location lookup failed:", error);
          toast.error(error?.response?.data?.message || "Unable to load location options.");
        }
      }
    };

    fetchLocations();
    return () => controller.abort();
  }, []);

  const applyLocationFilter = (event) => {
    event.preventDefault();
    const location = locationDraft.trim();
    const locationAliases = ["Bangalore", "Banglore", "Gurgaon", "Bombay", "Calcutta", "Madras", "Trivandrum", "Goa (Panaji)"];
    const validLocation = location.toLowerCase() === "all india" ||
      indiaLocations.includes(location) ||
      locationAliases.includes(location) ||
      availableLocations.includes(location);
    if (!validLocation) {
      toast.error("Choose an Indian location from the dropdown.");
      return;
    }
    onFilterChange("location", location);
  };

  return (
    <div className="w-full bg-white p-3 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">Filter Jobs</h1>
        <button
          type="button"
          onClick={() => onFilterChange("all", "")}
          className="text-sm font-medium text-violet-700 hover:text-violet-900"
        >
          Clear
        </button>
      </div>
      <hr className="mt-3" />
      <div className="mt-3 space-y-4">
        <div>
          <form onSubmit={applyLocationFilter}>
            <Label htmlFor="job-location-filter" className="font-bold text-lg">Location</Label>
            <Input
              id="job-location-filter"
              list="job-filter-india-locations"
              value={locationDraft}
              onChange={(event) => setLocationDraft(event.target.value)}
              placeholder="All India"
              className="mt-2"
            />
            <IndiaLocationDatalist
              id="job-filter-india-locations"
              locations={availableLocations}
              includeAllIndia
            />
            <button type="submit" className="mt-2 text-sm font-medium text-violet-700 hover:text-violet-900">
              Apply location
            </button>
          </form>
        </div>
        {filterData.map((data) => (
          <div key={data.filterKey}>
            <h1 className="font-bold text-lg">{data.filterType}</h1>
            <RadioGroup
              value={filters[data.filterKey]}
              onValueChange={(value) => onFilterChange(data.filterKey, value)}
            >
              {data.array.map((option, idx) => {
                const label = typeof option === "string" ? option : option.label;
                const value = typeof option === "string" ? option : option.value;
                const itemId = `${data.filterType}-${value}-${idx}`;
                return (
                  <div key={itemId} className="my-2 flex items-center space-x-2">
                    <RadioGroupItem value={value} id={itemId} />
                    <Label htmlFor={itemId} className="cursor-pointer">{label}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterCard
