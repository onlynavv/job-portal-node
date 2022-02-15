import express from "express"
import { auth } from "./customauth.js"
const router = express.Router()
import {addJobListing, getUserJobListings, searchJobsByTitle, getJobDetailsById, applyForJob, addJobToApplied, getUsersApplicationsArr, removeApplication, removeApplicationFromUser, getOngoingCampaigns, getCompletedCampaigns, setToCompleteCampaign, getApplicantsByJobId, changeCandidateStatus, updateUserStatus, removeCandidateFromApplicants, setRejectionForCandidate} from "./helper.js"

router.route("/addJobListing")
.post(async (request, response)=>{
    const result = await addJobListing({...request.body, workexperience: parseInt(request.body.workexperience), salary: parseInt(request.body.salary), noofapplicants: parseInt(request.body.applicants), positions:parseInt(request.body.positions), deadline: new Date(parseInt(request.body.deadline) * 1000).toISOString(), postedOn: new Date(), jobStatus:"open", applicants:[]})
    response.send(result)
})

router.route("/getUserJobListing")
.get(async (request, response)=>{
    const result = await getUserJobListings()
    response.send(result)
})

router.route("/searchJobsByTitle")
.get(async(request, response)=>{
    const {search} = request.query
    console.log(search)
    const result = await searchJobsByTitle(search)
    response.send(result)
})

router.route("/filterJobs")
.get(async(request, response)=>{
    const {jobtype, location, experience, salary} = request.query
    let filterJobListings = await getUserJobListings()

    if(jobtype){
        filterJobListings = filterJobListings.filter((item)=>{
            return item.jobtype === jobtype
        })
    }

    if(location){
        filterJobListings = filterJobListings.filter((item)=>{
            return item.recruiterLocation === location
        })
    }

    if(experience){
        filterJobListings = filterJobListings.filter((item)=>{
            return item.workexperience <= parseInt(experience)
        })
    }
    
    if(salary){
        filterJobListings = filterJobListings.filter((item)=>{
            return item.salary <= parseInt(salary)
        })
    }

    response.send(filterJobListings)
})

router.route("/getJobDetailById/:id")
.get(async(request, response)=>{    
    const {id} = request.params
    console.log(id)
    const result = await getJobDetailsById(id)
    response.send(result)
})

router.route("/apply")
.put(auth,async (request, response)=>{

    const userId = request.user.id

    const {applicationId, jobId} = request.body

    console.log({...request.body, submittedAt:new Date(), applicationStatus:"applied"})
    const result = await applyForJob({...request.body, submittedAt:new Date(), applicationStatus:"applied"},jobId)
    const data = await addJobToApplied({...request.body, submittedAt:new Date(), applicationStatus:"applied"},userId)
    response.send({result, data})
})

router.route("/getSingleUserApplications")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const usersApplicationsArr = await getUsersApplicationsArr(userId)
    // const result = await getUsersApplication(usersApplicationsArr.appliedJobs)
    response.send(usersApplicationsArr)
})

router.route("/removeApplication/:applicationId/:jobId")
.put(auth, async(request, response)=>{
    const {applicationId, jobId} = request.params
    console.log(applicationId, jobId)
    const userId = request.user.id
    const result = await removeApplication(applicationId, jobId)
    const data = await removeApplicationFromUser(applicationId, userId)
    response.send({result, data})
})

router.route("/getOngoingCampaigns/:email")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const {email} = request.params
    console.log(email)
    const result = await getOngoingCampaigns(email)
    response.send(result)
})

router.route("/getCompletedCampaigns/:email")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const {email} = request.params
    console.log(email)
    const result = await getCompletedCampaigns(email)
    response.send(result)
})

router.route("/setToCompleteCampaign")
.put(auth, async(request, response)=>{
    console.log(request.body)
    const {jobStatusValue, jobId} = request.body
    const result = await setToCompleteCampaign(jobStatusValue, jobId)
    response.send(result)
})

router.route("/getApplicantsByJobId/:id")
.get(auth, async(request, response)=>{
    const {id} = request.params
    const result = await getApplicantsByJobId(id)
    response.send(result)
})

router.route("/updateCandidateStatus")
.put(auth, async(request, response)=>{
    console.log(request.body)
    const {applicationId, jobId, applicationStatus, candidateId} = request.body
    const result = await changeCandidateStatus(applicationId, jobId, applicationStatus, request.body)
    const data = await updateUserStatus(candidateId, applicationId, applicationStatus)
    response.send({result, data})
})

router.route("/removeCandidateFromApplicants")
.put(auth, async(request, response)=>{
    const {candidateId, jobId, applicationId, applicantEmail, applicationStatus} = request.body
    const result = await removeCandidateFromApplicants(jobId, applicationId)
    const data = await setRejectionForCandidate(applicationId, candidateId, applicationStatus)
    response.send({result, data})
})

export const jobListingRouter = router