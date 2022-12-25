const app = require("./app");
const dotenv = require('dotenv');
const connectDataBase = require("./config/database")

//Uncaught Error

process.on("uncaughtException", (err)=>{
    console.log(`Error ${err.message}`);
    console.log(`Shutting server Due to uncaught error`);

    process.exit(1);
});

dotenv.config({path:"./backend/config/config.env"})

connectDataBase()

app.get("/", (req, res)=>{
    res.send("This is only to show that it is working.")
})

app.listen(process.env.PORT, ()=>{
    console.log(`Our website is running on port ${process.env.PORT}`)
})
