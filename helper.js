import { ObjectId } from "mongodb"
import {client} from "./index.js"
import bcrypt from "bcrypt"

async function createSkill(skill){
    return await client.db("job").collection("skillset").insertOne(skill)
}

async function getSkills(){
    return await client.db("job").collection("skillset").find({}).toArray()
}

async function addJobListing(data){
    return await client.db("job").collection("joblistings").insertOne(data)
}

async function getUserJobListings(){
    return await client.db("job").collection("joblistings").find({"deadline":{$gte: new Date().toISOString()}},{projection:{jobStatus: 0}}).sort({postedOn:-1}).toArray()
}

async function searchJobsByTitle(search){
    return await client.db("job").collection("joblistings").find({jobtitle:{$regex:search, $options:"i"},"deadline":{$gte: new Date().toISOString()}},{projection:{jobStatus: 0}}).toArray()
}

async function editRecruiterBio(id, data){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(id)},{$set:{bio:data}},{upsert:true})
}

async function getJobDetailsById(id){
    return await client.db("job").collection("joblistings").findOne({"_id":ObjectId(id)})
}

async function updateUserProfile(data, userId){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(userId)}, {$set:{info:data}},{upsert:true})
}

async function uploadResumePdf(filePath,id){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(id)}, {$set:{"info.resume":filePath}},{upsert:true})
}

async function applyForJob(data, jobId){
    return await client.db("job").collection("joblistings").updateOne({"_id":ObjectId(jobId)},{$push:{"applicants":data}})
}

async function addJobToApplied(data, userId){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(userId)}, {$push:{"appliedJobs":data}}, {upsert:true})
}

async function getUsersApplicationsArr(userId){
    return await client.db("job").collection("users").findOne({_id:ObjectId(userId)},{projection:{"appliedJobs":1}})
}

async function removeApplication(applicationId, jobId){
    return await client.db("job").collection("joblistings").updateOne({_id:ObjectId(jobId)},{$pull:{"applicants":{applicationId:applicationId}}})
}

async function removeApplicationFromUser(applicationId, userId){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(userId)}, {$pull:{"appliedJobs":{applicationId:applicationId}}})
}

async function getOngoingCampaigns(email){
    return await client.db("job").collection("joblistings").find({recruiterEmail:email, jobStatus:"open"}).sort({postedOn:-1}).toArray()
}

async function getCompletedCampaigns(email){
    return await client.db("job").collection("joblistings").find({recruiterEmail:email, jobStatus:"completed"}).sort({postedOn:-1}).toArray()
}

async function setToCompleteCampaign(jobStatusValue, jobId){
    return await client.db("job").collection("joblistings").updateOne({_id:ObjectId(jobId)},{$set:{"jobStatus":jobStatusValue}})
}

async function getApplicantsByJobId(jobId){
    return await client.db("job").collection("joblistings").findOne({_id:ObjectId(jobId)},{projection:{"applicants": 1}})
}

async function changeCandidateStatus(applicationId, jobId, applicationStatus, data){
    return await client.db("job").collection("joblistings").updateOne({_id:ObjectId(jobId),"applicants.applicationId":applicationId},{$set:{"applicants.$.applicationStatus":applicationStatus}})
}

async function updateUserStatus(candidateId, applicationId, applicationStatus){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(candidateId), "appliedJobs.applicationId":applicationId},{$set:{"appliedJobs.$.applicationStatus":applicationStatus}})
}

async function removeCandidateFromApplicants(jobId, applicationId){
    return await client.db("job").collection("joblistings").updateOne({_id:ObjectId(jobId)},{$pull:{"applicants":{applicationId:applicationId}}})
}

async function setRejectionForCandidate(applicationId, candidateId, applicationStatus){
    return await client.db("job").collection("users").updateOne({_id:ObjectId(candidateId), "appliedJobs.applicationId":applicationId},{$set:{"appliedJobs.$.applicationStatus":applicationStatus}})
}

async function getUserInfo(userId){
    return await client.db("job").collection("users").findOne({_id:ObjectId(userId)},{projection:{"info":1}})
}

async function getUserById(userId){
    return await client.db("job").collection("users").findOne({_id:ObjectId(userId)})
}

async function getUserByEmail(email){
    return await client.db("job").collection("users").findOne({email:email})
}

async function genPassword(password){
    const NO_OF_ROUNDS = 10
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS)
    
    const hashedPassword = await bcrypt.hash(password, salt)
    
    return hashedPassword
}

async function createUser(data) {
    return await client.db("job").collection("users").insertOne(data);
}

export {getUserByEmail, genPassword, createUser, createSkill, getSkills, addJobListing, getUserJobListings, searchJobsByTitle, getJobDetailsById, editRecruiterBio, uploadResumePdf, applyForJob, addJobToApplied, getUsersApplicationsArr, removeApplication, removeApplicationFromUser, getOngoingCampaigns, getCompletedCampaigns, setToCompleteCampaign, getApplicantsByJobId, changeCandidateStatus, updateUserStatus, removeCandidateFromApplicants, setRejectionForCandidate, updateUserProfile, getUserById, getUserInfo}