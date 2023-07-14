import app from "../server.mjs"
import route from "../routes/page.mjs"

app.use("/api/", route)
module.exports = app