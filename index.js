import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import {MongoClient} from "mongodb"
import { userAuthRouter } from "./userauth.js"
import { skillsetRouter } from "./skillset.js"
import { jobListingRouter } from "./joblistings.js"
import multer from "multer"
import { uploadResumePdf } from "./helper.js"
import { auth } from "./customauth.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT

app.use(cors())

app.use(express.json({limit: '50mb'}))

const MONGO_URL = process.env.MONGO_URL

async function createConnection(){
    const client = new MongoClient(MONGO_URL)
    await client.connect()
    console.log("mongodb connected")
    return client
}

export const client = await createConnection()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const multerFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[1] === "pdf"){
        cb(null, true)
    }else{
        cb(new Error("Not a pdf file"), false)
    }
}

const uploadStorage = multer({ storage: storage, fileFilter:multerFilter })

app.get("/", (request, response)=>{
    response.send("hai from job portal")
})

app.use("/job/user", userAuthRouter)
app.use("/job/skillset", skillsetRouter)
app.use("/job/joblisting", jobListingRouter)

app.put("/job/user/upload/resumePdf", uploadStorage.single("file"), auth,async (request, response)=>{
    const pdfFile = request.file
    const userId = request.user.id
    console.log(pdfFile)
    const result = await uploadResumePdf(pdfFile.path, userId)
    response.send("file uploaded successfully")
})

app.get("/job/user/resume/:filename", async(request, response)=>{
    const {filename} = request.params
    const file = `${filename}`
    response.download(file)
})

app.listen(PORT, ()=>{
    console.log("app started at", PORT)
})