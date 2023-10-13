import { usersRepository } from '../repositories/index.js';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';
import { default as token } from 'jsonwebtoken';
import { sendEmail } from '../utils/mailer.js';

class UserService {
    constructor() {
        this.userRepository = usersRepository;
    }

    getUserByEmail = async (email) => {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                FloweryCustomError.createError({
                    name: 'getUserByEmail Error',
                    message: 'User not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { email },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            return user;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'getUserByEmail Error',
                message: `Failed to retrieve user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

    createEmailJwt = (email) => {
        const jwt = token.sign({ email }, process.env.AUTH_SECRET, { expiresIn: '1h' });
        return jwt;
    }

    createResetPasswordRequest = async (email, frontEndUrl) => {
        try {
            if (email.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
                FloweryCustomError.createError({
                    name: 'createResetPasswordRequest Error',
                    message: 'Admin password cannot be recovered',                        
                    type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                    recievedParams: { email },
                    statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                });
            } else {
                const user = await this.userRepository.getUserByEmail(email);
                if (!user) {
                    FloweryCustomError.createError({
                        name: 'getUserByEmail Error',
                        message: 'Wrong flowerier',                        
                        type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                        recievedParams: { email },
                        statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                    });
                }
                const jwt = this.createEmailJwt(email)
                const resetUrl = `${frontEndUrl}/api/sessions/resetpasswordvalidation/${jwt}`;
                await sendEmail(email, 'Flowery 4107 - Reset Password', `<h1>Flowery 4107 - Reset Password</h1>
                <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>`);
                return user;
            }
        } catch (error) {
            throw error;
        }
    }

    togglePremiumFeature = async (email) => {
        try {
            if (email.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
                FloweryCustomError.createError({
                    name: 'togglePremiumFeature Error',
                    message: 'Admin role cannot be toggled',
                    type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                    recievedParams: { email },
                    statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                });
            }
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                FloweryCustomError.createError({
                    name: 'togglePremiumFeature Error',
                    message: 'User not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { email },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            const newRole = { role: user.role === 'user' ? 'premium' : 'user' };
            if (newRole.role === 'premium') {
                if (!user.documents || user.documents.length === 0) {
                    FloweryCustomError.createError({
                        name: 'togglePremiumFeature Error',
                        message: 'User has no documents',                        
                        type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                        recievedParams: { email },
                        statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                    });
                }
                const requiredDocuments = ['id', 'address', 'bankaccount'];
                const userDocuments = user.documents.map(document => document.name);
                const missingDocuments = requiredDocuments.filter(document => !userDocuments.includes(document));
                if (missingDocuments.length > 0) {
                    FloweryCustomError.createError({
                        name: 'togglePremiumFeature Error',
                        message: 'User has missing required documents',
                        type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                        recievedParams: { email },
                        statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                    });
                }
            }
            const updatedUser = await this.userRepository.updateUser(user._id, newRole);
            return updatedUser;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'togglePremiumFeature Error',
                message: `Failed to toggle premium feature for user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

    updateLastConnection = async (email) => {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                FloweryCustomError.createError({
                    name: 'updateLastConnection Error',
                    message: 'User not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { email },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            const newLastConnection = { lastConnection: Date.now() };
            const updatedUser = await this.userRepository.updateUser(user._id, newLastConnection);
            return updatedUser;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'updateLastConnection Error',
                message: `Failed to update last connection for user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

    updateDocuments = async (email, documents) => {
        try {
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                FloweryCustomError.createError({
                    name: 'updateDocuments Error',
                    message: 'User not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { email },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            if (!Array.isArray(documents) || documents.length === 0) {
                FloweryCustomError.createError({
                    name: 'updateDocuments Error',
                    message: 'Documents not found',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    recievedParams: { documents },
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });
            }
            const newDocuments = documents.map(file => ({ name: file.originalname.split('.')[0].toLowerCase() , referenceUrl: `http://localhost:8080/files/uploads/documents/${file.filename}`}));
            
            const userDocuments = user.documents || [];
            const updatedDocuments = { documents: [...userDocuments, ...newDocuments] };
            const updatedUser = await this.userRepository.updateUser(user._id, updatedDocuments);
            return updatedUser;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'updateDocuments Error',
                message: `Failed to update documents for user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

}

export { UserService }