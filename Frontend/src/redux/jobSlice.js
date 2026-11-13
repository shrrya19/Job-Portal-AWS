import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name: "job",
    initialState: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: null,
        searchJobByText: "",
        allAppliedJobs: [],
        searchedQuery: ""
    },
    reducers: {
        setAllJobs: (state, action) => {
            state.allJobs = action.payload
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload
        },
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload
        },
        updateAppliedJobStatus: (state, action) => {
            const { applicationId, status, stageHistory, stageDetails } = action.payload;
            state.allAppliedJobs = state.allAppliedJobs.map((application) =>
                application._id === applicationId
                    ? {
                        ...application,
                        status,
                        stageHistory: stageHistory || application.stageHistory,
                        stageDetails: { ...application.stageDetails, ...stageDetails },
                    }
                    : application
            );
        },
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload
        },
        updateAdminJob: (state, action) => {
            const updated = action.payload;
            state.allAdminJobs = state.allAdminJobs.map((job) =>
                job._id === updated._id ? { ...job, ...updated } : job
            );
        },
        deleteAdminJob: (state, action) => {
            const jobId = action.payload;
            state.allAdminJobs = state.allAdminJobs.filter((job) => job._id !== jobId);
        }
    }
})

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    updateAppliedJobStatus,
    setSearchedQuery,
    updateAdminJob,
    deleteAdminJob
} = jobSlice.actions
export default jobSlice.reducer 