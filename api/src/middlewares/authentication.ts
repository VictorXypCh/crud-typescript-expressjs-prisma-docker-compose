import { Request, Response, NextFunction } from 'express';
import authUtil from '../utils/authUtil';
import { throws } from 'assert';

export const authorize = (allows?: String[]) => (req: Request, res: Response, next: NextFunction) => {

    try {
        let jwt = req.headers.authorization;

        // verify request has token
        if (!jwt) {
            return res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwt.toLowerCase().startsWith('bearer')) {
            jwt = jwt.slice('bearer'.length).trim();
        }

        // verify token hasn't expired yet
        const decodedToken = authUtil.decodeToken(jwt);
        req.user = decodedToken;
        if (allows && allows?.length > 0 && !allows?.includes(req.user?.role.toUpperCase())) {
            throw new Error('AccessDeniedError')
        }

        next();
    } catch (error: any) {
        //console.error(error);
        console.log(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Expired token' });
        } else if (error.message === 'AccessDeniedError') {
            return res.status(401).json({ message: 'Access Denied' });
        }

        return res.status(500).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
    }
};


