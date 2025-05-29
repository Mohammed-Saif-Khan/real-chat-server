import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const register = asyncHandler(async (req: Request, res: Response) => {
  res.send("Hello World");
  console.log("Hellow Owrld");
});

export { register };
