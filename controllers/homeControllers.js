function getIndex(req, res) {
    res.render("pages/index", { username: req.session.user });
}

function getProductosTest(req, res) {
    res.render("pages/testView");
}

export default { getIndex, getProductosTest };