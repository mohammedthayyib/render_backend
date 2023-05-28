const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')


app.use(express.json())
//used to access request body, without this line we wont be able to access request body, it will be an empty object - this is a middleware -used to convert the request from json to object

morgan.token('req', function (req, res) { 
	return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :req'));


app.use(cors())
app.use(express.static('build'))//this middleware allows us to use the minified code for user level use and we no more have to start the react file with npm start , starting the server is only needed

if(process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1)
}

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const password = process.argv[2]

const url = `mongodb+srv://mohammedthayyibdev:${password}@cluster1.tpiudbx.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// defining schema
const noteSchema = new mongoose.Schema({
	content: String,
	important: Boolean,
})

// changing the cofigurable options using set method of the schema to exclude the __v field and _id field getting send to the user
// by transforming the toJSON method
noteSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()//this conversion of id to string is needed for later use
		delete returnedObject._id
		delete returnedObject.__v
	}
})

// defining model
const Note = mongoose.model('Note', noteSchema)

const generateId = () => {
	const maxId = notes.length > 0 ?
	 Math.max(...notes.map(n => n.id)): 0
	return maxId + 1
}

app.post('/api/notes', (request, response) => {
	// console.log(request.get('content-type'));
	// console.log(request.headers);
		
	const body = request.body//console.log(body);
	if(!body.content){
		return response.status(400).json({error: 'content missing'})
	}

	const note = {
		content: body.content,
		important: body.important || false,
		id: generateId()
	}
	notes = notes.concat(note)
	response.json(note)
})

app.get('/', (request, response) => {
	response.send('<h1><hello World!> </h1>')
})

app.get('/api/notes', (request, response) => {
	// when we get a GET request at /api/notes , we fetch the notes from the database using Note model
	Note.find({}).then(notes => {
		// console.log(notes);
		response.json(notes)
	})
})


app.get('/api/notes/:id', (request, response) => {
	const id = Number(request.params.id)
	const note = notes.find(note => note.id === id)
	// console.log(note);
	if(note){
		response.json(note)
	} else {
		response.status(404).end()
	}
})
app.delete('/api/notes/:id', (request, response) => {
	const id = Number(request.params.id)
	notes = notes.filter(note => note.id !== id)
	response.status(204).end()
})

const unknownEndpoint = (request, response) => {
	response.status(400).send({'error': 'unknown endpoint'})
}

app.use(unknownEndpoint)

// const app = http.createServer((request, response) => {
//     response.writeHead(200, {'Content-Type':'application/json'})
//     response.end(JSON.stringify(notes))
// })

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`server running on port ${PORT}`)


