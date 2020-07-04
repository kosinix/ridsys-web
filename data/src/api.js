//// Core modules

//// External modules
const axios = require('axios');

//// Modules

module.exports = axios.create({
    baseURL: `${CONFIG.admin.url}/api`,
    auth: {
        username: CRED.apps.web.username,
        password: CRED.apps.web.password,
    }
});