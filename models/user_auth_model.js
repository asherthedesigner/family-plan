const mongoose = require('mongoose');

const { Schema } = mongoose;
const User_Auth_Schema = mongoose.model('user', new Schema({
    first_name: {
        type: String,
        default:null,
    },
    last_name: {
        type: String,
        default:null,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
       
    },
    number: {
        type: String,
        default:null,
    },
    dob: {
        type: Date,
        default:null,
    },
    address: {
        type: String,
        default:null,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other',null],
        default:null,
    },
    card_holder_name: {
        type: String,
        default:null,
    },
    card_number: {
        type: String,
        default:null,
    },
    expiry_date: {
        type: String,
        default:null,
    },
    cvv: {
        type: String,
        default:null,
    },
    user_role: {
        type: String,
        enum: ['Parent', 'Lawyer', 'Judge', 'Teacher'],
        require:true
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null,
    },
    verified: {
        type: Boolean,
        default:false
        //required:true
    },

          
}, { timestamps: true }
))


module.exports = { User_Auth_Schema }
