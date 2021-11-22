const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function newDishIsValid(req, res, next) {
  const dish = req.body.data;

  if (!dish.name) {
    return next({ status: 400, message: "Dish must include a name" });
  } else if (!dish.description) {
    return next({ status: 400, message: "Dish must include a description" });
  } else if (!dish.price) {
    return next({ status: 400, message: "Dish must include a price" });
  } else if (dish.price <= 0 || typeof dish.price !== "number") {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else if (!dish.image_url) {
    return next({ status: 400, message: "Dish must include a image_url" });
  }
  return next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

function upDishIsValid(req, res, next) {
  const { dishId } = req.params;
  const dish = req.body.data;

  if (dish.id && dish.id !== dishId) {
    next({
      status: 404,
      message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${dishId}`,
    });
  }
  return next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const dish = res.locals.dish;
  const originalDish = dish;
  const { data: { name, description, price, image_url } = {} } = req.body;
  const upDish = { name, description, price, image_url };
  Object.assign(originalDish, upDish);
  res.json({ data: originalDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [newDishIsValid, create],
  read: [dishExists, read],
  update: [dishExists, newDishIsValid, upDishIsValid, update],
  list,
};
