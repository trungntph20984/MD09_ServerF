exports.requiresLogin = (req, res, next) => {

    if (req.session.userLogin) {
        res.locals.user = req.session.userLogin;
        next();
    } else {
        res.redirect('/login');
    }
}
exports.noLoginRequired = (req, res, next) => {
    if (!req.session.userLogin) {
        next();

    } else {
        return res.redirect('/')
    }

}