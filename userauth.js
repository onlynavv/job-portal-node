import express from "express"
const router = express.Router()
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {getUserByEmail, genPassword, createUser, editRecruiterBio, updateUserProfile, getUserById, getUserInfo} from  "./helper.js"
import { auth } from "./customauth.js"

router.route("/signup")
.post(async(request, response)=>{
    const {username, password,email,role, location} = request.body
    const userFromDB = await getUserByEmail(email)

    if(userFromDB){
        response.status(400).send({msg:"email already exists"})
        return
    }

    if(password.length < 8){
        response.status(400).send({msg: "password must be longer"})
        return
    }

    if(!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@!#%&]).{8,}$/g.test(password)){
		response.status(400).send({msg: "pattern does not match"})
		return
	}

    const hashedPassword = await genPassword(password)

    const result = await createUser({username, password:hashedPassword, role, email, location, createdAt: new Date()})

    if(result.acknowledged === true){
        response.send({msg:"user created sucessfully"})
    }
    else{
        response.status(400).send({msg:"try again.."})
    }

})

router.route("/login")
.post(async(request, response)=>{
    const {email, password} = request.body
    const userFromDB = await getUserByEmail(email)

    if(!userFromDB){
        response.status(401).send({msg:"incorrect credentials"})
        return
    }

    const storedPassword = userFromDB.password

    const isPasswordMatch = await bcrypt.compare(password, storedPassword)

    if(isPasswordMatch){
        const token = jwt.sign({id:userFromDB._id, role:userFromDB.role}, process.env.SECRET_KEY)
        response.send({msg:"successfull login",userFromDB:{...userFromDB, token:token}})
    }else{
        response.status(401).send({msg: "incorrect credentials"})
    }
})

router.route("/editRecruiterBio")
.put(async(request, response)=>{
    console.log(request.body)
    const {recruiterId, recruiterBio} = request.body
    const result = await editRecruiterBio(recruiterId, recruiterBio)
    response.send(result)
})

router.route("/editUserProfile")
.put(auth, async (request, response)=>{
    console.log(request.body)
    const userId = request.user.id
    const userFromDB = await getUserById(userId)
    const resume = userFromDB.info.resume
    const result = await updateUserProfile({...request.body, resume}, userId)
    response.send(result)
})

router.route("/getUserInfo")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const result = await getUserInfo(userId)
    response.send(result)
})

router.route("/getUserInfoById/:id")
.get(auth, async(request, response)=>{
    const {id} = request.params
    const result = await getUserById(id)
    response.send(result)
})

export const userAuthRouter = router