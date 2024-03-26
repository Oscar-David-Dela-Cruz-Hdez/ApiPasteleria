import app from "./app.js"
import { connectDB } from "./db.js"

const PORT = process.env.PORT ?? 1234

connectDB();
app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})
