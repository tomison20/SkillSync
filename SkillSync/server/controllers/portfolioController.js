import Portfolio from '../models/Portfolio.js';

// @desc    Get student portfolio
// @route   GET /api/portfolios
// @access  Private (Student)
export const getMyPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.find({
            student: req.user._id,
            organization: req.user.organization
        });
        res.json(portfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create portfolio item
// @route   POST /api/portfolios
export const createPortfolioItem = async (req, res) => {
    try {
        const { title, description, link, image } = req.body;
        const item = await Portfolio.create({
            student: req.user._id,
            organization: req.user.organization,
            title,
            description,
            link,
            image
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update portfolio item
// @route   PUT /api/portfolios/:id
export const updatePortfolioItem = async (req, res) => {
    try {
        const item = await Portfolio.findOne({ _id: req.params.id, student: req.user._id });
        if (!item) return res.status(404).json({ message: 'Item not found' });

        Object.assign(item, req.body);
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete portfolio item
// @route   DELETE /api/portfolios/:id
export const deletePortfolioItem = async (req, res) => {
    try {
        const item = await Portfolio.findOneAndDelete({ _id: req.params.id, student: req.user._id });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
