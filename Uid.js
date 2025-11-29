exports.generateUID = (project) => {
    const map = {
        "biluxe10": "BLX",
        "tap2send": "T2S",
        "beshaq": "BSQ"
    };

    const prefix = map[project.toLowerCase()] || project.substring(0, 3).toUpperCase();

    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${random}`;
};
