const jwt = require('jsonwebtoken');

const secret = 'daadi09e2ij342oji4qjih244333oo';

module.exports = (req, resp, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) return resp.status(401).json({ error: 'No token provided' });

    const parts = authHeader.split(' ');

    if(parts.length !== 2) return resp.status(401).json({ error: 'Token error' });
    console.log(parts.length)
    const [ scheme, token ] = parts;
    
    if(!/^Bearer$/i.test(scheme)) return resp.status(401).json({ error: 'Token Malformatted' });
    
    jwt.verify(token, secret, (error, decoded) => {
        if(error) return resp.status(401).json({ error: 'Token invalided' });

        req.userId = decoded.id;

        return next();
    })
}