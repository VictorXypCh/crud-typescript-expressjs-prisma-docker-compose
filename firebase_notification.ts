const admin = require('firebase-admin');
// Init Firebase Admin

// Init FCM
const fcm = admin.messaging();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Push notification API');
});


router.post('/broadcast', async function(req, res, next) {
    try {
        const reqBody = req.body;
        if (reqBody.title && reqBody.body) {
            const { title, body } = reqBody;
            const click_action = body.click_action ? body.click_action : 'FLUTTER_NOTIFICATION_CLICK';
            const payload = {
                notification: {
                    title,
                    body,
                    icon: 'your-icon-url',
                    click_action
                }
            };
            const result = await fcm.sendToTopic('broadcast', payload);
            if (result && result.messageId) {
                res.json({ message: 'success' });
            } else {
                throw 'something went wrong'
            }
        } else {
            throw 'title & body are required'
        }

    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});


router.post('/sendToDevice', async function(req, res, next) {
    try {
        const reqBody = req.body;
        if (reqBody.title && reqBody.body && reqBody.tokens) {
            const { title, body, tokens } = reqBody;
            const click_action = body.click_action ? body.click_action : 'FLUTTER_NOTIFICATION_CLICK';

            let payload = {
                notification: {
                    title,
                    body,
                    icon: 'your-icon-url',
                    click_action,
                    sound: 'default',
                    alert: "false"
                }
            };
            if (reqBody.os === 'android') {
                payload = {};
            }

            if (reqBody.data) {
                payload.data = reqBody.data;
            }
            const options = { priority: 'high' };
            const result = await fcm.sendToDevice(tokens, payload, options);
            if (result) {
                res.json(result);
            }
        } else {
            throw 'title, body, tokens(deviceTokens) are required'
        }

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

router.post('/custom', async function(req, res, next) {
    try {
        const reqBody = req.body;
        const result = await fcm.send(reqBody);
        if (result) {
            res.json(result);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});




