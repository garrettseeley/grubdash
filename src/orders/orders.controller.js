const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

function newOrderIsValid(req, res, next) {
    const order = req.body.data;
    const dishes = order.dishes;

    if (!order.deliverTo) {
        return next({ status: 400, message: "Order must include a deliverTo" })
    } else if (!order.mobileNumber) {
        return next({ status: 400, message: "Order must include a mobileNumber" })
    } else if (!order.dishes) {
        return next({ status: 400, message: "Order must include a dish"})
    } else if (dishes.length === 0 || !Array.isArray(order.dishes)) {
        return next({ status: 400, message: "Order must include at least one dish" })
    }

    order.dishes.forEach((dish) => {
        const index = dishes.indexOf(dish)
        if (dish.quantity === 0 || typeof dish.quantity !== "number") {
            return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`})
        }
    })
    return next();
}

function upOrderIsValid(req, res, next) {
    const { orderId } = req.params;
    const order = req.body.data;
    const validStatus = ["pending", "preparing", "out-for-delivery"]
    if (order.id && order.id !== orderId) {
        next({status: 400, message: `Order id does not match route id. Order: ${order.id}, Route: ${orderId}`})
    } else if (!order.status) {
        return next({ status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"})
    } else if (!validStatus.includes(order.status)) {
        return next({ status: 400, message: "Order status not available"})
    }

    return next();
}

function checkDeleteStatus(req, res, next) {
    const status = res.locals.order.status;
    if (status !== "pending") {
        return next({status: 400, message: "An order cannot be deleted unless it is pending"})
    }
    return next();
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
    const order = res.locals.order;
    const originalOrder = order;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const upOrder = { id: originalOrder.id, deliverTo, mobileNumber, status, dishes };

    Object.assign(originalOrder, upOrder);
    res.json({ data: upOrder })
}

function list(req, res) {
  res.json({ data: orders });
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);

    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
  create: [newOrderIsValid, create],
  read: [orderExists, read],
  update: [orderExists, newOrderIsValid, upOrderIsValid, update],
  list,
  delete: [orderExists, checkDeleteStatus, destroy],
};
