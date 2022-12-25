const mongoose = require('mongoose');


const connectDataBase = () => {

    main().catch(err => console.log(err))

    async function main(data) {
        await mongoose.connect(process.env.DB_URI);
        console.log(`Connected to db `);
    }

}


module.exports = connectDataBase;