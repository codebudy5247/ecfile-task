const express = require("express");
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");
const connectDb = require("./utils/connectDb")
const HealthCheckRouter = require("./routes/healthCheck.route")
const UserRouter = require("./routes/user.route")

const app = express();

dotenv.config();

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// API Routes
app.use("/api/healthcheck", HealthCheckRouter);
app.use("/api/users", UserRouter);


const port = 1337;
app.listen(port, async () => {
  console.log(`Server started on port: ${port}`);
  await connectDb();
});
