import { createSlice } from "@reduxjs/toolkit";
const applicationSlice = createSlice({
    name: "application",
    initialState: {
    applicants: []
    },
    reducers: {
        setAllApplication: (state, action) => {
            state.applicants = action.payload;
        },
        updateApplicantStage: (state, action) => {
            const { applicationId, status, stageDetails, stageHistory } = action.payload;
            if (state.applicants?.applications) {
                state.applicants.applications = state.applicants.applications.map((app) =>
                    app._id === applicationId
                        ? {
                            ...app,
                            status,
                            stageDetails: { ...app.stageDetails, ...stageDetails },
                            stageHistory: stageHistory || app.stageHistory,
                        }
                        : app
                );
            }
        }
    }
})

export const { setAllApplication, updateApplicantStage } = applicationSlice.actions
export default applicationSlice.reducer