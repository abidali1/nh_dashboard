const { DataTypes } = require('sequelize');
module.exports=(sequelize,DataTypes)=>{
const Folder=sequelize.define('folder',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
           },
    name:
    {
    type: DataTypes.STRING
    },

  
    user_id: DataTypes.INTEGER,

});
return Folder;
}