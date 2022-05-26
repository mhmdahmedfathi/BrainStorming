const { verify } = require("jsonwebtoken");

const isAuth = (req, res, next) => { //used to make sure that the user is authorized to enter
    const accessToken = req.header("AccessToken");
    if (!accessToken) {
        res.json({ error: "User is not logged in" });
    }
    else {
        try {
            const validToken = verify(accessToken,"LoginAccess");

            if (validToken) {
                req.user = validToken.username;
            }

            return next();
        } catch (err) {
            return res.json({ error: err });
        }
    }
}

module.exports = { isAuth };