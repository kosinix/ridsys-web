//// Core modules

//// External modules
const express = require('express')
const fileUpload = require('express-fileupload')
const flash = require('kisapmata')
const lodash = require('lodash')

//// Modules
const api = require('../api')
const db = require('../db')
const middlewares = require('../middlewares')
const passwordMan = require('../password-man')

// Router
let router = express.Router()

router.get('/login', async (req, res, next) => {
    try {
        console.log(req.session)
        let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
        res.render('login.html', {
            flash: flash.get(req, 'login'),
            ip: ip,
        });
    } catch (err) {
        next(err);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        let post = req.body;

        let email = lodash.get(post, 'email', '');
        let password = lodash.get(post, 'password', '');

        // Find admin
        let user = await db.main.User.findOne({ email: email });
        if (!user) {
            throw new Error('Incorrect email or password.')
        }

        if (!user.active) {
            throw new Error('Your account is deactivated.');
        }

        // Check password
        let passwordHash = passwordMan.hashPassword(password, user.salt);
        if (passwordHash !== user.passwordHash) {
            throw new Error('Incorrect password.');
        }

        // Save user id to session
        lodash.set(req, 'session.authUserId', user._id);

        // Security: Anti-CSRF token.
        let antiCsrfToken = await passwordMan.randomStringAsync(16)
        lodash.set(req, 'session.acsrf', antiCsrfToken);

        return res.redirect('/');
    } catch (err) {
        flash.error(req, 'login', err.message);
        return res.redirect('/login');
    }
});

router.get('/apply', async (req, res, next) => {
    try {
        let r = await api.get('/application')
        console.log(r.data)
        res.render('apply.html', {
            flash: flash.get(req, 'apply'),
        });
    } catch (err) {
        next(err);
    }
});
router.post('/apply', fileUpload(), middlewares.handleExpressUploadMagic, async (req, res, next) => {
    try {
        let body = req.body
        let files = req.files
        let patch = {}

        lodash.set(patch, 'firstName', lodash.get(body, 'firstName'))
        lodash.set(patch, 'middleName', lodash.get(body, 'middleName'))
        lodash.set(patch, 'lastName', lodash.get(body, 'lastName'))
        lodash.set(patch, 'suffix', lodash.get(body, 'suffix'))
        lodash.set(patch, 'birthDate', lodash.get(body, 'birthDate'))
        lodash.set(patch, 'gender', lodash.get(body, 'gender'))
        lodash.set(patch, 'civilStatus', lodash.get(body, 'civilStatus'))

        lodash.set(patch, 'addresses.0._id', db.mongoose.Types.ObjectId())
        lodash.set(patch, 'addresses.0.unit', lodash.get(body, 'unit1'))
        lodash.set(patch, 'addresses.0.brgyDistrict', lodash.get(body, 'brgyDistrict1'))
        lodash.set(patch, 'addresses.0.cityMun', lodash.get(body, 'cityMun1'))
        lodash.set(patch, 'addresses.0.province', lodash.get(body, 'province1'))
        lodash.set(patch, 'addresses.0.region', lodash.get(body, 'region1'))
        lodash.set(patch, 'addressPermanent', lodash.get(patch, 'addresses.0._id'))


        lodash.set(patch, 'mobileNumber', lodash.get(body, 'mobileNumber'))
        lodash.set(patch, 'profilePhoto', lodash.get(req, 'saveList.profilePhoto[0]'))


        // TODO: Check duplicate

        let application = new db.main.Application(patch)
        await application.save()

        let person = new db.main.Person(patch)
        await person.save()

        await api.post('/application', application.toObject())

        flash.ok(req, 'application', `Created ${application.firstName} ${application.lastName}.`)
        res.redirect(`/application/${application._id}`)

    } catch (err) {
        flash.error(req, 'apply', err.message);
        return res.redirect('/apply');
    }
});

router.get('/admin/logout', async (req, res, next) => {
    try {
        lodash.set(req, 'session.authUserId', null);
        lodash.set(req, 'session.acsrf', null);
        lodash.set(req, 'session.flash', null);
        res.clearCookie(CONFIG.session.name, CONFIG.session.cookie);

        res.redirect('/admin/login');
    } catch (err) {
        next(err);
    }
});

module.exports = router;