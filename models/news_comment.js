const { DataTypes } = require('sequelize');
module.exports=(sequelize,DataTypes)=>{
const News_Comment=sequelize.define('news_comment',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
           },
    user_id:DataTypes.INTEGER ,
   

    news_id: DataTypes.INTEGER,
comment: DataTypes.STRING

});
return News_Comment;
}