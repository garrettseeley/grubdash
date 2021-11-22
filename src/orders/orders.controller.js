const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function create(req, res) {}

function read(req, res) {}

function update(req, res) {}

function list(req, res) {
  res.json({ data: orders });
}

function destroy(req, res) {}

module.exports = {
  create,
  read,
  update,
  list,
};
