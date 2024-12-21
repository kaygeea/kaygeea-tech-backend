import { Request, Response, NextFunction } from "express";

const logRequestBody = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`Request params: ${JSON.stringify(req.params, null, 2)}`);
  next();
};

export default logRequestBody;
