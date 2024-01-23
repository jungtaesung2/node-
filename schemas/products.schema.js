const mongoose = require('mongoose');
const { Schema } = mongoose;
const Account = new Schema({
    profile: {
        username: { type: String },
        avatar: { type: String, default: 'sheep' }, 
        verified: { type: Boolean, default: false } 
    },
    createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Account', Account);