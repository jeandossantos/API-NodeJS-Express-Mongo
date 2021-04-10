const express = require('express');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const crypto = require('crypto');
const secret = 'daadi09e2ij342oji4qjih244333oo';
const mailer = require('../services/mailer');

router.post('/register', async (req, resp) => {
    try {
        const { email } = req.body;

        if (await User.findOne({ email })) {
            return resp.status(400).send('E-mail já cadastrado.');
        }

        const user = await User.create(req.body);

        user.password = undefined;

        const token = generateToken({ id: user.id });

        return resp.send({
            user,
            token
        });
        
    } catch (error) {
        return resp.status(500).send(error);
    }
});

router.post('/authenticate', async (req, resp) => {
    try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email }).select('+password');
        
        if(!user) return resp.status(400).send('usuário não encontrado.');
    
        const isMath = bcrypt.compareSync(password, user.password);
    
        if(!isMath) return resp.status(400).send('usuário não encontrado.');

        user.password = undefined;

        const token = generateToken({ id: user.id });

        return resp.json({
            user,
            token
        });
        
    } catch (error) {
        return resp.status(500).json(error);
    }
});

router.post('/forgot_password', async (req, resp) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if(!user) return resp.status(400).send('Usuário não existe.');

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            from: 'txtdbr@gmail.com',
            to: email,
            template: './forgot_password',
            subject: 'Test',
            context: {
                token
            }
        }, error => {
            console.log(error)
            if(error) return resp.status(400).send('Não pode continuar com a recuperação de senha.');

            return resp.send();
        });

    } catch (error) {
        return resp.status(400).send('Erro inesperado, tente novamente.');
    }
});

router.post('/reset_password', async (req, resp) => {
    const { email, password, token } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if(!user) return resp.status(400).send('Usuário não existe.');

        if(token !== user.passwordResetToken) return resp.status(400).send('Token inválido.');

        const now = new Date();

        if(now > user.passwordResetExpires) return resp.status(400).send('Token expirado, gerar um novo.');

        user.password = password;

        user.save();

        return resp.send();
    } catch (e) {
        return resp.status(400).send()
    }
});
function generateToken(payload = {}){
    return jwt.sign(payload, secret, {
        expiresIn: 86400
    });
}

module.exports = app => app.use('/auth', router);
