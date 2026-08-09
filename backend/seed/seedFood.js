/**
 * One-time / re-runnable seed script.
 *
 * WHY THIS EXISTS:
 * The original 32 food items only ever lived as a hardcoded `food_list`
 * array in userfrontend/src/assets/assets.js (leftover from before the
 * backend existed). They were never written to MongoDB. The matching
 * images ARE already sitting in backend/uploads/ (each filename ends in
 * the original "food_<n>.png" name), so we reuse those files as-is
 * instead of re-uploading anything.
 *
 * This script is SAFE TO RE-RUN: it skips any item whose `name` already
 * exists in the food collection, so it will never create duplicates.
 *
 * Usage (from backend/):
 *   npm run seed
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const connectDB = require('../config/dbConn')
const foodModel = require('../models/foodModel')

// The original catalog, extracted from userfrontend/src/assets/assets.js.
// `imageKey` matches the "food_<n>" suffix used in the original uploaded
// filenames stored in backend/uploads/.
const foodItems = [
    { imageKey: "food_1", name: "Greek salad", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { imageKey: "food_2", name: "Veg salad", price: 180, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { imageKey: "food_3", name: "Clover Salad", price: 160, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { imageKey: "food_4", name: "Chicken Salad", price: 240, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { imageKey: "food_5", name: "Lasagna Rolls", price: 140, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { imageKey: "food_6", name: "Peri Peri Rolls", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { imageKey: "food_7", name: "Chicken Rolls", price: 200, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { imageKey: "food_8", name: "Veg Rolls", price: 150, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { imageKey: "food_9", name: "Ripple Ice Cream", price: 140, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { imageKey: "food_10", name: "Fruit Ice Cream", price: 220, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { imageKey: "food_11", name: "Jar Ice Cream", price: 100, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { imageKey: "food_12", name: "Vanilla Ice Cream", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { imageKey: "food_13", name: "Chicken Sandwich", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { imageKey: "food_14", name: "Vegan Sandwich", price: 180, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { imageKey: "food_15", name: "Grilled Sandwich", price: 160, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { imageKey: "food_16", name: "Bread Sandwich", price: 240, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { imageKey: "food_17", name: "Cup Cake", price: 140, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { imageKey: "food_18", name: "Vegan Cake", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { imageKey: "food_19", name: "Butterscotch Cake", price: 200, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { imageKey: "food_20", name: "Sliced Cake", price: 150, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { imageKey: "food_21", name: "Garlic Mushroom", price: 140, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { imageKey: "food_22", name: "Fried Cauliflower", price: 220, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { imageKey: "food_23", name: "Mix Veg Pulao", price: 100, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { imageKey: "food_24", name: "Rice Zucchini", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { imageKey: "food_25", name: "Cheese Pasta", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { imageKey: "food_26", name: "Tomato Pasta", price: 180, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { imageKey: "food_27", name: "Creamy Pasta", price: 160, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { imageKey: "food_28", name: "Chicken Pasta", price: 240, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { imageKey: "food_29", name: "Buttter Noodles", price: 140, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
    { imageKey: "food_30", name: "Veg Noodles", price: 120, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
    { imageKey: "food_31", name: "Somen Noodles", price: 200, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
    { imageKey: "food_32", name: "Cooked Noodles", price: 150, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
]

const uploadsDir = path.join(__dirname, '..', 'uploads')

// Build a map from "food_<n>" -> actual filename on disk, e.g.
// "food_1" -> "1779913565318food_1.png"
function buildImageFileMap() {
    const files = fs.readdirSync(uploadsDir)
    const map = {}
    for (const file of files) {
        const match = file.match(/(food_\d+)\.png$/i)
        if (match) {
            map[match[1]] = file
        }
    }
    return map
}

async function seed() {
    await connectDB()

    const existingCount = await foodModel.countDocuments()
    console.log(`Existing food documents in DB: ${existingCount}`)

    const imageFileMap = buildImageFileMap()

    const existingNames = new Set(
        (await foodModel.find({}, 'name')).map(doc => doc.name)
    )

    const toInsert = []
    const skippedNoImage = []

    for (const item of foodItems) {
        if (existingNames.has(item.name)) {
            continue // already seeded, skip (idempotent)
        }
        const actualFilename = imageFileMap[item.imageKey]
        if (!actualFilename) {
            skippedNoImage.push(item.imageKey)
            continue
        }
        toInsert.push({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: actualFilename,
        })
    }

    if (skippedNoImage.length) {
        console.warn(`Skipped (no matching image file in backend/uploads): ${skippedNoImage.join(', ')}`)
    }

    if (toInsert.length === 0) {
        console.log('Nothing to insert — database already has these items.')
    } else {
        await foodModel.insertMany(toInsert)
        console.log(`Inserted ${toInsert.length} food item(s).`)
    }

    const finalCount = await foodModel.countDocuments()
    console.log(`Total food documents in DB now: ${finalCount}`)

    process.exit(0)
}

seed().catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
})
