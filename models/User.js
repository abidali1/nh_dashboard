const { DataTypes } = require('sequelize');
module.exports=(sequelize,DataTypes)=>{
const User=sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
           },
    name:
    {
    type: DataTypes.STRING
    },

  
    password: DataTypes.STRING,
    role: DataTypes.STRING
});
return User;
}