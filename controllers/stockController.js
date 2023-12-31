const dbConnect = require("../database/connection")
const Products = require("../database/models/productModel")

//Méthode pour récuperer le stock d'un produit
async function getStock(nomProduit) {
    try {
        await dbConnect();

        const filter = { name: nomProduit };
        const stock = await Products.findOne(filter);
        if (!stock) {
            throw new Error('Stock introuvable');
        }
        return stock;
    } catch (error) {
        console.error('Erreur lors de la récupération du stock', error);
        throw error;
    }
}
async function ajouterAuStock(nomProduit, quantiteAjoutee, reelOrReserve) {
    try {
        if (typeof quantiteAjoutee !== 'number' || isNaN(quantiteAjoutee)) {
            throw new Error('La quantité ajoutée doit être un nombre');
        }

        const filter = { name: nomProduit };
        const produitInitial = await Products.findOne(filter);

        if (!produitInitial) {
            throw new Error('Produit introuvable');
        }

        let nouveauStockReel = produitInitial.quantityReel;
        let nouveauStockReserve = produitInitial.quantityReserve;

        if (reelOrReserve) {
            if (quantiteAjoutee >= 0) {
                nouveauStockReel += quantiteAjoutee;
            } else {
                nouveauStockReel -= Math.abs(quantiteAjoutee);
            }
        } else {
            if (quantiteAjoutee >= 0) {
                nouveauStockReserve += quantiteAjoutee;
            } else {
                nouveauStockReserve -= Math.abs(quantiteAjoutee);
            }
        }

        const updateFilter = { name: nomProduit };
        const update = {};

        if (reelOrReserve) {
            update.$set = { quantityReel: nouveauStockReel };
        } else {
            update.$set = { quantityReserve: nouveauStockReserve };
        }

        await Products.updateOne(updateFilter, update);
        const updatedProduit = await Products.findOne(filter);

        if (reelOrReserve) {
            return updatedProduit.quantityReel;
        } else {
            return updatedProduit.quantityReserve;
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout au stock', error);
        throw error;
    }
}


module.exports = {
    ajouterAuStock,
    getStock
};
