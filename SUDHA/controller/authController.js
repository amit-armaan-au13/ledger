const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const User = require("../modal/userSchema");
const config = require("../config/config");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post("/register", async (req, res) => {
  var hashpassword = bycrypt.hashSync(req.body.password, 8);
  const user = await User.findOne({ email: req.body.email });
  const mobile = await User.findOne({ phone: req.body.phone });
  // const auth = await User.findOne({role:Admin})
  // if(auth){
  if (user || mobile) {
    res.send(
      "user already exists or phone number is already assigned to another user"
    );
  } else {
    User.create(
      {
        name: req.body.name,
        email: req.body.email,
        password: hashpassword,
        phone: req.body.phone,
        profile: req.body.profile,
        role:req.body.role?req.body.role:"User",
        amount:req.body.amount?req.body.amount:0,
        milk:req.body.milk,
        cattleFeed:req.body.cattleFeed

      },
      (err, user) => {
        if (err) throw err;
        res.status(200).send("registered successfully");
      }
    );
  }
  // res.send("Not authorized to register")
// }
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send("error while login");
    if (!user) return res.send({ auth: false, token: "NO USER FOUND" });
    else {
      const passIsValid = bycrypt.compareSync(req.body.password, user.password);
      if (!passIsValid)
        return res.send({ auth: false, token: "wrong password" });
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 3600,
      });
      res.send({ auth: true, token: token });
    }
  });
});
router.get("/userInfo", (req, res) => {
  var token = req.headers["x-access-token"];
  if (!token) res.send({ auth: false, token: "No token Provided" });
  jwt.verify(token, config.secret, (err, data) => {
    if (err) res.send("error while login");
    User.findById(data.id, (err, result) => {
      res.send(result);
    });
  });
});

router.get("/role",(req,res)=>{
  User.find({role:"Admin"},{name:1},(err,user)=>{
    if(err) throw err
    res.send(user)
  })
})

router.get("/dues", (req, res) => {
  User.find({amount:{$gt:1500}}, { name: 1,_id:0 }, (err, user) => {
    if (err) throw err;
    res.send(user);
  });
});

router.get("/users", (req, res) => {
  User.find({}, (err, user) => {
    if (err) throw err;
    res.status(200), res.json(user);
  });
});
module.exports = router;
