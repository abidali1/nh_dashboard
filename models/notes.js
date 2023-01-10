const { DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const Notes = sequelize.define('notes', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        notes: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        news_id: DataTypes.INTEGER,


    });
    return Notes;
}