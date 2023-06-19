# rubberducker

Thought process visualiser for problem-solving.

## setup

- I'm using MongoDB Atlas so you'll have to make an account for it too ¯\_(ツ)_/¯
(unless there is another way I'm not aware of)
- Make a cluster with any name
- Make a database in it with the exact name 'rubberducker'
- Make a collection with any name and update `collectionName` in \backend\routes\page.mjs
- Make a `.env` file in `backend`
- get your connection string and paste `ATLAS_URI="<connection_string>"` in the `.env`

cd frontend
run `npm i`
run `npm start`
cd backend
run `npm i`
run `nodemon ./server.mjs`




