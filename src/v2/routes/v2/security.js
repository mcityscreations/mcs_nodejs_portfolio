var express = require('express');
var router = express.Router();

import { container } from 'tsyringe';
import { SecurityController } from '../../src/v2/security/securityController';
const security = container.resolve(SecurityController);
import { AuthMiddlewares } from '../../src/v2/security/securityMiddlewares';
const authMiddlewares = container.resolve(AuthMiddlewares);
import { loginDTO, verifyMfaDTO } from '../../src/v2/security/securityValidators';


/** LOGIN */
router.post('/login', 
    authMiddlewares.generateLogID,
    loginDTO,
    security.login
);

router.post('/mfa/send', security.sendMfaCode);

router.post('/mfa/verify',
    verifyMfaDTO,
    security.verifyMfaCode
);

module.exports = router;