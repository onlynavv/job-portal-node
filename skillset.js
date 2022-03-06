import express from "express"
const router = express.Router()
import {createSkill, getSkills} from "./helper.js"

router.route("/addSkill")
.post(async (request, response)=>{
    console.log(request.body)
    const result = await createSkill(request.body)
    response.send(result)
})

router.route("/getSkills")
.get(async (request, response)=>{
    const result = await getSkills()
    response.send(result)
})

export const skillsetRouter = router