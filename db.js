const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

mongoose.connect(
  "mongodb+srv://aniketkadale2001:ia5saLYToJyutzYM@cluster0.4fjbo.mongodb.net/mongo-todo"
);


const UserSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  password: String,
  name: String,
});

const TodoSchema = mongoose.Schema({
  title: String,
  done: Boolean,
  userId: ObjectId,
});

const UserModel = mongoose.model('users', UserSchema);
const TodoModel = mongoose.model("todos", TodoSchema);


module.exports = {
  UserModel,
  TodoModel,
};

