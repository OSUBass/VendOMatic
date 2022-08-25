const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const cors = require('cors')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.enable('trust proxy');
app.use(cors())



//const drinkCost = 2;        // cost of drinks (in quarters/coins)
const initialStock = 5;         // initial stock of drinks


class Inventory{
    constructor(){
        this.allDrinks = {};
    }

    //allDrinks.id = {info}
    let drinkinfo = allDrinks[id].inStock
    getDrinkInventory(){
        let eachInventory = [];

        this.allDrinks.forEach((item) => {
            eachInventory.push(item.inStock)
        })
        return eachInventory;
    }

    addDrink(item){
        this.allDrinks[item]
    }
}


class Drink{
    constructor(id, cost){
        this.id = id;
        this.cost = cost;
        this.inStock = initialStock;
    }

    // returns # of items in stock
    getItemStock(){
        return this.inStock;
    }

    // reduces item in stock by 1 and returns current quantity now in stock
    ItemPurchased(){
        this.inStock -=1
        return this.inStock;
    }
}


class Transaction{
    constructor(){
        this.money = 0;
    }

    // returns total coins paid so far during transaction
    getCoins(){
        return this.coins;
    }

    // resets coins recieved to 0
    resetCoins(){
        this.coins = 0;
    }

    // adds # of coins inserted into machine to total coins paid during transaction so far
    addCoins(cost){
        this.coins += cost;
    }
    
    // subtracts drink cost from # of coins deposited and returns # of coins to refund.
    payment(){
        this.coins -= drinkCost;
        return this.coins;
    }
}

function findID(id){
    curInventory.allDrinks.find(drink => drink.id === parseInt(id))
}


let curTransaction = new Transaction();
let curInventory = new Inventory();
curInventory.addDrink(new Drink(1, 1))
curInventory.addDrink(new Drink(2, .50))
curInventory.addDrink(new Drink(3, 1))

/*********************************************************************************************
*****************************************Routes***********************************************
*********************************************************************************************/

// route to add coins to machine. # of coins currently deposited set in response header
app.put('/', function(req,res){
    let numCoin = req.body.coin;
    curTransaction.addCoins(numCoin);
    res.set("X-Coins", curTransaction.getCoins());
    res.status(204).end();
})

// route returns all coins currently deposited. # of coins returned set in response header
app.delete('/', function(req,res){
    let coinsReturned = curTransaction.getCoins()
    curTransaction.resetCoins()
    res.set("X-Coins", coinsReturned);
    res.status(204).end();
})

// route returns an array of remaining drink quantities(integers) in res body
app.get('/inventory', function(req, res){
    let inventoryCheck = curInventory.getDrinkInventory();
    res.status(200).json(inventoryCheck);
});

// route returns quantity of a specific item in inventory
app.get('/inventory/:id', function (req,res){
    let id = req.params.id
    let item = curInventory.allDrinks.find(drink => drink.id === parseInt(id))
    let itemQty = item.getItemStock();
    res.status(200).json(itemQty);
});

// route when purchase is attempted
app.put('/inventory/:id', function(req, res){
    let id = req.params.id
    let item = findID(id)
    let coinsPaid = curTransaction.getCoins();
    let itemQty = item.getItemStock();
    
    // if item is out of stock, # of coins deposited set in response header
    if (itemQty < 1){
        res.set("X-Coins", curTransaction.getCoins());
        res.status(404).end();
    
    // if payment is insufficient. # of coins deposited set in response header
    }else if(coinsPaid < drinkCost){
        res.set("X-Coins", curTransaction.getCoins());
        res.status(403).end();
    
    /* if vend is successful: 
        total # of the item id vended since the initial stock is set in res body; 
        # of coins to return to customer set in response header;
        # of vended item remaining in stock set in response header;
    */
    }else{
        // cost of drink subtracted from deposited coins & coins deposited reset to 0 for transaction
        let coinsToReturn =curTransaction.payment()
        curTransaction.resetCoins();
        
        // reduce stock of drink
        itemQty = item.ItemPurchased();

        let numItemsVended = initialStock - itemQty;
        
        res.set("X-Coins", coinsToReturn);
        res.set("X-Inventory-Remaining", itemQty); 
        res.status(200).json({"quantity" : numItemsVended})
    }
})


// Listen to the specified port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});