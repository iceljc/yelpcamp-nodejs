module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user);
    if (!req.isAuthenticated()) {
        // store the url that the user is requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must sign in first!');
        return res.redirect('/login');
    }
    next();
}