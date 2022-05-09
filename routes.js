const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const router = express.Router();

const templatepath = path.join(__dirname, '/templates/veiws');

// ------------------------------------------- API ------------------------------------ //
router.post('/login', (req, res) => {
    const user = req.body.username;
    const password = req.body.password;

    fs.readFile('./database.json', 'utf8', (err , data) => {
        if(err){
            console.log("Error reading file");
        } else {
            parsed_db = JSON.parse(data);

            let db_user = parsed_db.find(
                (it) => {
                    return it.user === user;
                }
            );

            bcrypt.compare(password, db_user["password"], (err, isMatch) => {
                if (err){
                    console.log("something went wrong");
                } else if (isMatch) {
                    res.render(path.join(templatepath, '/home.ejs'), {usr : `${user}`});
                } else {
                    res.render(path.join(templatepath, '/login.ejs'), {output : `Incorrect Username or Password!!`});
                }
            });
        }
    })
});

router.post('/register', async (req, res) => {
    try {
        if (req.body.password1 === req.body.password2){
            const hashedPassword = await bcrypt.hash(req.body.password1, 10);
            const newUser = {
                name : req.body.name,
                user : req.body.username,
                password : hashedPassword
            };

            fs.readFile('./database.json', 'utf8', (err , data) => {
                if(err){
                    console.log("Error reading file");
                } else {
                    parsed_db = JSON.parse(data);
                    let { user } = parsed_db.find(
                        (it) => {
                            return it.user === newUser.user;
                        }
                    );
                    if (user === newUser.user){
                        res.render(path.join(templatepath, '/register.ejs'), {output : `Username already exists!!`});
                    } else {
                        parsed_db.push(user);
                        fs.writeFile('./database.json',JSON.stringify(parsed_db, null, 4) , (err) => {
                            if (err) 
                                console.log("Error data user to the database");
                        })
                        res.redirect('/login');
                    }
                }
            })
        }
    } catch (e) {
        console.log('Error creating acc!!' + e);
        res.redirect('/register');
    }
});


module.exports = router;