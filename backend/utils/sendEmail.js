const nodeMailer = require('nodemailer')


const sendEmail = async (options)=>{

    const transpoter = nodeMailer.createTransport({
        service:process.env.SMPT_SERVICE,
        auth:{
            user:process.env.SMPT_EMAIL,
            pass:process.env.SMPT_PASSWORD
        }
    })

    
    const mailOptions = {
        from :process.env.SMPT_EMAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    await transpoter.sendMail(mailOptions)
    
}

module.exports = sendEmail