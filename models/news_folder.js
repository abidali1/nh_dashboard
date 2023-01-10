const { DataTypes } = require('sequelize');
module.exports=(sequelize,DataTypes)=>{
const News_Folder=sequelize.define('news_folder',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
           },
    user_id:
    {
    type: DataTypes.INTEGER
    },

  
    folder_id: DataTypes.INTEGER,
    news_id: DataTypes.INTEGER,


});
return News_Folder;
}