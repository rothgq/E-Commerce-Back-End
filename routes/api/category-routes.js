const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  await Category.findAll({
    attributes: ['id', 'category_name'],
    include: {
      model: Product,
      attributes: ['product_name'],
    },
  })
  .then((categoryData) => {res.json(categoryData)})
});

router.get('/:id', async (req, res) => {
  await Category.findByPk(req.params.id, {
    attributes: ['id', 'category_name'],
    include: {
      model: Product,
      attributes: ['product_name'],
    },
  })
  .then((categoryData) => {res.json(categoryData)});
});

router.post('/', async (req, res) => {
  await Category.create(req.body)
        .then((newCategory) => res.status(200).json(newCategory))
        .catch((err) => {
          console.log(err);
          res.status(400).json(err);
        })
});

router.put('/:id', async (req, res) => {
  await Category.update(req.body, {
    where: {
      id: req.params.id,
    }
  })
  .then(find => Category.findByPk(req.params.id))
  .then((updatedCategory) => res.status(200).json(updatedCategory))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  })
});

router.delete('/:id', async (req, res) => {
  await Category.destroy({where: {id: req.params.id}})
  .then((deletedCategory) => res.json(`Category removed from Database`))
  .catch((err) => {res.json(err)})
});

module.exports = router;
