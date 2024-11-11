const express = require("express");
const { update_parent,add_co_parent, addChildren , ActivateAccount} = require('../../controllers/user_controllers');
const router = express.Router();


router.post('/update-parent',  update_parent);
router.post('/invtie-co-parent',  add_co_parent);
router.post('/add-children',  addChildren);
router.post('/activate-account',  ActivateAccount);


module.exports = router;
