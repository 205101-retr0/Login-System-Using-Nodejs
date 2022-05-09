const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const app = express();

require('dotenv').config();

const staticpath = path.resolve(__dirname, 'static');
const templatepath = path.join(__dirname, '/templates/veiws');

app.use(express.static(staticpath));
app.use(express.urlencoded({ extended: false }));
// app.use('/api', router);

app.set("veiw-engine", "ejs");
app.set('veiws', templatepath);

// ------------------------------------------- ROUTES ------------------------------------ //

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/home', (req, res) => {
    res.render(path.resolve(templatepath, '/home.ejs'), {usr : `Logi First`});
});

app.get('/login', (req, res) => {
    res.render(path.join(templatepath, '/login.ejs'), {output : ``});
});

app.get('/register', (req, res) => {
    res.render(path.join(templatepath, '/register.ejs'), {output : ""});
});

// ------------------------------------------- API ------------------------------------ //
app.post('/login', (req, res) => {
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
            try {
                bcrypt.compare(password, db_user["password"], (err, isMatch) => {
                if (err){
                    console.log("something went wrong");
                } else if (isMatch) {
                    res.render(path.join(templatepath, '/home.ejs'), {usr : `${user}`});
                } else {
                    res.render(path.join(templatepath, '/login.ejs'), {output : `Incorrect Username or Password!!`});
                }
            });
            } catch (e) {
                if (e instanceof TypeError){
                    res.render(path.join(templatepath, '/login.ejs'), {output : `Incorrect Username or Password!!`});
                }
                
            }
        }
    })
});

app.post('/register', async (req, res) => {
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

                    try{
                        let { user } = parsed_db.find(                  // Object destructuring
                        (it) => {
                            return it.user === newUser.user;
                        });

                        if (user === newUser.user){
                        res.render(path.join(templatepath, '/register.ejs'), {output : `Username already exists!!`});
                        }

                    } catch (e) {
                        if (e instanceof TypeError) {
                            parsed_db.push(newUser);
                            console.log("END OF USER PUSHING TILL HERE>")
                            fs.writeFile('./database.json',JSON.stringify(parsed_db, null, 4) , (err) => {
                                if (err) 
                                    console.log("Error data user to the database");
                            })
                            res.redirect('/login');
                        }
                    }
                }
            })
        }
    } catch (e) {
        console.log('Error creating acc!!' + e);
        res.redirect('/register');
    }
});


port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on " + port);
});