require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel, TodoModel } = require("./db");
const { authMiddleware, JWT_SECRET } = require("./auth");
const { z } = require("zod");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const reqBody = z.object({
    email: z.string().min(3).max(50).email(),
    password: z
      .string()
      .min(6)
      .refine((password) => /[A-Z]/.test(password), {
        message: "Required atleast one uppercase character",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Required atleast one lowercase character",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Required atleast one number",
      })
      .refine((password) => /[!@#$%^&*]/.test(password), {
        message: "Required atleast one special character",
      }),
    name: z.string().min(3).max(30),
  });

  const parsedData = reqBody.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect format",
      error: parsedData.error.issues[0].message,
    });
    return;
  }

  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email: email,
      password: hashedPassword,
      name: name,
    });

    // console.log(hashedPassword);
    await newUser.save();

    res.json({ message: "Signed Up!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error signing up user" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const findUser = await UserModel.findOne({
      email: email,
    });

    if (!findUser) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    if (isPasswordValid) {
      const token = jwt.sign({ id: findUser._id.toString() }, JWT_SECRET);
      res.json({ token: token });
    } else {
      res.status(403).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error signing in user" });
  }
});

// These two routes will be authenticated
app.post("/todo", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    const todo = new TodoModel({
      title: title,
      done: done,
      userId: userId,
    });

    await todo.save();
    res.status(200).json({ message: "Todo created..." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Couldn't create todo..." });
  }
});

app.get("/todos", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const todos = await TodoModel.find({ userId });

    if (todos.length === 0) {
      res.status(404).json({ message: "No todos found for this user" });
    } else {
      res.json({ todos });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Couldn't get todos..." });
  }
});

// update the status of the todo to done

app.put("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const todoId = req.params.id;

    const todo = await TodoModel.findOne({ _id: todoId, userId });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.done = true;
    await todo.save();

    res.status(200).json({ message: "Todo marked as done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Couldn't mark todo as done..." });
  }
});

app.listen(3000, () => {
  console.log("Server up on port 3000...");
});
