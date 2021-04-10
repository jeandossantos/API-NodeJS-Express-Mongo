const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "f85b1019adee62",
        pass: "56ec3378b8142f"
    }
});

transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialsDir: path.resolve('./src/services')
    },
    viewPath: path.resolve('./src/services'),
    extName: '.html'
}))

module.exports = transport;