const db = require("../../database/models");
const Product = db.Product;
const Category = db.Category;

module.exports = {
  // list: async (req, res) => {
  //   let response = {};
  //   try {
  //     const productosHabilitados = await Product.findAll({ paranoid: true });
  //     response.meta = {
  //       status: 200,
  //       total: productosHabilitados.length,
  //       url: "/api/products",
  //     };
  //     response.data = productosHabilitados;
  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //     response.meta = {
  //       status: 500,
  //       total: null,
  //       url: "/api/products",
  //     };
  //     response.msg = "Oops! Something went wrong while fetching products.";
  //     return res.status(500).json(response);
  //   }
  // },

  list: async (req, res) => {
    let response = {data: {}};
    try {
      const [ productos, categorias ] = await Promise.all([Product.findAll({include: [{association: "categorias"}]}), Category.findAll({include: [{association: "categorias"}]})])
      response.data.count = productos.length
      response.data.countByCategory = {}

      categorias.forEach((categoria) => {
        response.data.countByCategory[categoria.name] = categoria.categorias.length
      })

      response.data.products = productos.map((producto) => {
        return {
          id: producto.id,
          name: producto.name,
          description: producto.description,
          category: producto.categorias.name,
          detail: `/api/products/${producto.id}`,
        }
      })
      return res.json(response)

    } catch (e) {
      response.msg = "Hubo un error"
      return res.json(response)
    }
  },



  detail: async (req, res) => {
    let response = {};
    try {
      const findProduct = await Product.findByPk(req.params.id, {include: [{association: "categorias"}]});
      response.meta = {
        status: 200,
        url: `/api/products/${req.params.id}`,
      };
      response.data = findProduct;
      response.data.image = `/public/img/${findProduct.image}`

      return res.json(response);
    } catch (error) {
      console.error("Error finding product:", error);
      response.meta = {
        status: 500,
        url: `/api/products/${req.params.id}`,
      };
      response.msg = `Oops! Something went wrong while finding the product with ID: ${req.params.id}.`;
      return res.status(500).json(response);
    }
  },

  create: async (req, res) => {
    let response = {};
    try {
      const productoCrear = await Product.create({
        name: req.body.product,
        category_id: req.body.category,
        price: req.body.price,
        description: req.body.desc,
        image: req.file ? req.file.filename : "product-default.png",
      });
      response.meta = {
        status: 201,
        url: "/api/products/create",
      };
      response.data = productoCrear;
      return res.json(response);
    } catch (error) {
      console.error("Error creating product:", error);
      response.meta = {
        status: 500,
        url: "/api/products/create",
      };
      response.msg =
        "Oops! Something went wrong while creating the product. Please try again later.";
      return res.status(500).json(response);
    }
  },
  edit: async (req, res) => {
    try {
      let response = {};
      let productId = req.params.id;
      let promProduct = await Product.findByPk(productId);
      let categories = await Category.findAll();

      let [productoToEdit, categoriesList] = await Promise.all([
        promProduct,
        categories,
      ]);

      response.meta = {
        status: 200,
        url: `/api/products/edit/${req.params.id}`,
      };
      response.data = {
        productoToEdit: productoToEdit,
        categoriesList: categoriesList
      };
      return res.json(response);
    } catch (error) {
      console.error("Error finding product:", error);
      response.meta = {
        status: 500,
        url: `/api/products/edit/${req.params.id}`,
      };
      response.msg = `Oops! Something went wrong while finding the product with ID: ${req.params.id}.`;
      return res.status(500).json(response);
    }
  },
  update: async (req, res) => {
    try {
      let response = {};
      let productId = req.params.id;
      const editProduct = await Product.update(
        {
          name: req.body.product,
          category_id: req.body.category,
          price: req.body.price,
          description: req.body.desc,
          image: req.file ? req.file.filename : "product-default.png",
        },

        {
          where: { id: productId },
        }
      );
      response.meta = {
        status: 201,
        url: `/api/products/edit/${req.params.id}`,
      };
      response.msg = `Product successfully updated!`;
      return res.json(response);
    } catch (error) {
      console.error("Error creating product:", error);
      response.meta = {
        status: 500,
        url: `/api/products/edit/${req.params.id}`,
      };
      response.msg =
        "Oops! Something went wrong while updating the product. Please try again later.";
      return res.status(500).json(response);
    }
  },

  destroy: async (req, res) => {
    let response = {};
    try {
      let productId = req.params.id;
      const deleteProduct = await Product.destroy({
        where: { id: productId },
        force: false,
      });
      if (deleteProduct) {
        response.meta = {
          status: 200,
          url: `/api/products/delete/${productId}`,
        };
        response.msg = "Product successfully deleted!";
      } else {
        response.meta = {
          status: 404,
          url: `/api/products/delete/${productId}`,
        };
        response.msg = "Product not found for deletion.";
      }
      return res.json(response);
    } catch (error) {
      console.error("Error deleting product:", error);
      response.meta = {
        status: 500,
        url: `/api/products/delete/${productId}`,
      };
      response.msg =
        "Oops! Something went wrong while deleting the product. Please try again later.";
      return res.status(500).json(response);
    }
  },
};
