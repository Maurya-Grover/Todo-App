let express = require('express');
let mongodb = require('mongodb');
let sanitizeHTML = require('sanitize-html');
let app = express();

app.use(express.static('public'));

let connectionString =
	'mongodb+srv://admin:murye@cluster0.tt2xr.mongodb.net/toDoApp?retryWrites=true&w=majority';
const client = new mongodb.MongoClient(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
async function fetchDatabase() {
	await client.connect();
	return client.db('toDoApp');
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(6969);

function passwordProtected(req, res, next) {
	res.set('WWW-Authenticate', 'Basic realm="Todo App"');
	if (req.headers.authorization == 'Basic dXNlYXBwOm11cnll') {
		next();
	} else {
		res.status(401).send('Authentication Failed');
	}
}
app.use(passwordProtected);
app.get('/', async (req, res) => {
	let db = await fetchDatabase();
	db.collection('data')
		.find()
		.toArray((err, items) => {
			res.send(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Simple To-Do App</title>
            <link
                rel="stylesheet"
                href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
                integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS"
                crossorigin="anonymous"
            />
        </head>
            <body>
                <div class="container">
                    <h1 class="display-4 text-center py-1">To-Do App</h1>

                    <div class="jumbotron p-3 shadow-sm">
                        <form id="create-form" action="/create-item" method="POST">
                            <div class="d-flex align-items-center">
                                <input
                                    id="create-field"
                                    name="item"
                                    autofocus
                                    autocomplete="off"
                                    class="form-control mr-3"
                                    type="text"
                                    style="flex: 1"
                                />
                                <button class="btn btn-primary">Add New Item</button>
                            </div>
                        </form>
                    </div>

                    <ul id="item-list" class="list-group pb-5"></ul>
                </div>
                <script>let items = ${JSON.stringify(items)}</script>
                <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
                <script src="/browser.js"></script>
            </body>
        </html>
    `);
		});
	// await client.close();
	console.log('Page Loaded');
});

app.post('/create-item', async (req, res) => {
	let db = await fetchDatabase();
	let userInput = req.body.task;
	// cleaning up user input. incase they have included some malicious text like random javascript code
	userInput = sanitizeHTML(userInput, {
		allowedTags: [],
		allowedAttributes: {},
	});
	// the arrow function is called when the CRUD operation is completed
	// hence we will confirm the response only when operation is completed
	// alternatively I could use await and store the promise
	const query = { task: userInput };
	db.collection('data').insertOne(query, (err, info) => {
		let update = { task: userInput, _id: info.insertedId.toString() };
		res.send(update);
	});
	// await client.close();
	console.log('New Task Added');
});

app.post('/update-item', async (req, res) => {
	let db = await fetchDatabase();
	let updatedTask = req.body.task;
	updatedTask = sanitizeHTML(updatedTask, {
		allowedTags: [],
		allowedAttributes: {},
	});
	db.collection('data').findOneAndUpdate(
		{ _id: new mongodb.ObjectId(req.body.id) },
		{ $set: { task: updatedTask } },
		() => {
			res.send('Success');
		}
	);
	//await client.close();
	console.log('Database Updated');
});

app.post('/delete-item', async (req, res) => {
	let db = await fetchDatabase();
	let itemID = req.body.id;
	db.collection('data').deleteOne({ _id: new mongodb.ObjectId(itemID) }, () => {
		res.send('Success');
	});
	//await client.close();
	console.log('Deleted Successfully');
});
