const { JOI_Validations } = require("../../services/joi_services");
const { Bcrypt_Service } = require("../../services/bcrypt_services");
const { User_Auth_Schema } = require("../../models/user_auth_model");
const { Childrens } = require("../../models/ChildModel");
const User_DTO = require("../../dto/user_dto");
const { sendWelcomeEmailCoParent } = require('../../utils/email');
const { generateRandomPassword } = require('../../utils/passwordGenerator');
const { all } = require("../../routes/user_routes");
// const {
//     register_user,
// } = require("../../utils/email_transport_config");
// const verifyEmailSchema = require("../../models/verification/verifyEmailTokenSchema");

const update_parent = async (req, res, next) => {

    const { body , user_id} = req;
    const {first_name,last_name,email,number,address,dob,gender,card_holder_name,card_number,expiry_date,cvv} = body;
    // console.log('user id',user_id);
    const finduser = await User_Auth_Schema.findById({ _id: user_id })
    
    if (finduser) {
        // console.log("Find User Test",finduser)
        try {
            if(first_name)
                {
                    finduser.first_name = first_name;
                }
                if(last_name)
                {
                    finduser.last_name = last_name;
                }
                if(email)
                {
                    finduser.email = email;
                }
                if(number)
                {
                    finduser.number = number;
                }
                if(address)
                {
                    finduser.address = address;
                }
                if(dob)
                {
                    finduser.dob = dob;
                }
                if(gender)
                {
                    finduser.gender = gender;
                }
                if(card_holder_name)
                {
                    finduser.card_holder_name = card_holder_name;
                }
                if(card_number)
                {
                    finduser.card_number = card_number;
                }
                if(expiry_date)
                {
                    finduser.expiry_date = expiry_date;
                }
                if(cvv)
                {
                    finduser.cvv = cvv;
                }
                await finduser.save();
                const user_dto = new User_DTO(finduser);
            return res.json({ message: "user Updated successfully",'User':user_dto })
        } catch (error) {
            return res.status(500).json({ message: 'Error updating user', error: error.message });
        }
        
        
    } else {
        return res.status(404).json({ message: "user not found" })
    }

}

const add_co_parent = async (req, res, next) => {

    const { body , user_id} = req;
    const {first_name,last_name,email,number,dob,gender,address} = body;
   
    if(!first_name || !last_name || !email)
        {
            return res.status(300).json({message:"First Name , Last Name Or Email is Missing"})
        }

    const is_email_exist = await User_Auth_Schema.exists({ email });
    if (is_email_exist) {
      const error = {
        status: 409,
        message: "User is already exist with this email!",
      };
      return next(error);
    }
    let password = generateRandomPassword();
    const secure_password = await Bcrypt_Service.bcrypt_hash_password(password);

    try{

        const newUser = new User_Auth_Schema({
            email,
            first_name,
            last_name,
            number,
            address,
            gender,
            dob,
            user_role:"Parent",
            password:secure_password,
            added_by: user_id // Set the ID of the user who invited this new user
          });
      
          // Save the new user to the database
          await newUser.save();
          await sendWelcomeEmailCoParent(email,first_name,password);
          return res.status(200).json({ message: 'Invitation Sent to User', newUser: newUser });
    } catch (error) {
        return res.status(500).json({ message: 'Error in Inviting user', error: error.message });
    }

}

const addChildren = async (req, res, next) => {
    const { body, user_id } = req;
    const { first_name, last_name, email, number, dob, doctor, medical_issues, gender } = body;
    
    const validation_error = JOI_Validations.children_joi_validation(body);
    if (validation_error) {
        console.log("validation","Error")
      return next(validation_error);
    }

    

    const is_email_exist = await User_Auth_Schema.exists({ email });
    
    if (is_email_exist) {
      const error = {
        status: 409,
        message: "User is already exist with this email!",
      };
      return next(error);
    }


    try {
       
        const coParent = await User_Auth_Schema.find({added_by:user_id});
            if(coParent.length>0)
            {
                var coParentId = coParent[0]._id;
            }
            
            const child = new Childrens({
                first_name,
                last_name,
                email,
                number,
                dob,
                doctor,
                medical_issues,
                gender,
                added_by:user_id,
                co_parent:coParentId
            });

            await child.save();

            let allChilds = await Childrens.find({added_by:user_id})
            return res.status(200).json({message:"Child Added Successfully",allChilds:allChilds})

        
      


        
    } catch (error) {
        return res.status(300).json({message:error.message})
    }

    
}

const ActivateAccount = async (req, res, next) => {
    const { body, user_id } = req;
    console.log('yes');
    let mySelf = await User_Auth_Schema.find({_id:user_id});
    let coParent = await User_Auth_Schema.find({added_by:user_id})
    let childrens = await Childrens.find({added_by:user_id})
    let data = {me:mySelf,parent:coParent,childrens:childrens}
    // return res.status(200).json({message:"Account Activated Successfully",data:data,id:user_id})
    try{
        if(mySelf[0].card_holder_name!==null && coParent.length>0 && childrens.length>0 )
            {
                //logic here
                await User_Auth_Schema.updateOne({ _id: user_id }, { verified: true });
                return res.status(200).json({message:"Account Activated Successfully"})
            }
            else
            {
                return res.status(300).json({message:"Please Complete Your Profile First"})
            }
    } catch (error)
    {
        return res.status(300).json({message:error.message})
    }

}
module.exports = {

    update_parent,
    add_co_parent,
    addChildren,
    ActivateAccount

};
