import { setAllJobs, setJobsLoading } from '@/redux/jobSlice'
import { JOB_API_ENDPOINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

const useGetAllJobs = ({ includeSearchedQuery = true } = {}) => {
    const dispatch = useDispatch()
    const { searchedQuery } = useSelector(store => store.job)
    const [searchParams] = useSearchParams()
    const location = searchParams.get("location") || ""
    const experience = searchParams.get("experience") || ""
    const keyword = includeSearchedQuery ? searchedQuery : ""

    useEffect(() => {
        const controller = new AbortController()

        const fetchAllJobs = async () => {
            dispatch(setJobsLoading(true))
            try {
                const res = await axios.get(`${JOB_API_ENDPOINT}/get`, {
                    params: { keyword, location, experience },
                    signal: controller.signal,
                })
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs))
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Job search request failed:", error)
                }
            } finally {
                if (!controller.signal.aborted) dispatch(setJobsLoading(false))
            }
        }

        fetchAllJobs()
        return () => controller.abort()
    }, [dispatch, keyword, location, experience])
}

export default useGetAllJobs
