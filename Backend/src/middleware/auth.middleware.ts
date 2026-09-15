import { Request , Response , NextFunction} from 'express';
export const isAuthorized = (req:Request , res:Response , next : NextFunction) =>{
    if  (req.session && req.session.user){
        next();
    }
    
    return res.status(401).json({
        sucess:false,
        error:" unotharozed acess bro  ",
        message:"aunotharized layer cookie is expires fuckin login again"
    })
}