import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 8080;
app.use(helmet());
app.use(cors({
    origin:true,
    credentials:true
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-fallback',
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite:'lax',
    },

}));
app.get('/health',(req: Request, res: Response)=>{
    res.json(200).json({
        sucess: true,
        status:' online',
        message:'serveris running cool'


    }); 
});
app.listen(PORT,() =>{
    console.log('finally your so called hand written code is working fine better not mess up the future');
    console.log(`check the fucking port ${PORT}for the number`);
});