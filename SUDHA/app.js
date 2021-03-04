const express = require("express");
const app = express();
const db = require("./config/db");
const port = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());
const AuthController = require("./controller/authController");
app.use("/api/auth", AuthController);

app.get('/',(req,res)=>{
    res.send("healthCheck Done")
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
