import { AdminSchema } from "../schema/index.js";

const admin = { 
    async create(payload) {
        try{
            let document = await new UserSchema(payload);
            document = await document.save();
            return document;
        }catch(err){
            return err;
        }
    }
};

export default admin;