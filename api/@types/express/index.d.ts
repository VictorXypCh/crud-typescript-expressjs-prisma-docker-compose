import { TokenPayload } from "./src/models/TokenPayload";
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload
        }
    }
}



