const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Middleware
// checks to see if the order already exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

// checks if the order has valid properties
function newOrderHasValidProperties(req, res, next) {
  const { data } = req.body;

  const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
  for (let field of requiredFields) {
    if (!data[field]) {
      return next({ status: 400, message: `Order must include a ${field}` });
    }
  }
  return next();
}

// checks to make sure the dishes property has at least one dish and has quantity greater than 0
function dishesIsValidFormat(req, res, next) {
  const { data } = req.body;
  const dishes = data.dishes;
  if (dishes.length === 0 || !Array.isArray(data.dishes)) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  dishes.forEach((dish) => {
    const index = dishes.indexOf(dish);
    if (dish.quantity === 0 || typeof dish.quantity !== "number") {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  return next();
}

// checks if order has Id and if order status is valid
function upOrderIsValid(req, res, next) {
  const { orderId } = req.params;
  const order = req.body.data;
  const validStatus = ["pending", "preparing", "out-for-delivery"];
  if (order.id && order.id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${order.id}, Route: ${orderId}`,
    });
  } else if (!order.status) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else if (!validStatus.includes(order.status)) {
    return next({ status: 400, message: "Order status not available" });
  }

  return next();
}

// checks if delete status is pending
function checkDeleteStatus(req, res, next) {
  const status = res.locals.order.status;
  if (status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  return next();
}

// Post request to /orders
function create(req, res) {
  const { data: obj } = req.body;
  const newOrder = {
    id: nextId(),
    ...obj
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// Get request to /orders/:orderId
function read(req, res) {
  res.json({ data: res.locals.order });
}

// Put request to /orders/:orderId
function update(req, res) {
  const order = res.locals.order;
  const originalOrder = order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const upOrder = {
    id: originalOrder.id,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  Object.assign(originalOrder, upOrder);
  res.json({ data: upOrder });
}

// Get request to /orders
function list(req, res) {
  res.json({ data: orders });
}

// Delete request to /orders/:orderId
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);

  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [newOrderHasValidProperties, dishesIsValidFormat, create],
  read: [orderExists, read],
  update: [
    orderExists,
    newOrderHasValidProperties,
    dishesIsValidFormat,
    upOrderIsValid,
    update,
  ],
  list,
  delete: [orderExists, checkDeleteStatus, destroy],
};
