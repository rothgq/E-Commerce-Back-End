const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  await Tag.findAll({
    attributes: ['tag_name'],
    include: [{
      model: Product,
      attributes: ['product_name']
    }]
  })
  .then((tagData) => {res.json(tagData);})
  .catch((err) => {res.json(err);})
});

router.get('/:id', (req, res) => {
  Tag.findByPk(req.params.id, {
    include: [{
      model: Product,
      attributes: ['product_name', 'price', 'stock', 'category_id'],
      through: "ProductTag"
    }]
  })
  .then((tagData) => {res.json(tagData);})
  .catch((err) => { res.json(err);})
});

router.post('/', (req, res) => {
  Tag.create({tag_name: req.body.tag_name})
  .then((tag) => {res.json(tag);})
  .catch((err) => {res.json(err);})
});

router.put('/:id', (req, res) => {
  Tag.update({
    tag_name: req.body.tag_name
  },
  {
    where: {
      id: req.params.id
    }
  }
  )
  .then((tag) => {res.json(tag);})
  .catch((err) => {res.json(err);})
});

router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
    .then((tagId) => {res.json(`${tagId} deleted`);})
    .catch((err) => {res.json(err);})
});

module.exports = router;
