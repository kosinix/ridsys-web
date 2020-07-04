# Resident ID System - Web App
RIDSYS is a resident ID system for a Philippine municipality. 
Supports Digital ID system.


## Install

In mongo

    use ridsys
    db.createUser(
        {
            user: "ridsysUser",
            pwd: '{{see credentials.json}}',
            roles: [
                { role: "readWrite", db: "ridsys" }
            ]
        }
    )