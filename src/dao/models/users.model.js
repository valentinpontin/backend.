import mongoose from 'mongoose';

const usersCollection = 'users';

const usersSchema = new mongoose.Schema({
    firstName: { type: String , required: true},
    lastName: { type: String },
    email: { type: String, required: true },
    birthDate: { type: Date },
    password: { type: String },
    role: { type: String, enum: ['admin', 'user', 'premium'], default: 'user' },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'carts', required: false },
    documents: [{
        name: { type: String },
        referenceUrl: { type: String }
    }],
    lastConnection: { type: Date },
})

const UsersModel = mongoose.model(usersCollection, usersSchema);

export default UsersModel;