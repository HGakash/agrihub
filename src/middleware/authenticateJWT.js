const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    console.log("JWT middleware triggered");
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        console.log('Received token:', token);
        console.log('JWT_SECRET is:', process.env.JWT_SECRET);

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error("JWT verification error:", err);
                return res.sendStatus(403);
            }

            console.log("JWT decoded payload:", decoded);

            // Attach decoded fields to req
            req.userId = decoded.id;
            req.role = decoded.role;
            req.email = decoded.email;

            next();
        });
    } else {
        res.sendStatus(401);
    }
}

module.exports = authenticateJWT;
