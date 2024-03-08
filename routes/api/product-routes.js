const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  await Product.findAll({
    attributes: ['product_name', 'price', 'stock'],
    include: [{
      model: Tag,
      attributes: ['tag_name'],
      through: 'ProductTag',
    },
    {
      model: Category,
      attributes: ['category_name'],
    }]
  })
  .then((productData) => {res.json(productData)})
  .catch((err) => {res.json(err)})
});

// get one product
router.get('/:id', (req, res) => {
  Product.findByPk(req.params.id, {
    include: [
      {
        model: Tag,
        attributes: ['tag_name'],
        through: 'ProductTag',
      },
      {
        model: Category,
        attributes: ['category_name']
      },
    ]
  })
  .then((oneProduct) => {res.json(oneProduct);})
  .catch((err) => {res.json(err);})
});

// create new product
router.post('/', (req, res) => {
  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    tagIds: [
      {
        include:[
          {
            model: Tag,
            through: ProductTag,
            where: {
              tag_id: req.body.tag_id
            }
          }
        ]
      }
    ]
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then((deletedProduct) => res.json(deletedProduct))
  .catch((err) => {res.json(err);})
});

module.exports = router;