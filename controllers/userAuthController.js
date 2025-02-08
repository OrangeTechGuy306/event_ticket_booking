const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { SQL } = require('../sql');
require('dotenv').config();

module.exports.createUser =  (req, res) => {
  const { username, password } = req.body;
  try {
    if(!username || !password){
      res.status(400).json({message: "All fields required"})
    }else if(password.length <= 4){
      res.status(400).json({message: "Weak Password"})
    }else{
      SQL.getConnection((e, con)=>{
        if(e){
          res.status(500).json({message: "Error connecting to DB"})
        }else{
          con.query("SELECT * FROM users WHERE username = ?",[username], (er, existingUser)=>{
            if(er){
              res.status(500).json({message: "Error verifying Username"})
            }else{
              if(existingUser.length > 0){
                res.status(400).json({message: "Username already taken"})
              }else{
                const hashedPassword =  bcrypt.hashSync(password, 10);
                con.query("INSERT INTO users(username, password) VALUES (?, ?)", [username, hashedPassword], (err, user)=>{
                  if(err){
                    res.status(500).json({message: "Error creating user"})
                  }else{
                    res.status(201).json({message: "Registration Successful"})
                  }
                })
              }
            }
          })
          con.release()
        }
      })

    }
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

module.exports.login = (req, res) => {

  const { username, password } = req.body;

  try {

    if(!username || !password){
      res.status(400).json({message: "All fields are required"})
    }else{
        SQL.getConnection((e, con)=>{
          if(e){
            res.status(500).json({message: "Error connecting to DB"})
          }else{
            con.query("SELECT * FROM users WHERE username = ?", [username], (er, user)=>{
              if(er){
                res.status(500).json({message: "Error while retrieving user"})
              }else{
                if(user.length > 0){
                  const userPassword = user[0].password
                  const comparePassword = bcrypt.compareSync(password, userPassword)
                  if(comparePassword){
                    const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.json({ token });
                  }else{
                    res.status(400).json({message: "Invalid Password"})
                  }
                }else{
                  res.status(404).json({message: "User not found"})
                }
              }
            })
            con.release()
          }
        })
    }
  } catch (error) {
    res.status(500).json({ message: error.message ?? "Something went wrong" });
  }
};
