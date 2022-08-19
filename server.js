const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const cors = require('cors')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.enable('trust proxy');
app.use(cors())



const drinkCost = 2;        // cost of drinks in coins
const initialStock = 5;         // initial stock of drinks
let allDrinks = [];


class Transaction{
    constructor(){
        this.coins = 0;
    }

    // resets coins recieved to 0
    resetCoins(){
        this.coins = 0;
    }

    // adds # of coins inserted into machine to total coins paid during transaction so far
    addCoins(num){
        this.coins += num;
    }

    // returns total coins paid so far during transaction
    getCoins(){
        return this.coins;
    }
    
    // subtracts drink cost from # of coins deposited and returns # of coins to refund.
    payment(){
        this.coins -= drinkCost;
        return this.coins;
    }
}



class Drink{
    constructor(){
        this.inStock = initialStock;
        allDrinks.push(this)
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


// returns # of items in stock for all drinks
function getInventory(){
    let drinkInventory = []
    for(let drink of allDrinks){
        drinkInventory.push(drink.getItemStock())
    }
    return drinkInventory;
}


let curTransaction = new Transaction();
let drink1 = new Drink();
let drink2 = new Drink();
let drink3 = new Drink();

/*********************************************************************************************
*****************************************Routes***********************************************
*********************************************************************************************/

// route to add coins to machine.
app.put('/', function(req,res){
    let numCoin = req.body.coin;
    curTransaction.addCoins(numCoin);
    res.set("X-Coins", curTransaction.getCoins());
    res.status(204).end();
})

// route returns all coins currently deposited
app.delete('/', function(req,res){
    let coinsReturned = curTransaction.returnCoins()
    curTransaction.resetCoins()
    res.set("X-Coins", coinsReturned);
    res.status(204).end();
})

// route returns an array of remaining drink quantities(integers)
app.get('/inventory', function(req, res){
    let inventoryCheck = getInventory();
    res.status(200).json(inventoryCheck);
});

// route returns quantity of a specific item in inventory
app.get('/inventory/:id', function (req,res){
    let id = req.params.id
    let itemQty = allDrinks[id-1].getItemStock();
    res.status(200).json(itemQty);
});

// route when purchase is attempted
app.put('/inventory/:id', function(req, res){
    let id = req.params.id
    let coinsPaid = curTransaction.getCoins();
    let itemQty = allDrinks[id-1].getItemStock();
    
    // if item is out of stock
    if (itemQty < 1){
        res.set("X-Coins", curTransaction.getCoins());
        res.status(404).end();
    
    // if attempt to purchase is made but payment is insufficient
    }else if(coinsPaid < drinkCost){
        res.set("X-Coins", curTransaction.getCoins());
        res.status(403).end();
    
    // if vend is successful
    }else{
        // subtract cost of drink from deposited coins & reset coins to 0 for transaction
        let coinsToReturn =curTransaction.payment()
        curTransaction.resetCoins();
        
        // reduce stock of drink
        itemQty = allDrinks[id-1].ItemPurchased();

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