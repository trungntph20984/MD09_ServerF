const mdbanner = require('../../models/banner.model');

const getAllBanner = async (req, res) => {
    try {
        const listBanners = await mdbanner.bannerModel.find()
        .populate('product_id')
        .sort({ createdAt: -1});

        return res.status(200).json({ message: 'Success', listBanners: listBanners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getAllBanner };
