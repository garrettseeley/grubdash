const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Middleware
// checks if the dish has valid properties
function newDishHasValidProperties(req, res, next) {
  const { data } = req.body;

  const requiredFields = ["name", "description", "image_url", "price"];
  for (let field of requiredFields) {
    if (!data[field]) {
      return next({ status: 400, message: `Dish must include a ${field}` });
    }
  }
  return next();
}

// checks to make sure ptice is a number greater than 0
function priceIsValidFormat(req, res, next) {
  const { price } = req.body.data;
  if (price <= 0 || typeof price !== "number") {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  return next();
}

// checks if the dish already exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

// checks if the dish has a matching id
function upDishIsValid(req, res, next) {
  const { dishId } = req.params;
  const dish = req.body.data;

  if (dish.id && dish.id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${dishId}`,
    });
  }
  return next();
}

// post to "/dishes"
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

// get single dish from /dishes/:dishId
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// put/update for /dishes/:dishId
function update(req, res) {
  const dish = res.locals.dish;
  const originalDish = dish;
  const { data: { name, description, price, image_url } = {} } = req.body;
  const upDish = { name, description, price, image_url };
  Object.assign(originalDish, upDish);
  res.json({ data: originalDish });
}

// get list of dishes from /dishes
function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [newDishHasValidProperties, priceIsValidFormat, create],
  read: [dishExists, read],
  update: [
    dishExists,
    newDishHasValidProperties,
    priceIsValidFormat,
    upDishIsValid,
    update,
  ],
  list,
};
