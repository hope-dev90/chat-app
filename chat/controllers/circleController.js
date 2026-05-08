import {
    createCircle,
    getAllCircles,
    getCircleById,
    joinCircle,
    leaveCircle,
    isCircleMember,
    getCircleMembers,
    getUserCircles
} from '../models/circleModel.js';

import { findUserById } from '../models/userModel.js';

// Create a new circle
export const createCircleController = async (req, res) => {
    const { name, description, coverImageUrl, color } = req.body;
    const createdBy = req.user.id;

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Circle name is required'
            });
        }

        const circle = await createCircle({
            name,
            description,
            coverImageUrl,
            color,
            createdBy
        });

        // Auto-join the creator to the circle
        await joinCircle(circle.id, createdBy);

        return res.status(201).json({
            success: true,
            message: 'Circle created successfully',
            circle
        });

    } catch (error) {
        console.error('createCircleController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get all circles
export const getAllCirclesController = async (req, res) => {
    try {
        const circles = await getAllCircles();
        return res.status(200).json({
            success: true,
            circles
        });

    } catch (error) {
        console.error('getAllCirclesController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get circle by id
export const getCircleByIdController = async (req, res) => {
    const { circleId } = req.params;

    try {
        const circle = await getCircleById(circleId);
        if (!circle) {
            return res.status(404).json({
                success: false,
                message: 'Circle not found'
            });
        }

        return res.status(200).json({
            success: true,
            circle
        });

    } catch (error) {
        console.error('getCircleByIdController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Join a circle
export const joinCircleController = async (req, res) => {
    const { circleId } = req.params;
    const userId = req.user.id;

    try {
        const circle = await getCircleById(circleId);
        if (!circle) {
            return res.status(404).json({
                success: false,
                message: 'Circle not found'
            });
        }

        const member = await joinCircle(circleId, userId);
        if (!member) {
            return res.status(400).json({
                success: false,
                message: 'Already a member of this circle'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Joined circle successfully'
        });

    } catch (error) {
        console.error('joinCircleController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Leave a circle
export const leaveCircleController = async (req, res) => {
    const { circleId } = req.params;
    const userId = req.user.id;

    try {
        const left = await leaveCircle(circleId, userId);
        if (!left) {
            return res.status(404).json({
                success: false,
                message: 'Not a member of this circle'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Left circle successfully'
        });

    } catch (error) {
        console.error('leaveCircleController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get circle members
export const getCircleMembersController = async (req, res) => {
    const { circleId } = req.params;

    try {
        const members = await getCircleMembers(circleId);
        return res.status(200).json({
            success: true,
            members
        });

    } catch (error) {
        console.error('getCircleMembersController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// Get user's circles
export const getUserCirclesController = async (req, res) => {
    const userId = req.user.id;

    try {
        const circles = await getUserCircles(userId);
        return res.status(200).json({
            success: true,
            circles
        });

    } catch (error) {
        console.error('getUserCirclesController error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};
