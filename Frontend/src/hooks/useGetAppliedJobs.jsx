import axios from 'axios'
import { useDispatch } from 'react-redux'
import { APPLICANT_API_ENDPOINT } from '@/utils/constant'
import { setAllAppliedJobs } from '@/redux/jobSlice'
import { useEffect } from 'react'

const useGetAppliedJobs = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    let active = true;
    let timeoutId;

    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICANT_API_ENDPOINT}/get`, { withCredentials: true })
        if(active && res.data.success) {
          dispatch(setAllAppliedJobs(res.data.application))
        }
      } catch(error) {
        if (active) console.error("Application status refresh failed:", error);
      } finally {
        if (active) timeoutId = setTimeout(fetchAppliedJobs, 15000);
      }
    } 
    fetchAppliedJobs()
    return () => {
      active = false;
      clearTimeout(timeoutId);
    }
  }, [dispatch])
}

export default useGetAppliedJobs
