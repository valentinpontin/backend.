import { UserService } from "../services/users.services.js";

const userService = new UserService();

const togglePremiumFeature = async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await userService.togglePremiumFeature(email);
        res.send({ status: 1, msg: `Premium feature for flowerier ${user.email} successfully toggled. New role is ${user.role}` });
    } catch (error) {
        next(error);
    }
};

const updateDocuments = async (req, res, next) => {
    try {
        const email = req.params.email;
        const documents = req.files;
        const user = await userService.updateDocuments(email, documents);
        res.send({ status: 1, msg: `Documents for flowerier ${user.email} successfully updated.`, userDocuments: user.documents });
    } catch (error) {
        next(error);
    }
}

export default {
    togglePremiumFeature,
    updateDocuments
};