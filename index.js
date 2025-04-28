const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')

// // Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://user-authentication-30262.web.app',
        'https://user-authentication-30262.firebaseapp.com',
    ]
    // credentials: true
}))
app.use(express.json())
// app.use(cookieParser())

// const verifyToken = (req, res, next) => {
//     const token = req.cookies?.token

//     if (!token) {
//         return res.status(401).send({ message: "Unauthorized access" })
//     }

//     // verify token
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized access' })
//         }

//         req.user = decoded

//         next()
//     })


// }


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3u9wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const userCollection = client.db('tutor_lagbe').collection('users')
        const tutorialCollection = client.db('tutor_lagbe').collection('tutorials')
        const tutorCollection = client.db('tutor_lagbe').collection('tutors')
        const bookedTutorsCollection = client.db('tutor_lagbe').collection('booked_tutors')
        const lessonCollection = client.db('tutor_lagbe').collection('lessons')

        app.get('/', (req, res) => {
            res.send('Servicer is running perfectly')
        })


        // Lesson Related APIs
        app.post('/lesson', async(req, res) => {
            const lesson = req.body
            const result = await lessonCollection.insertOne(lesson)
            res.send(result)
            console.log(result)
        })

        // Get all lesson
        app.get('/lessons', async(req, res) => {
            const lessons = await lessonCollection.find({}).toArray()
            res.send(lessons)
        })

        // Get specific users lesson by email
        app.get('/my-lessons', async(req, res) => {
            const email = req.query.email
            const query = {'tutor.email': email}
            try{
                const myLessons = await lessonCollection.find(query).toArray()
                res.send(myLessons)
            }catch(error){
                res.status(500).send({message: 'server erro while fetching my lessons'})
            }
        })

        // get lesson by id
        app.get('/lesson/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            try{
                const lesson = await lessonCollection.findOne(query)
                res.send(lesson)
            }catch(error){
                res.status(500).send({message: 'server erro while fetching lesson by id'})
            }
        })


        // Delete lesson
        app.delete('/delete-lesson/:id', async(req, res) => {
            const lessonId = req.params.id
            const query = {_id: new ObjectId(lessonId)}

            const result = await lessonCollection.deleteOne(query)
            res.send(result)
        })


        // // Auth related apis
        // app.post('/jwt', (req, res) => {
        //     const user = req.body
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })

        //     res.cookie('token', token, {
        //         httpOnly: true,
        //         secure: process.env.NODE_ENV=== 'production'
        //     })
        //         .send({ success: true })
        // })


        // app.post('/logout', (req, res) => {
        //     res.clearCookie('token', {
        //         httpOnly: true,
        //         secure: process.env.NODE_ENV=== 'production'
        //     })
        //         .send({ success: true })
        // })


        // User related APIs
        // Post users
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne({...user, role: 'user'})
            res.send(result)
        })

        // Get all users
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        // Delete user
        app.delete('/delete-user/:id', async (req, res) => {
            const userId = req.params.id
            const query = {_id: new ObjectId(userId)}
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })


        // Tutorial Related APIs
        // Post tutorial
        app.post('/tutorials', async (req, res) => {
            const tutorial = req.body

            // distructure tutor info from tutorial
            const {
                tutorName,
                tutorEmail,
                tutorImage,
                language,
                description,
                review,
                price
            } = tutorial

            tutor = {
                tutorName,
                tutorEmail,
                tutorImage,
                language,
                description,
                review,
                price
            }

            const result = await tutorialCollection.insertOne(tutorial)

            const tutorResult = await tutorCollection.insertOne(tutorial)
            res.send(result)
        })

        // Get all tutorials
        app.get('/tutorials', async (req, res) => {
            const result = await tutorialCollection.find().toArray()
            res.send(result)
        })


        // Get tutorial of a specific id
        app.get('/tutorials/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await tutorialCollection.findOne(query)
            res.send(result)
        })


        // Get tutorial based on specific email
        app.get('/my-tutorials', async (req, res) => {
            const email = req.query.email
            const query = { tutorEmail: email }

            const result = await tutorialCollection.find(query).toArray()

            res.send(result)
        })


        // Delete tutorial of specific id
        app.delete('/delete-tutorial/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await tutorialCollection.deleteOne(query)

            res.send(result)
        })



        // update tutorial of specific id
        app.patch('/update-tutorial/:id', async (req, res) => {
            const id = req.params.id
            const updateFields = req.body
            const query = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const update = {
                $set: updateFields
            }

            const result = await tutorialCollection.updateOne(query, update, option)

            res.send(result)
        })


        // Get all tutors
        app.get('/tutors', async (req, res) => {

            const { language } = req.query

            let result
            const tutors = await tutorCollection.find().toArray()

            if (language) {
                const searchedTutors = tutors.filter((tutor) => tutor.language.toLowerCase().startsWith(language.toLowerCase()))
                result = searchedTutors
            } else {
                result = await tutorCollection.find().toArray()
            }
   
            res.send(result)
        })


        // Get tutor of a specific id
        app.get('/tutor/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await tutorCollection.findOne(query)
            res.send(result)
        })


        // Get tutor of a specific category
        app.get('/tutors/:languageName', async (req, res) => {
            const languageCategory = req.params.languageName
            const query = { language: languageCategory }
            const result = await tutorCollection.find(query).toArray()
            res.send(result)
        })


        // Post booked tutors
        app.post('/booked-tutors', async (req, res) => {
            const bookedTutor = req.body
            const { tutorEmail } = req.body

            const bookedTutors = await bookedTutorsCollection.find().toArray()
            const existingTutor = bookedTutors.find(tutor => tutor.tutorEmail === tutorEmail);
            if (existingTutor) {
                return res.status(400).send({ message: "Tutor already booked" });
            }

            const result = await bookedTutorsCollection.insertOne(bookedTutor)



            res.status(200).send(result)
        })

        // get booked tutors
        app.get('/booked-tutors', async (req, res) => {
            const result = await bookedTutorsCollection.find().toArray()
            res.send(result)
        })

        // Insert tutor application
        app.post('/tutor-application', async(req, res)=> {
            const userEmail = req.query.email
            const userInfo = req.body
            const query = {email: userEmail}
            const user = await userCollection.findOne(query)

            if(user?.role !== 'tutor'){
                const updatedDoc = {
                    $set: {
                        userStatus: 'pending',
                        userInfo
                    }
                }

                const result = await userCollection.updateOne(query, updatedDoc)
                res.send(result)
            }else{
                res.send({message: 'User is already a tutor'})
            }
        })




        // Get booked tutorial of specific user
        app.get('/my-booked-tutors', async (req, res) => {
            const email = req.query.email
            const query = { email: email }

            const result = await bookedTutorsCollection.find(query).toArray()

            res.send(result)
        })

        // update review of specific id
        app.patch('/my-booked-tutors/:id', async (req, res) => {
            const tutor = req.body
            const id = tutor.tutorId
            const query = { tutorId: id }

            const bookedTutor = await bookedTutorsCollection.findOne(query)

            let newCount = 0
            if (bookedTutor.review) {
                newCount = bookedTutor.review + 1
            } else {
                newCount = 1
            }

            // Update the review info in booked tutor
            const filter = { tutorId: id }
            const updatedDoc = {
                $set: {
                    review: newCount
                }
            }



            // Update the review info in tutor
            const mainTutorQuery = { _id: new ObjectId(id) }
            const mainTutor = await tutorCollection.findOne(mainTutorQuery)

            let mainTutorCount = 1
            if (mainTutor.review) {
                mainTutorCount = mainTutor.review + 1
            } else {
                mainTutorCount = 1
            }
            const mainTutorUpdatedDoc = {
                $set: {
                    review: mainTutorCount
                }
            }




            const updateResult = await bookedTutorsCollection.updateOne(filter, updatedDoc)
            const mainTutorUpdatedResult = await tutorCollection.updateOne(mainTutorQuery, mainTutorUpdatedDoc)

            res.send(updateResult)
        })





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
